import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import jsPDF from "jspdf";

// import autoTable from "jspdf-autotable";
import Select from "react-select";

import { toast, ToastContainer } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import "react-toastify/dist/ReactToastify.css";

import { clearMetaData } from "../redux/reducers/tableSlice";
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
          selectedTable[tableName].map((row) => {
            if (row.status === "unchecked") uncheckedCount = uncheckedCount + 1;
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

  const handleFocusCell = (tableName, rowIndex) => {
    setSelectedTable((currentTableData) => ({
      ...currentTableData,
      [tableName]: currentTableData[tableName].map((row, index) => {
        if (index === rowIndex) {
          let columns = Object.keys(row);
          const updatedRow = { ...row };
          if (
            !updatedRow["New Benefit"] ||
            updatedRow["New Benefit"].trim() === ""
          ) {
            updatedRow["New Benefit"] = row[columns[0]];
            if (
              !updatedRow["New Limit"] ||
              updatedRow["New Limit"].trim() === ""
            ) {
              updatedRow["New Limit"] = row[columns[1]];
            }
          }
          return updatedRow;
        }
        return row;
      }),
    }));
  };

  const handleConfirm = (tableName, rowIndex) => {
    setSelectedTable((currentTableData) => ({
      ...currentTableData,
      [tableName]: currentTableData[tableName].map((row, index) => {
        if (rowIndex === index) {
          if (row.status === "unchecked") {
            setIsOpen(true);
            setRowNumber(rowIndex);
            setTableName(tableName);
          }
          return {
            ...row,
            status: row.status === "checked" ? "unchecked" : "checked",
          };
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
      case "handleSaveToSVG":
        handleSaveToCSV(); // Assuming this is typo, it should match the function name
        break;
      case "handleRevise":
        handleRevise();
        break;
      default:
        setIsOpen(false);
    }
  };

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

  const handleGenerate = async () => {
    setIsOpen(false);
    const tempData = {
      ...tableData,
      [selectedCategory]: {
        ...tableData[selectedCategory],
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
        if (index === rowNumber) {
          return {
            ...row,
            comment: comment,
          };
        }
        return row;
      }),
    }));

    setComment("");
    setTableName("");
    setRowNumber(null);
  };

  const handleDelete = async () => {
    confirmAlert({
      title: "Confirm!",
      message: "Are you sure to do this.",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            deleteProcess();
          },
        },
        {
          label: "No",
          onClick: () => console.log("no"),
        },
      ],
    });
  };

  const deleteProcess = async () => {
    try {
      const response = await fetch(`${node_server_url}/api/table/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token, // Assuming Bearer scheme for auth tokens
          "ngrok-skip-browser-warning": true,
        },
        body: JSON.stringify({ uuid: metaData.uuid }),
      });

      if (response.ok) {
        dispatch(clearMetaData());
        toast.success("Successfully Deleted!", {
          position: "top-right",
          autoClose: 1000,
        });
        navigate("/home");
      } else {
        // Handle non-2xx responses here
        const errorData = await response.json();
        console.error(
          "Error:",
          response.status,
          response.statusText,
          errorData
        );
        toast.error(`Deletion failed: ${errorData.message}`, {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Deletion failed due to a network error.", {
        position: "top-right",
      });
    }
  };

  const handleSaveToPDF = async () => {
    await handleGenerate();

    // const tableData = Object.values(selectedTable).slice(0, -1);
    // const doc = new jsPDF();

    // const addSectionToPDF = (title, data, pdfColumns) => {
    //   doc.addPage();
    //   doc.text(title, 20, 20);
    //   doc.autoTable({
    //     startY: 40,
    //     head: [pdfColumns],
    //     body: data.map((item) =>
    //       pdfColumns.map((col) => item[col]?.toString() || "")
    //     ),
    //     margin: { top: 30 },
    //   });
    // };

    // const titleMap = [
    //   "General Benefit",
    //   "In Patient Benefit",
    //   "Other Benefit",
    //   "Out Patient Benefit",
    // ];

    // tableData.forEach((sectionData, index) => {
    //   if (sectionData.length > 0) {
    //     const title = titleMap[index];
    //     addSectionToPDF(title, sectionData, Object.keys(sectionData[0]));
    //   }
    // });
    // const fileName = `${metaData.client}-${new Date().toISOString()}`;
    // doc.save(`${fileName}.pdf`);

    toast.success("Successfully generated!", {
      position: "top-right",
    });
  };

  const handleSaveToCSV = async () => {
    await handleGenerate();

    const tableData = Object.values(selectedTable).slice(0, -1);

    const convertToCSV = (arr) => {
      return arr
        .map((row) =>
          Object.values(row)
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");
    };

    let csvContent = "data:text/csv;charset=utf-8,";
    tableData.forEach((sectionData, index) => {
      if (sectionData.length > 0) {
        const sectionTitles = [
          "General Benefit",
          "In Patient Benefit",
          "Other Benefit",
          "Out Patient Benefit",
        ];
        const headers = Object.keys(sectionData[0]);
        csvContent += `${sectionTitles[index]}\n`;
        csvContent += headers.join(",") + "\n";
        csvContent += convertToCSV(sectionData) + "\n\n";
      }
    });

    const fileName = createFileNameWithPrefix(metaData.client);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);

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
        const { metaData, tableData } = result;
        dispatch(setMetaData(metaData));
        dispatch(storeTableData(tableData));
      } else {
        console.error("Error:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const createFileNameWithPrefix = (clientName) => {
    // Prefix
    const prefix = "QIC";

    // Function to sanitize input to ensure it's safe for file names
    function sanitizeInput(input) {
      // Replace any character not allowed in file names with an underscore
      return input.replace(/[\\/\\:*?"<>|\s]+/g, "_");
    }

    // Sanitize the client name
    const safeClientName = sanitizeInput(clientName);

    // Get today's date and format it as yyyy_dd_mm
    const today = new Date();
    const year = today.getFullYear();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    const dateStr = `${year}_${day}_${month}`;

    // Construct the file name with prefix, sanitized client name, and formatted date
    const fileName = `${prefix}_${safeClientName}_${dateStr}`;

    return fileName;
  };

  const handleClose = () => {
    navigate("/tb/dbtable");
  };

  const getEndPoint = () => {
    const currentHref = window.location.href;
    const parsedUrl = new URL(currentHref);
    const pathSegments = parsedUrl.pathname
      .split("/")
      .filter((segment) => segment);
    return pathSegments[pathSegments.length - 1];
  };

  const endPoint = getEndPoint();

  let subtitle;
  const [modalIsOpen, setIsOpen] = useState(false);

  function afterOpenModal() {
    subtitle.style.color = "#f00";
  }

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
  return (
    <div className="w-full flex flex-col mt-8">
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
      >
        <div className="w-full flex flex-col items-center px-4 gap-4">
          <h2 className="text-2xl">Please leave your comment.</h2>
          <textarea
            name="comment"
            id="comment"
            cols="30"
            rows="10"
            value={comment}
            autoFocus
            className="w-full h-24 p-2 border border-gray-300 focus:outline-none"
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="bg-gray-200 px-4 py-2"
              onClick={
                tableName !== ""
                  ? handleSaveCommentForRow
                  : handleCommentForCategory
              }
            >
              Comment
            </button>
            <button className="bg-gray-200 px-4 py-2" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      </Modal>
      <ToastContainer />
      <div className="flex flex-col items-start gap-2">
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
          className="w-full md:w-2/3 lg:w-1/2"
        />
      </div>

      {/* Table Group */}
      <div className="w-full flex flex-col gap-4 my-4">
        {selectedTable &&
          Object.keys(selectedTable).map((tableName, index) => {
            if (
              tableName !== "status" &&
              tableName !== "version" &&
              tableName !== "comment"
            ) {
              let table = Object.values(selectedTable[tableName]);
              return (
                <div
                  key={index}
                  className="w-full p-4 bg-white flex flex-col items-start"
                >
                  <h1 className="text-3xl text-black font-bold m-4">
                    {tableName}
                  </h1>
                  <EditableTable
                    tableName={tableName}
                    tableData={table}
                    handleEdit={handleEdit}
                    handleFocus={handleFocusCell}
                    handleConfirm={handleConfirm}
                    handleDelete={handleDeleteRow}
                  />
                </div>
              );
            }
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

        {endPoint !== "view" && (
          <button
            onClick={handleDelete}
            className="w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none"
          >
            Delete
          </button>
        )}
        {endPoint === "view" && (
          <button
            onClick={handleClose}
            className="w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
