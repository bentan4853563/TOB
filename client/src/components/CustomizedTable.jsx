import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import jsPDF from "jspdf";
// eslint-disable-next-line no-unused-vars
import autoTable from "jspdf-autotable";
import { utils, writeFile } from "xlsx";

import Select from "react-select";
import Modal from "react-modal";
import { toast, ToastContainer } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import "react-toastify/dist/ReactToastify.css";

import EditableTable from "./EditableTable";
import { setMetaData, storeTableData } from "../redux/reducers/tableSlice";
import { clearLoading, setLoading } from "../redux/reducers/loadingSlice";
import ViewTable from "./ViewTable";

export default function CustomizedTable() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const node_server_url = import.meta.env.VITE_NODE_SERVER_URL;

  const { table } = useSelector((state) => state.table);
  const { token } = useSelector((state) => state.auth);
  const { metaData } = useSelector((state) => state.table);

  const [selectedCategory, setSelectedCategory] = useState("");
  // const [filteredTable, setFilteredTable] = useState({});
  const [tableData, setTableData] = useState({});

  const [comment, setComment] = useState("");
  const [rowNumber, setRowNumber] = useState(0);
  const [tableName, setTableName] = useState("");
  const [column, setColumn] = useState("");
  const [clickedButton, setClickedButton] = useState("");

  const [saved, setSaved] = useState(true);
  const [enableReview, setEnableReview] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const categoryOptions = Object.keys(table).map((category) => ({
    value: category,
    label: category,
  }));

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "not-edited", label: "Not Edited" },
    { value: "to-be-edited", label: "To Be Edited" },
    { value: "edited", label: "Edited" },
    { value: "review-required", label: "Review Required" },
    { value: "reviewed", label: "Reviewed" },
    { value: "review-pending", label: "Review Pending" },
  ];

  const titleMap = [
    "General Benefit",
    "In Patient Benefit",
    "Out Patient Benefit",
    "Other Benefit",
  ];

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption.value);
    localStorage.setItem("saved-category", selectedOption.value);
  };

  const handleFilterChange = (selectedOption) => {
    setSelectedFilter(selectedOption.value);
  };

  useEffect(() => {
    return () => {
      console.log("5678");
      localStorage.setItem("category", selectedCategory);
      localStorage.setItem("uuid", metaData.uuid);
    };
  });

  useEffect(() => {
    const savedCategory = localStorage.getItem("category");
    const savedUuid = localStorage.getItem("uuid");
    if (Object.keys(table).length > 0) {
      if (savedUuid === metaData.uuid && savedCategory) {
        setSelectedCategory(savedCategory);
      } else {
        setSelectedCategory(Object.keys(table)[0]);
      }
      setTableData(table);
    }
  }, [table]);

  useEffect(() => {
    if (tableData && Object.keys(tableData).length > 0) {
      let uncheckedCount = 0;
      titleMap.map((tableName) => {
        tableData[selectedCategory][tableName].map((row) => {
          if (row.color === "red" && row["Review Required"] === false)
            uncheckedCount = uncheckedCount + 1;
        });
      });
      if (uncheckedCount !== 0) {
        setEnableReview(false);
      } else {
        setEnableReview(true);
      }
    }
  }, [tableData]);

  // useEffect(() => {
  //   if (selectedCategory !== "") {
  //     setSelectedFilter(filterOptions[0].value);
  //   }
  // }, [selectedCategory]);

  // useEffect(() => {
  //   if (
  //     selectedCategory !== "" &&
  //     selectedFilter !== "" &&
  //     Object.keys(tableData).length > 0
  //   ) {
  //     const newFilteredTable = tableData[selectedCategory];
  //     newFilteredTable.filter((currentTable) => ({
  //       ...currentTable,

  //     }))
  //     setFilteredTable();
  //   }
  // }, [selectedCategory, selectedFilter, tableData]);

  const handleEdit = (tableName, value, rowIndex, fieldName) => {
    setTableData((currentTableData) => ({
      ...currentTableData,
      [selectedCategory]: {
        ...tableData[selectedCategory],
        [tableName]: tableData[selectedCategory][tableName].map(
          (row, index) => {
            if (index === rowIndex) {
              return {
                ...row,
                [fieldName]: value,
              };
            }
            return row;
          }
        ),
        status: "Processed",
      },
    }));
    setSaved(false);
  };

  const handleNewRow = (tableName, rowIndex) => {
    setTableData((currentTableData) => ({
      ...currentTableData,
      [selectedCategory]: {
        ...currentTableData[selectedCategory],
        [tableName]: [
          ...currentTableData[selectedCategory][tableName].slice(
            0,
            rowIndex + 1
          ),
          {
            benefit: "",
            limit: "",
            color: "yellow",
            edit: true,
            "New Benefit": "",
            "New Limit": "",
            "Edit Reason": "",
            "Review Required": false,
            Reviewed: false,
            "Review Comment": "",
          },
          // This should likely be currentTableData[selectedCategory][tableName].length
          ...currentTableData[selectedCategory][tableName].slice(
            rowIndex + 1,
            currentTableData[selectedCategory][tableName].length
          ),
        ],
        status: "Processed",
      },
    }));
  };

  const handleConfirm = (tableName, rowIndex, column) => {
    setTableData((currentTableData) => {
      const rows = currentTableData[selectedCategory][tableName];
      // Check if condition before opening modal
      if (rows[rowIndex][column] === false) {
        setIsOpen(true);
        setRowNumber(rowIndex);
        setTableName(tableName);
        setColumn(column);
      }
      return currentTableData; // We return the current state directly since there's no modification
    });
    setSaved(false);
  };

  const handleSaveCommentForRow = () => {
    setTableData((currentTableData) => ({
      ...currentTableData,
      [selectedCategory]: {
        ...tableData[selectedCategory],
        [tableName]: tableData[selectedCategory][tableName].map(
          (row, index) => {
            if (index === rowNumber && column === "edit") {
              return {
                ...row,
                ["New Benefit"]: row["benefit"],
                ["New Limit"]: row["limit"],
                edit: true,
                "Review Required": true,
                "Edit Reason": comment,
              };
            } else if (index === rowNumber && column === "Reviewed") {
              return {
                ...row,
                Reviewed: true,
                "Review Comment": comment,
              };
            } else {
              return row;
            }
          }
        ),
        status: "Processed",
      },
    }));
    setIsOpen(false);
    setComment("");
    setColumn("");
  };

  const handleDeleteRow = (tableName, rowIndex) => {
    setTableData((currentTableData) => ({
      ...currentTableData,
      [selectedCategory]: {
        ...currentTableData[selectedCategory],
        [tableName]: currentTableData[selectedCategory][tableName].filter(
          (_, index) => index !== rowIndex
        ),
        status: "Processed",
      },
    }));
    toast.success("Successfully deleted your selected");
  };

  const handleClickStatusChangeButton = (buttonName) => {
    setClickedButton(buttonName);
    setIsOpen(true);
  };

  const handleReview = async () => {
    setIsOpen(false);
    let required = 0;
    let reviewed = 0;
    titleMap.forEach((title) => {
      tableData[selectedCategory][title].forEach((row) => {
        if (row["Review Required"]) required++;
        if (row.Reviewed) reviewed++;
      });
    });
    const tempData = {
      ...tableData,
      [selectedCategory]: {
        ...tableData[selectedCategory],
        status: "Reviewed",
        comment: comment || "",
      },
    };

    if (required === reviewed) {
      update(tempData);
      toast.success("Successfuly Reviewed!!!", {
        position: "top-right",
      });
    } else {
      toast.warning(
        `${required} / ${required - reviewed} Record still under review.`,
        {
          position: "top-right",
        }
      );
    }
    setComment("");
    setClickedButton("");
  };

  const handleGenerate = async (fileName) => {
    setIsOpen(false);

    // Assuming tableData is an array and updated correctly
    const updatedData = {
      ...table,
      [selectedCategory]: {
        ...table[selectedCategory],
        resultTOB: fileName, // Set the filename in the right category
        status: "Generated", // Update the status
        comment: comment || "", // Use current comment or empty string if undefined
      },
    };
    // Call the update function with the new data
    update(updatedData);

    // Reset the comment after updating the table data
    setComment("");
  };

  const reviseProcess = async () => {
    const updatedData = {
      ...table,
      [selectedCategory]: {
        ...tableData[selectedCategory],
        // Loop over all tables within the selected category
        ...Object.keys(tableData[selectedCategory]).reduce((acc, title) => {
          if (
            title !== "status" &&
            title !== "comment" &&
            title !== "version"
          ) {
            const isDataArray = Array.isArray(
              tableData[selectedCategory][title]
            );
            console.log(isDataArray, tableData[selectedCategory][title]);
            // Ensure the data structure is an array before mapping
            if (isDataArray) {
              acc[title] = tableData[selectedCategory][title].map((row) => {
                // If the row is edited/reviewed, replace Benefit and Limit with New Benefit and New Limit
                if (row.edit === true || row.Reviewed === true) {
                  return {
                    ...row,
                    benefit: row["New Benefit"],
                    limit: row["New Limit"],
                    color: "green", // Set the color to green
                  };
                }
                return { ...row, color: "green" }; // Set the color to green for all rows
              });
            } else {
              console.error(
                `Expected an array for ${title}, but received:`,
                tableData[selectedCategory][title]
              );
              // Handle non-array data here as needed
              acc[title] = tableData[selectedCategory][title];
            }
          }
          return acc;
        }, {}),
        status: "Processed",
        comment: comment || "",
        version: tableData[selectedCategory].version + 1,
      },
    };
    console.log("updatedData", updatedData);

    update(updatedData);
    setComment("");
    toast.success("Successfully Revised!!!", { position: "top-right" });
  };

  const handleRevise = async () => {
    confirmAlert({
      title: "Revise!",
      message: "Are you sure?",
      buttons: [
        {
          label: "Revise",
          onClick: async () => {
            reviseProcess();
          },
        },
        {
          label: "Close",
          onClick: async () => {},
        },
      ],
    });
  };

  function capitalizeFirstLetter(word) {
    if (word && typeof word === "string") {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word;
  }

  const handleSave = async () => {
    dispatch(setLoading());
    try {
      const response = await fetch(`${node_server_url}/api/table/file-save`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-auth-token": token, // Include the token in the Authorization header
          "ngrok-skip-browser-warning": true,
        },
        body: JSON.stringify({
          uuid: metaData.uuid,
          tableData,
        }),
      });
      if (response.ok) {
        setSaved(true);
        const savedTableData = await response.json();
        console.log("savedTableData", savedTableData);
        dispatch(storeTableData(savedTableData));
        toast.success("Successfuly saved!!!", {
          position: "top-right",
        });
      } else {
        console.error("Error:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
    dispatch(clearLoading());
  };

  const handleSaveToPDF = async () => {
    dispatch(setLoading());
    const doc = new jsPDF();

    const pdfColumns = ["benefit", "limit"];
    const headers = pdfColumns.map((header) => capitalizeFirstLetter(header));
    const addSectionToPDF = (title, data) => {
      if (Array.isArray(data) && data.length > 0) {
        doc.setFontSize(14);
        doc.text(title, 20, 30);

        if (title === "General Benefit") {
          doc.setFontSize(10);
          doc.text(
            `Client: ${metaData.client}     Category: ${selectedCategory}`,
            20,
            40
          );
        }
        // Calculate startY based on the last text element
        let startY = 50;
        doc.autoTable({
          startY: startY,
          head: [["S No"].concat(headers)],
          body: data.map((item, index) => {
            const serialNumber = (index + 1).toString();
            if (item.edit === true) {
              return [
                serialNumber,
                item["New Benefit"]?.toString() || "",
                item["New Limit"]?.toString() || "",
              ];
            } else {
              return [
                serialNumber,
                item["benefit"]?.toString() || "",
                item["limit"]?.toString() || "",
              ];
            }
          }),
        }),
          doc.addPage();
      } else {
        console.error(
          `No data provided for title "${title}", skipping section.`
        );
      }
    };

    titleMap.forEach((title) => {
      const sectionData =
        tableData[selectedCategory] && tableData[selectedCategory][title];
      if (sectionData) {
        addSectionToPDF(title, sectionData);
      } else {
        console.error(
          `No data found for category "${selectedCategory}" and title "${title}". Skipping this section.`
        );
      }
    });

    const fileName = `${
      metaData.client
    }-${selectedCategory}-${new Date().toISOString()}-V${
      tableData[selectedCategory].version
    }`;

    doc.save(`${fileName}.pdf`);

    await handleGenerate(fileName);
    dispatch(clearLoading());
    toast.success("Successfully generated!", {
      position: "top-right",
    });
  };

  const handleSaveToCSV = async () => {
    dispatch(setLoading());
    const addSectionToCSV = (title, data) => {
      if (Array.isArray(data) && data.length > 0) {
        // Include client name and category for the 'General Benefit'
        let csvContent =
          title === "General Benefit"
            ? `"Client: ${metaData.client}", "Category: ${selectedCategory}"\n`
            : "";
        csvContent += `"${title}"\n`;

        // Only include the headers for 'S No', 'Benefit', and 'Limit'
        csvContent += `"S No","Benefit","Limit"\n`;
        csvContent +=
          data
            .map((item, index) => {
              const serialNumber = (index + 1).toString();
              let benefit, limit;
              if (item.edit === true) {
                benefit = item["New Benefit"]?.toString() || "";
                limit = item["New Limit"]?.toString() || "";
              } else {
                benefit = item["benefit"]?.toString() || "";
                limit = item["limit"]?.toString() || "";
              }
              return `"${serialNumber}","${benefit.replace(
                /"/g,
                '""'
              )}","${limit.replace(/"/g, '""')}"`;
            })
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

    let csvData = "data:text/csv;charset=utf-8,";

    // Iterate over each section to append its respective data
    titleMap.forEach((title) => {
      const sectionData =
        tableData[selectedCategory] && tableData[selectedCategory][title];

      if (sectionData) {
        csvData += addSectionToCSV(title, sectionData);
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
    dispatch(clearLoading());

    toast.success("Successfully generated CSV!", {
      position: "top-right",
    });
  };

  const handleSaveToXLS = async () => {
    dispatch(setLoading());

    const workBook = utils.book_new();

    titleMap.forEach((title) => {
      const sectionData =
        tableData[selectedCategory] && tableData[selectedCategory][title];
      if (sectionData) {
        const headers = ["S No"];
        const workSheetData = sectionData.map((item, index) => ({
          "S No": (index + 1).toString(),
          Benefit: item.edit
            ? item["New Benefit"] || ""
            : item["benefit"] || "",
          Limit: item.edit ? item["New Limit"] || "" : item["limit"] || "",
        }));

        // Create worksheet with headers and data
        const workSheet = utils.json_to_sheet(workSheetData, {
          header: headers,
          skipHeader: false, // Include headers in the worksheet
        });

        // Append worksheet to workbook
        utils.book_append_sheet(workBook, workSheet, title);
      } else {
        console.error(
          `No data found for category "${selectedCategory}" and title "${title}". Skipping this section.`
        );
      }
    });

    // Generate file name and write the workbook
    const fileName = `${
      metaData.client
    }-${selectedCategory}-${new Date().toISOString()}.xlsx`;
    writeFile(workBook, fileName);

    // After saving the file perform any cleanup or follow-up actions
    await handleGenerate(fileName);
    dispatch(clearLoading());
    toast.success("Successfully generated!");
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

  const handleCommentForCategory = () => {
    if (!clickedButton) return;
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
      case "handleSaveToXLS":
        handleSaveToXLS(); // Assuming this is typo, it should match the function name
        break;
      case "handleRevise":
        handleRevise();
        break;
      default:
        setIsOpen(false);
    }
  };

  const handleClose = () => {
    if (!saved) {
      confirmAlert({
        title: "Close!",
        message: "There are unsaved changes, Are you sure?",
        buttons: [
          {
            label: "Save",
            onClick: async () => {
              handleSave();
            },
          },
          {
            label: "Close",
            onClick: async () => {
              navigate("/tb/dbtable");
            },
          },
          {
            label: "Cancel",
            onClick: () => {},
          },
        ],
      });
    } else {
      navigate("/tb/dbtable");
    }
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

  console.log("tableData", selectedCategory, tableData);

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

  Modal.setAppElement("#root");

  const modalHeather = () => {
    if (column === "") {
      if (clickedButton === "handleReview") {
        return <h2 className="text-2xl mb-4">Review</h2>;
      }
    } else {
      if (column === "edit") {
        return <h2 className="text-2xl mb-4">Edit</h2>;
      } else if (column === "Reviewed") {
        return <h2 className="text-2xl mb-4">Review</h2>;
      }
    }
  };

  return (
    <div className="w-full flex flex-col mt-8">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
      >
        {modalHeather()}
        <div className="w-full flex flex-col items-center gap-4">
          <textarea
            name="comment"
            id="comment"
            cols="30"
            rows="10"
            placeholder={
              column !== "" && column === "edit"
                ? "Reason for Editing"
                : clickedButton === "handleReview"
                ? "Review Comment"
                : ""
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
                column !== ""
                  ? handleSaveCommentForRow
                  : handleCommentForCategory
              }
            >
              Submit
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
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="status">Status</label>
          <span
            id="status"
            className="bg-cyan-200 w-24 px-4 py-2 flex justify-center rounded-full"
          >
            {tableData &&
              Object.keys(tableData).length > 0 &&
              selectedCategory !== "" &&
              tableData[selectedCategory].status}
          </span>
        </div>
        <div className="flex flex-col">
          <label htmlFor="version">Version</label>
          <span
            id="version"
            className="bg-orange-200 w-24 px-4 py-2 flex justify-center rounded-full"
          >
            {tableData &&
              Object.keys(tableData).length > 0 &&
              tableData[selectedCategory].version}
          </span>
        </div>
        {/* Filter */}
        <div className="w-full md:w-2/3 lg:w-1/2 flex flex-col">
          <label htmlFor="filter" className="font-bold">
            Filter
          </label>
          <Select
            id="filter"
            options={filterOptions}
            onChange={handleFilterChange}
            value={filterOptions.find(
              (option) => option.value === selectedFilter
            )}
          />
        </div>
      </div>

      {/* Table Group */}
      <div className="w-full flex flex-col gap-4 my-4">
        {tableData &&
          Object.keys(tableData).length > 0 &&
          titleMap.map((tableName, index) => {
            let table = Object.values(tableData[selectedCategory][tableName]);
            return (
              <div
                key={index}
                className="w-full p-8 bg-white flex flex-col items-start"
              >
                <h1 className="text-3xl text-black font-bold m-4">
                  {tableName}
                </h1>
                {tableData[selectedCategory].status !== "Generated" &&
                tableData[selectedCategory].status !== "Revised" ? (
                  <EditableTable
                    tableName={tableName}
                    tableData={table}
                    handleEdit={handleEdit}
                    newRow={handleNewRow}
                    handleConfirm={handleConfirm}
                    handleDelete={handleDeleteRow}
                  />
                ) : (
                  <ViewTable tableData={table} />
                )}
              </div>
            );
          })}
      </div>

      <div className="flex gap-4 my-8">
        {!saved &&
          tableData &&
          tableData[selectedCategory] &&
          tableData[selectedCategory].status !== "Generated" && (
            <button
              onClick={handleSave}
              className="w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none"
            >
              Save
            </button>
          )}

        {tableData &&
          tableData[selectedCategory] &&
          enableReview &&
          tableData[selectedCategory].status === "Processed" &&
          saved && (
            <button
              onClick={() => handleClickStatusChangeButton("handleReview")}
              className="w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none"
            >
              Review
            </button>
          )}

        {tableData &&
          tableData[selectedCategory] &&
          tableData[selectedCategory].status === "Reviewed" && (
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
                  onClick={handleSaveToPDF}
                  className="flex justify-center"
                >
                  Save to PDF
                </MenuItem>
                <MenuItem
                  className="flex justify-center"
                  onClick={handleSaveToCSV}
                >
                  Save to CSV
                </MenuItem>
                <MenuItem
                  className="flex justify-center"
                  onClick={handleSaveToXLS}
                >
                  Save to XLS
                </MenuItem>
              </Menu>
            </div>
          )}

        {tableData &&
          tableData[selectedCategory] &&
          tableData[selectedCategory].status === "Generated" && (
            <button
              onClick={handleRevise}
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
