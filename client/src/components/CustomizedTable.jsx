import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import jsPDF from "jspdf";
// eslint-disable-next-line no-unused-vars
import autoTable from "jspdf-autotable";

import Select from "react-select";

import { toast, ToastContainer } from "react-toastify";
// import { confirmAlert } from "react-confirm-alert";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import "react-toastify/dist/ReactToastify.css";

// import { clearMetaData } from "../redux/reducers/tableSlice";
import EditableTable from "./EditableTable";
import { setMetaData, storeTableData } from "../redux/reducers/tableSlice";
import Modal from "react-modal";

export default function CustomizedTable() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const node_server_url = import.meta.env.VITE_NODE_SERVER_URL;

  const { table } = useSelector((state) => state.table);
  const { token } = useSelector((state) => state.auth);
  const { metaData } = useSelector((state) => state.table);

  const [selectedCategory, setselectedCategory] = useState();
  const [selectedTable, setSelectedTable] = useState();
  const [tableData, setTableData] = useState();

  const [comment, setComment] = useState("");
  const [rowNumber, setRowNumber] = useState(0);
  const [tableName, setTableName] = useState("");
  const [column, setColumn] = useState("");
  const [clickedButton, setClickedButton] = useState("");

  const [enableReview, setEnableReview] = useState(true);

  const categoryOptions = Object.keys(table).map((category) => ({
    value: category,
    label: category,
  }));

  const handleCategoryChange = (selectedOption) => {
    setselectedCategory(selectedOption.value);
  };

  useEffect(() => {
    if (Object.keys(table).length > 0) {
      setselectedCategory(Object.keys(table)[0]);
      setTableData(table);
    }
  }, [table]);

  useEffect(() => {
    if (tableData && selectedCategory !== null) {
      setSelectedTable(tableData[selectedCategory]);
    }
  }, [tableData, selectedCategory]);

  useEffect(() => {
    if (selectedTable) {
      console.log("selected Table", selectedTable);
      setTableData((currentTableData) => ({
        ...currentTableData,
        [selectedCategory]: selectedTable,
      }));
      const tableList = Object.keys(selectedTable);
      let uncheckedCount = 0;
      tableList.map((tableName) => {
        tableName !== "status" &&
          tableName !== "version" &&
          tableName !== "comment" &&
          tableName !== "resultTOB" &&
          selectedTable[tableName].map((row) => {
            if (row.Reviewed === false) uncheckedCount = uncheckedCount + 1;
          });
      });
      if (uncheckedCount !== 0) {
        setEnableReview(false);
      } else {
        setEnableReview(true);
      }
    }
  }, [selectedTable]);

  // Manage Table
  // Function to handle changes in input fields
  const handleEdit = (tableName, value, index, fieldName) => {
    setSelectedTable((currentTableData) => ({
      ...currentTableData,
      [tableName]: currentTableData[tableName].map((row, rowIndex) => {
        if (rowIndex === index) {
          const updatedRow = {
            ...row,
            [fieldName]: value,
          };
          updatedRow.status =
            updatedRow["benefit"] === updatedRow["New Benefit"] &&
            updatedRow["limit"] === updatedRow["New Limit"]
              ? "checked"
              : "unchecked";

          return updatedRow;
        }
        return row;
      }),
    }));
  };

  // const handleFocusCell = (tableName, rowIndex) => {
  //   setSelectedTable((currentTableData) => ({
  //     ...currentTableData,
  //     [tableName]: currentTableData[tableName].map((row, index) => {
  //       if (index === rowIndex) {
  //         const updatedRow = { ...row };
  //         if (
  //           !updatedRow["New Benefit"] ||
  //           updatedRow["New Benefit"].trim() === ""
  //         ) {
  //           updatedRow["New Benefit"] = row["benefit"];
  //           if (
  //             !updatedRow["New Limit"] ||
  //             updatedRow["New Limit"].trim() === ""
  //           ) {
  //             updatedRow["New Limit"] = row["limit"];
  //           }
  //         }
  //         return updatedRow;
  //       }
  //       return row;
  //     }),
  //   }));
  // };
  const handleNewRow = (tableName, rowIndex) => {
    setSelectedTable((currentTableData) => ({
      ...currentTableData,
      [tableName]: [
        ...currentTableData[tableName].slice(0, rowIndex + 1),
        {
          benefit: "",
          limit: "",
          color: "yellow",
          edit: false,
          "New Benefit": "",
          "New Limit": "",
          EditReason: "",
          ReviewRequired: false,
          Reviewed: false,
          ReviewComment: "",
        },
        ...currentTableData[tableName].slice(rowIndex + 1, -1),
      ],
    }));
  };

  const handleConfirm = (tableName, rowIndex, column) => {
    setSelectedTable((currentTableData) => ({
      ...currentTableData,
      [tableName]: currentTableData[tableName].map((row, index) => {
        if (rowIndex === index) {
          if (row[column] === false) {
            setIsOpen(true);
            setRowNumber(rowIndex);
            setTableName(tableName);
            setColumn(column);
          }
        }
        return row;
      }),
    }));
  };

  const handleDeleteRow = (tableName, rowIndex) => {
    setSelectedTable((currentTableData) => ({
      ...currentTableData,
      [tableName]: currentTableData[tableName].filter(
        (row, index) => index !== rowIndex
      ),
    }));
    toast.success("Successfuly deleted you selected");
  };

  const handleClickStatusChangeButton = (buttonName) => {
    setClickedButton(buttonName);
    setIsOpen(true);
  };

  // const updateCategoryStatusAndVersion = async (newStatus) => {
  //   const tempData = {
  //     ...tableData,
  //     [selectedCategory]: {
  //       ...tableData[selectedCategory],
  //       status: newStatus,
  //       version: tableData[selectedCategory].version + 1,
  //     },
  //   };
  //   setSelectedTable(tempData[selectedCategory]);
  //   update(tempData);
  // };

  const handleReview = async () => {
    setIsOpen(false);
    const tempData = {
      ...tableData,
      [selectedCategory]: {
        ...tableData[selectedCategory],
        status: "Reviewed",
        comment: comment || "",
      },
    };
    update(tempData);
    setComment("");
    toast.success("Successfuly Reviewed!!!", {
      position: "top-right",
    });
  };

  const handleGenerate = async (fileName) => {
    setIsOpen(false);
    const tempData = {
      ...tableData,
      [selectedCategory]: {
        ...tableData[selectedCategory],
        resultTOB: fileName,
        status: "Generated",
        comment: comment || "",
        version: tableData[selectedCategory].version + 1,
      },
    };
    setComment("");
    setSelectedTable(tempData[selectedCategory]);
    update(tempData);
  };

  const handleRevise = async () => {
    setIsOpen(false);
    const tempData = {
      ...tableData,
      [selectedCategory]: {
        ...tableData[selectedCategory],
        status: "Revised",
        comment: comment || "",
        version: tableData[selectedCategory].version + 1,
      },
    };
    setComment("");
    setSelectedTable(tempData[selectedCategory]);
    update(tempData);

    toast.success("Successfuly Revised!!!", {
      position: "top-right",
    });
  };

  const handleSaveCommentForRow = async () => {
    setIsOpen(false);
    setSelectedTable((currentTableData) => ({
      ...currentTableData,
      [tableName]: currentTableData[tableName].map((row, index) => {
        if (index === rowNumber && column === "edit") {
          return {
            ...row,
            ["New Benefit"]: row["benefit"],
            ["New Limit"]: row["limit"],
            edit: true,
            ReviewRequired: true,
            EditReason: comment,
          };
        } else if (index === rowNumber && column === "Reviewed") {
          return {
            ...row,
            Reviewed: true,
            ReviewComment: comment,
          };
        } else {
          return row;
        }
      }),
    }));
    setComment("");
    setTableName("");
    setRowNumber(null);
    setColumn("");
  };

  // const handleDelete = async () => {
  //   confirmAlert({
  //     title: "Confirm!",
  //     message: "Are you sure to do this.",
  //     buttons: [
  //       {
  //         label: "Yes",
  //         onClick: async () => {
  //           deleteProcess();
  //         },
  //       },
  //       {
  //         label: "No",
  //         onClick: () => console.log("no"),
  //       },
  //     ],
  //   });
  // };

  // const deleteProcess = async () => {
  //   try {
  //     const response = await fetch(`${node_server_url}/api/table/delete`, {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "x-auth-token": token, // Assuming Bearer scheme for auth tokens
  //         "ngrok-skip-browser-warning": true,
  //       },
  //       body: JSON.stringify({ uuid: metaData.uuid }),
  //     });

  //     if (response.ok) {
  //       dispatch(clearMetaData());
  //       toast.success("Successfully Deleted!", {
  //         position: "top-right",
  //         autoClose: 1000,
  //       });
  //       navigate("/home");
  //     } else {
  //       // Handle non-2xx responses here
  //       const errorData = await response.json();
  //       console.error(
  //         "Error:",
  //         response.status,
  //         response.statusText,
  //         errorData
  //       );
  //       toast.error(`Deletion failed: ${errorData.message}`, {
  //         position: "top-right",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Fetch Error:", error);
  //     toast.error("Deletion failed due to a network error.", {
  //       position: "top-right",
  //     });
  //   }
  // };

  function capitalizeFirstLetter(word) {
    if (word && typeof word === "string") {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word;
  }

  const handleSaveToPDF = async () => {
    const doc = new jsPDF();

    const addSectionToPDF = (title, data, pdfColumns) => {
      pdfColumns = pdfColumns.filter((col) => data.some((item) => item[col]));
      const headers = pdfColumns.map((header) => capitalizeFirstLetter(header));
      if (Array.isArray(data) && data.length > 0) {
        doc.text(title, 20, 20);
        doc.autoTable({
          startY: 40,
          head: [headers],
          body: data.map((item) =>
            pdfColumns.map((col) => item[col]?.toString() || "")
          ),
          margin: { top: 20 },
        });
        doc.addPage();
      } else {
        console.error(
          `No data provided for title "${title}", skipping section.`
        );
      }
    };

    const titleMap = [
      "General Benefit",
      "In Patient Benefit",
      "Other Benefit",
      "Out Patient Benefit",
    ];

    const columns = ["benefit", "limit", "New Benefit", "New Limit"];

    titleMap.forEach((title) => {
      const sectionData =
        tableData[selectedCategory] && tableData[selectedCategory][title];
      if (sectionData) {
        addSectionToPDF(title, sectionData, columns);
      } else {
        console.error(
          `No data found for category "${selectedCategory}" and title "${title}". Skipping this section.`
        );
      }
    });

    const fileName = `${
      metaData.client
    }-${selectedCategory}-${new Date().toISOString()}`;
    doc.save(`${fileName}.pdf`);

    await handleGenerate(fileName);

    toast.success("Successfully generated!", {
      position: "top-right",
    });
  };

  const handleSaveToCSV = async () => {
    const addSectionToCSV = (title, data, csvColumns) => {
      csvColumns = csvColumns.filter((col) => data.some((item) => item[col]));
      const headers = csvColumns.map((header) => capitalizeFirstLetter(header));

      if (Array.isArray(data) && data.length > 0) {
        let csvContent = `"${title}"\n`;
        csvContent += headers.join(",") + "\n";
        csvContent +=
          data
            .map((item) =>
              csvColumns
                .map((col) => `"${String(item[col]).replace(/"/g, '""')}"`)
                .join(",")
            )
            .join("\n") + "\n\n";

        return csvContent;
      } else {
        console.error(
          `No data provided for title "${title}", skipping section.`
        );
        return "";
      }
    };

    const titleMap = [
      "General Benefit",
      "In Patient Benefit",
      "Other Benefit",
      "Out Patient Benefit",
    ];

    const columns = ["benefit", "limit", "New Benefit", "New Limit"];

    let csvData = "data:text/csv;charset=utf-8,";

    // Iterate over each section to append its respective data
    titleMap.forEach((title) => {
      const sectionData =
        tableData[selectedCategory] && tableData[selectedCategory][title];

      if (sectionData) {
        csvData += addSectionToCSV(title, sectionData, columns);
      } else {
        console.error(
          `No data found for category "${selectedCategory}" and title "${title}". Skipping this section.`
        );
      }
    });

    // Use the same file-naming convention as saveToPDF
    const fileName = `${
      metaData.client
    }-${selectedCategory}-${new Date().toISOString()}.csv`;

    // Encode the entire CSV data
    const encodedUri = encodeURI(csvData);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);

    await handleGenerate(fileName);

    toast.success("Successfully generated CSV!", {
      position: "top-right",
    });
  };

  const update = async (temp) => {
    try {
      const response = await fetch(`${node_server_url}/api/table/update`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-auth-token": token, // Include the token in the Authorization header
          "ngrok-skip-browser-warning": true,
        },
        body: JSON.stringify({
          uuid: metaData.uuid,
          tableData: temp,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        const { metaData, newTableData } = result;
        dispatch(setMetaData(metaData));
        dispatch(storeTableData(newTableData));
      } else {
        console.error("Error:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const handleCommentForCategory = () => {
    if (!clickedButton) return;
    console.log("Clicked Button in handle Functin", clickedButton);
    switch (clickedButton) {
      case "handleReview":
        handleReview();
        break;
      case "handleGenerate":
        handleGenerate();
        break;
      case "handleSaveToPDF":
        handleSaveToPDF();
        break;
      case "handleSaveToCSV":
        handleSaveToCSV(); // Assuming this is typo, it should match the function name
        break;
      case "handleRevise":
        handleRevise();
        break;
      default:
        setIsOpen(false);
    }
  };

  const handleClose = () => {
    navigate("/tb/dbtable");
  };

  // const getEndPoint = () => {
  //   const currentHref = window.location.href;
  //   const parsedUrl = new URL(currentHref);
  //   const pathSegments = parsedUrl.pathname
  //     .split("/")
  //     .filter((segment) => segment);
  //   return pathSegments[pathSegments.length - 1];
  // };

  // const endPoint = getEndPoint();

  const [modalIsOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
    setTableName("");
  }

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };

  const titleMap = [
    "General Benefit",
    "In patient Benefit",
    "Out Patient Benefit",
    "Other Benefit",
  ];

  Modal.setAppElement("#root");

  return (
    <div className="w-full flex flex-col mt-8">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
      >
        <div className="w-full flex flex-col items-center gap-4">
          {column !== "" && column === "edit" ? (
            <h2 className="text-2xl">Edit</h2>
          ) : column !== "" && column === "Reviewed" ? (
            <h2 className="text-2xl">Review</h2>
          ) : (
            ""
          )}
          <textarea
            name="comment"
            id="comment"
            cols="30"
            rows="10"
            placeholder={
              column !== "" && column === "edit" ? "Reason for Editing" : ""
            }
            value={comment}
            autoFocus
            className="w-full h-24 p-2 border border-gray-300 focus:outline-none"
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="bg-gray-200 px-2 py-1 rounded-md"
              onClick={
                tableName !== ""
                  ? handleSaveCommentForRow
                  : handleCommentForCategory
              }
            >
              Comment
            </button>
            <button
              className="bg-gray-200 px-2 py-1 rounded-md"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
      <ToastContainer />
      <div className="flex items-end gap-8">
        <div className="w-full md:w-2/3 lg:w-1/2 flex flex-col">
          <label htmlFor="category" className="font-bold">
            Category
          </label>
          <Select
            id="category"
            options={categoryOptions}
            onChange={handleCategoryChange}
            value={categoryOptions.find(
              (option) => option.value === selectedCategory
            )}
            className=""
          />
        </div>

        <span className="mb-2">
          <b>Status:</b> {tableData && tableData[selectedCategory].status}
        </span>
        <span className="mb-2">
          <b>Version:</b> {tableData && tableData[selectedCategory].version}
        </span>
      </div>

      {/* Table Group */}
      <div className="w-full flex flex-col gap-4 my-4">
        {selectedTable &&
          titleMap.map((tableName, index) => {
            let table = Object.values(selectedTable[tableName]);
            return (
              <div
                key={index}
                className="w-full p-8 bg-white flex flex-col items-start"
              >
                <h1 className="text-3xl text-black font-bold m-4">
                  {tableName}
                </h1>
                <EditableTable
                  tableName={tableName}
                  tableData={table}
                  handleEdit={handleEdit}
                  newRow={handleNewRow}
                  handleConfirm={handleConfirm}
                  handleDelete={handleDeleteRow}
                />
              </div>
            );
          })}
      </div>

      <div className="flex gap-4 my-8">
        {selectedTable &&
          enableReview &&
          (selectedTable.status === "Processed" ||
            selectedTable.status === "Revised") && (
            <button
              onClick={() => handleClickStatusChangeButton("handleReview")}
              className="w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none"
            >
              Review
            </button>
          )}

        {selectedTable &&
          selectedTable.status === "Reviewed" &&
          selectedTable.status !== "Generated" && (
            <div className="relative">
              <Menu
                menuButton={
                  <MenuButton className="w-48 h-12 bg-indigo-600 text-white hover:bg-indigo-500 flex justify-center items-center focus:outline-none border-none">
                    Generate
                  </MenuButton>
                }
                transition
                gap={8}
                align="end"
              >
                <MenuItem
                  onClick={() =>
                    handleClickStatusChangeButton("handleSaveToPDF")
                  }
                  className="flex justify-center"
                >
                  Save to PDF
                </MenuItem>
                <MenuItem
                  className="flex justify-center"
                  onClick={() =>
                    handleClickStatusChangeButton("handleSaveToCSV")
                  }
                >
                  Save to CSV
                </MenuItem>
              </Menu>
            </div>
          )}

        {selectedTable && selectedTable.status === "Generated" && (
          <button
            onClick={() => handleClickStatusChangeButton("handleRevise")}
            className="w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none"
          >
            Revise
          </button>
        )}

        {/* {endPoint !== "view" && (
          <button
            onClick={handleDelete}
            className="w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none"
          >
            Delete
          </button>
        )} */}

        <button
          onClick={handleClose}
          className="w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none"
        >
          Close
        </button>
      </div>
    </div>
  );
}
