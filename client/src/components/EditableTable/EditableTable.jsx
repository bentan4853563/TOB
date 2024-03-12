import { useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";

import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";

// import { IoSaveOutline } from "react-icons/io5";

import Table from "./Table";
import MakeData from "./makeData";

import { shortId } from "./utils";
import "./style.css";
import {
  setReview,
  clearFileName,
  clearTablData,
  clearMetaData,
} from "../../redux/reducers/tableSlice";
import { clearLoading, setLoading } from "../../redux/reducers/loadingSlice";

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_DATA": {
      return {
        ...state,
        ...action.payload,
      };
    }
    case "add_option_to_column": {
      const optionIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, optionIndex),
          {
            ...state.columns[optionIndex],
            options: [
              ...state.columns[optionIndex].options,
              { label: action.option, backgroundColor: action.backgroundColor },
            ],
          },
          ...state.columns.slice(optionIndex + 1, state.columns.length),
        ],
      };
    }
    case "add_row":
      return {
        ...state,
        skipReset: true,
        data: [...state.data, {}],
      };
    case "delete_row": {
      let id = action.columnId;
      return {
        ...state,
        skipReset: true,
        data: [
          ...state.data.slice(0, id),
          ...state.data.slice(id + 1, state.data.length),
        ],
      };
    }
    case "update_column_type": {
      const typeIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      switch (action.dataType) {
        case "number":
          if (state.columns[typeIndex].dataType === "number") {
            return state;
          } else {
            return {
              ...state,
              columns: [
                ...state.columns.slice(0, typeIndex),
                { ...state.columns[typeIndex], dataType: action.dataType },
                ...state.columns.slice(typeIndex + 1, state.columns.length),
              ],
              data: state.data.map((row) => ({
                ...row,
                [action.columnId]: isNaN(row[action.columnId])
                  ? ""
                  : Number.parseInt(row[action.columnId]),
              })),
            };
          }
        case "text":
          if (state.columns[typeIndex].dataType === "text") {
            return state;
          } else if (state.columns[typeIndex].dataType === "select") {
            return {
              ...state,
              skipReset: true,
              columns: [
                ...state.columns.slice(0, typeIndex),
                { ...state.columns[typeIndex], dataType: action.dataType },
                ...state.columns.slice(typeIndex + 1, state.columns.length),
              ],
            };
          } else {
            return {
              ...state,
              skipReset: true,
              columns: [
                ...state.columns.slice(0, typeIndex),
                { ...state.columns[typeIndex], dataType: action.dataType },
                ...state.columns.slice(typeIndex + 1, state.columns.length),
              ],
              data: state.data.map((row) => ({
                ...row,
                [action.columnId]: row[action.columnId] + "",
              })),
            };
          }
        default:
          return state;
      }
    }
    case "update_column_header": {
      const index = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, index),
          { ...state.columns[index], label: action.label },
          ...state.columns.slice(index + 1, state.columns.length),
        ],
      };
    }
    case "update_cell":
      return {
        ...state,
        skipReset: true,
        data: state.data.map((row, index) => {
          if (index === action.rowIndex) {
            return {
              ...state.data[action.rowIndex],
              [action.columnId]: action.value,
            };
          }
          return row;
        }),
      };
    case "add_column_to_left": {
      const leftIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      let leftId = shortId();
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, leftIndex),
          {
            id: leftId,
            label: "Column",
            accessor: leftId,
            dataType: "text",
            created: action.focus && true,
            options: [],
          },
          ...state.columns.slice(leftIndex, state.columns.length),
        ],
      };
    }
    case "add_column_to_right": {
      const rightIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      const rightId = shortId();
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, rightIndex + 1),
          {
            id: rightId,
            label: "Column",
            accessor: rightId,
            dataType: "text",
            created: action.focus && true,
            options: [],
          },
          ...state.columns.slice(rightIndex + 1, state.columns.length),
        ],
      };
    }
    case "delete_column": {
      const deleteIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, deleteIndex),
          ...state.columns.slice(deleteIndex + 1, state.columns.length),
        ],
      };
    }
    case "enable_reset":
      return {
        ...state,
        skipReset: false,
      };
    default:
      return state;
  }
}

function EditableTable() {
  const navigate = useNavigate();
  const customDispatch = useDispatch();

  const base_URL = import.meta.env.VITE_BACKEND_URL;

  const { token } = useSelector((state) => state.auth);
  const { metaData } = useSelector((state) => state.table);
  const { uploadedFile } = useSelector((state) => state.table);
  const { table } = useSelector((state) => state.table);

  const [state, dispatch] = useReducer(reducer, {
    data: [],
    columns: [],
    tableList: [],
    skipReset: false,
  });

  const getEndPoint = () => {
    const currentHref = window.location.href;
    const parsedUrl = new URL(currentHref);
    const pathSegments = parsedUrl.pathname
      .split("/")
      .filter((segment) => segment);
    return pathSegments[pathSegments.length - 1];
  };

  const endPoint = getEndPoint();

  const createFileNameWithPrefix = (clientName) => {
    // Prefix
    const prefix = "QIC";

    // Function to sanitize input to ensure it's safe for file names
    const sanitizeInput = (input) => {
      // Replace any character not allowed in file names with an underscore
      return input.replace(/[\/\\:*?"<>|\s]+/g, "_");
    };

    // Sanitize the client name
    const safeClientName = sanitizeInput(clientName);

    // Get today's date and format it as yyyy_mm_dd
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    const day = String(today.getDate()).padStart(2, "0");
    const dateStr = `${year}_${month}_${day}`; // Correct order of yyyy_mm_dd

    // Construct the file name with prefix, sanitized client name, and formatted date
    const fileName = `${prefix}_${safeClientName}_${dateStr}`;

    return fileName;
  };

  useEffect(() => {
    const newDataState = MakeData(table);
    dispatch({ type: "UPDATE_DATA", payload: newDataState });
  }, [table]);

  const handleClick = (index) => {
    dispatch({ type: "delete_row", columnId: index });
  };

  console.log("Table ==========> ", table);

  const handleReview = async () => {
    // await fetch(`${base_URL}/table/review`, {
    // 	method: "POST",
    // 	headers: {
    // 		"content-type": "application/json",
    // 		"x-auth-token": token, // Include the token in the Authorization header
    // 		"ngrok-skip-browser-warning": true,
    // 	},
    // 	body: JSON.stringify({ id: metaData._id }),
    // });
    customDispatch(setReview());
    toast.success("Successfully Reviewed!", {
      position: "top-right",
    });
  };

  // const handleSaveasCSV = () => {
  // 	if (Object.values(errors).every((error) => error === "")) {
  // 		Makecsv(state.data);
  // 	}
  // };

  const handleSaveToDB = async () => {
    // Proceed with saving data to the database
    let source_TOB = "";
    if (metaData.sourceTOB) {
      source_TOB = metaData.sourceTOB;
    } else {
      source_TOB = uploadedFile;
    }
    const formData = {
      table: state.data,
      metaData: {
        _id: metaData._id,
        broker: metaData.broker,
        client: metaData.client,
        topType: metaData.topType,
        previousInsurer: metaData.previousInsurer,
        status: "Generated",
        sourceTOB: source_TOB,
      },
    };

    customDispatch(setLoading());
    try {
      const response = await fetch(`${base_URL}/table/fileUploadAndSave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save data. Please try again.");
      }
      customDispatch(clearLoading());
      navigate("/tb/dbtable");
      toast.success("Successfully generated!", {
        position: "top-right",
      });
      customDispatch(clearFileName());
      customDispatch(clearTablData());
      customDispatch(clearMetaData());
    } catch (error) {
      console.error("Error saving data:", error);
      // Handle error if needed
    }
  };

  const handleSaveToPDF = async () => {
    await handleSaveToDB(); // Assuming this should be awaited

    const TableData = Object.values(state.data);

    const doc = new jsPDF();
    const pdfColumns = Object.keys(TableData[0][0]); // Ensure this is correctly set up as an array of strings

    // Helper function to add sections to the PDF
    const addSectionToPDF = (title, data) => {
      doc.addPage();
      doc.text(title, 20, 20); // Adjusted the y-coordinate for the title to avoid overlap with the table
      autoTable(doc, {
        startY: 30, // Start the table a little below the title
        head: [pdfColumns],
        body: data.map((item) => pdfColumns.map((col) => item[col] || "")), // Handle any undefined values gracefully
        margin: { top: 10 },
      });
    };

    // Add each section to the PDF
    addSectionToPDF("General Benefit", TableData[0]);
    addSectionToPDF("In Patient Benefit", TableData[1]);
    addSectionToPDF("Other Benefit", TableData[2]);
    addSectionToPDF("Out Patient Benefit", TableData[3]);

    const fileName = createFileNameWithPrefix(metaData.client);

    // Finalize and save the PDF document
    doc.save(`${fileName}.pdf`);

    // Dispatch actions to clear meta data and table data if necessary
    customDispatch(clearMetaData());
    customDispatch(clearTablData());
  };

  const handleSaveToCSV = async () => {
    await handleSaveToDB(); // Assuming you still want to save to DB first

    const TableData = Object.values(state.data);

    // Helper function to convert data array to CSV string
    const convertToCSV = (arr) => {
      return arr
        .map((row) =>
          Object.values(row)
            .map(String)
            .map((v) => v.replaceAll('"', '""'))
            .join(",")
        )
        .join("\n");
    };

    // Start CSV File content with headers
    let csvContent = "";
    const csvColumns = Object.keys(TableData[0][0]); // Headers from the object keys

    // Add headers to CSV content
    csvContent += csvColumns.join(",") + "\n";

    // Add the data for each section
    TableData.forEach((sectionData, index) => {
      const sectionTitle = [
        "General Benefit",
        "In Patient Benefit",
        "Other Benefit",
        "Out Patient Benefit",
      ][index];

      // Add the section title as a comment or individual cell in the CSV (optional)
      csvContent += `# ${sectionTitle}\n`;

      // Convert data to CSV rows and add them to CSV content
      csvContent += convertToCSV(sectionData);

      // Optionally, add an empty line between sections
      csvContent += "\n";
    });

    const fileName = createFileNameWithPrefix(metaData.client);
    // Trigger the download of the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Dispatch actions to clear meta data and table data if necessary
    customDispatch(clearMetaData());
    customDispatch(clearTablData());
  };

  const handleClose = () => {
    navigate("/tb/dbtable");
  };

  return (
    <div className="w-full h-full  flex flex-col items-start justify-start">
      <ToastContainer />

      <div
        style={{ display: "flex" }}
        className="w-full bg-white rounded-lg my-4"
      >
        <div className="w-full px-8 flex flex-col gap-4 justify-center py-8">
          {/* <Table
              columns={state.columns}
              data={state.data}
              dispatch={dispatch}
              skipReset={state.skipReset}
              handleClick={handleClick}
              style={{ width: "100%" }}
            /> */}
          {state.data &&
            state.tableList.map((item, index) => {
              let tabledata = state.data[item];
              return (
                <div key={index} className="mb-8">
                  <p className="w-full text-center text-2xl font-serif">
                    {item}
                  </p>
                  <Table
                    columns={state.columns}
                    data={tabledata}
                    dispatch={dispatch}
                    skipReset={state.skipReset}
                    handleClick={handleClick}
                    style={{ width: "100%" }}
                  />
                </div>
              );
            })}
          {table && endPoint !== "view" && (
            <div className="flex gap-4">
              {(!metaData.status || metaData.status === "Progress") && (
                <button
                  onClick={handleReview}
                  className="w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none"
                >
                  Review
                </button>
              )}
              {(metaData.status === "Review" ||
                metaData.status === "Generated") && (
                <div className="relative">
                  {/* <button
                    onClick={handleSaveToDB}
                    className="w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none"
                  >
                    Generate
                  </button> */}
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
                      className="flex justify-center"
                      onClick={handleSaveToPDF}
                    >
                      Save to PDF
                    </MenuItem>
                    <MenuItem
                      onClick={handleSaveToCSV}
                      className="flex justify-center"
                    >
                      Save to CSV
                    </MenuItem>
                  </Menu>
                </div>
              )}
              {metaData.status && metaData.status !== "Progress" && (
                <button
                  onClick={handleClose}
                  className="w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none"
                >
                  Close
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditableTable;
