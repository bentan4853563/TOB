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
  clearTableData,
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
        data: {
          ...state.data,
          [action.tableName]: [...state.data[action.tableName], {}],
        },
      };
    case "delete_row": {
      console.log(action);
      const rowIndex = action.rowIndex;
      return {
        ...state,
        skipReset: true,
        data: {
          ...state.data,
          [action.tableName]: [
            ...state.data[action.tableName].slice(0, rowIndex),
            ...state.data[action.tableName].slice(rowIndex + 1),
          ],
        },
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
      const tableName = action.tableName;

      // Assuming columns is an object with keys as table names
      const index = state.columns[tableName].findIndex(
        (column) => column.id === action.columnId
      );

      return {
        ...state,
        skipReset: true,
        columns: {
          ...state.columns,
          [tableName]: [
            ...state.columns[tableName].slice(0, index),
            { ...state.columns[tableName][index], label: action.label },
            ...state.columns[tableName].slice(index + 1),
          ],
        },
      };
    }
    case "update_cell":
      return {
        ...state,
        skipReset: true,
        data: {
          ...state.data,
          [action.tableName]: state.data[action.tableName].map((row, index) => {
            if (index === action.rowIndex) {
              return {
                ...row,
                [action.columnId]: action.value,
              };
            }
            return row;
          }),
        },
      };

    case "add_column_to_left": {
      const tableName = action.tableName;
      const leftIndex = state.columns[tableName].findIndex(
        (column) => column.id === action.columnId
      );
      let leftId = shortId();
      return {
        ...state,
        skipReset: true,
        columns: {
          ...state.columns,
          [tableName]: [
            ...state.columns[tableName].slice(0, leftIndex),
            {
              id: leftId,
              label: "New Column",
              accessor: leftId,
              dataType: "text",
              created: !!action.focus,
              options: [],
            },
            ...state.columns[tableName].slice(leftIndex),
          ],
        },
      };
    }

    case "add_column_to_right": {
      const tableName = action.tableName;
      const rightIndex = state.columns[tableName].findIndex(
        (column) => column.id === action.columnId
      );
      const rightId = shortId();
      return {
        ...state,
        skipReset: true,
        columns: {
          ...state.columns,
          [tableName]: [
            ...state.columns[tableName].slice(0, rightIndex + 1),
            {
              id: rightId,
              label: "New Column",
              accessor: rightId,
              dataType: "text",
              created: !!action.focus,
              options: [],
            },
            ...state.columns[tableName].slice(rightIndex + 1),
          ],
        },
      };
    }

    case "delete_column": {
      const tableName = action.tableName;
      const deleteIndex = state.columns[tableName].findIndex(
        (column) => column.id === action.columnId
      );
      return {
        ...state,
        skipReset: true,
        columns: {
          ...state.columns,
          [tableName]: [
            ...state.columns[tableName].slice(0, deleteIndex),
            ...state.columns[tableName].slice(deleteIndex + 1),
          ],
        },
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
      return input.replace(/[/\\:*?"<>|\s]+/g, "_");
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

  const handleClick = (tableName, rowIndex) => {
    dispatch({ type: "delete_row", tableName, rowIndex });
  };

  const handleReview = async () => {
    // const response = await fetch(`${base_URL}/table/review`, {
    //   method: "POST",
    //   headers: {
    //     "content-type": "application/json",
    //     "x-auth-token": token, // Include the token in the Authorization header
    //     "ngrok-skip-browser-warning": true,
    //   },
    //   body: JSON.stringify({ id: metaData._id }),
    // });
    toast.success("Successfully Reviewed!", {
      position: "top-right",
    });
    customDispatch(setReview());
  };

  // const handleSaveToDB = async () => {
  //   // Proceed with saving data to the database
  //   let source_TOB = "";
  //   if (metaData.sourceTOB) {
  //     source_TOB = metaData.sourceTOB;
  //   } else {
  //     source_TOB = uploadedFile;
  //   }
  //   const formData = {
  //     table: state.data,
  //     metaData: {
  //       _id: metaData._id,
  //       broker: metaData.broker,
  //       client: metaData.client,
  //       topType: metaData.topType,
  //       previousInsurer: metaData.previousInsurer,
  //       status: "Generated",
  //       sourceTOB: source_TOB,
  //     },
  //   };

  //   customDispatch(setLoading());
  //   try {
  //     const response = await fetch(`${base_URL}/table/fileUploadAndSave`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "x-auth-token": token,
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to save data. Please try again.");
  //     }
  //     customDispatch(clearLoading());

  //     toast.success("Successfully generated!", {
  //       position: "top-right",
  //     });

  //     navigate("/tb/dbtable");
  //     customDispatch(clearFileName());
  //     customDispatch(clearTableData());
  //     customDispatch(clearMetaData());
  //   } catch (error) {
  //     console.error("Error saving data:", error);
  //     // Handle error if needed
  //   }
  // };

  const handleSaveToDB = async () => {
    // Proceed with saving data to the database
    let source_TOB = metaData.sourceTOB || uploadedFile;

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

    customDispatch(setLoading()); // Start the loading process
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
        // Check for HTTP errors
        throw new Error(`HTTP error: ${response.status}`);
      }

      // Parsing the JSON body of the response (optional)
      const responseData = await response.json();

      // Additional checks for server-side validation errors or other conditions
      if (responseData.error) {
        throw new Error(responseData.error);
      }

      // Present a toast for successful generation after valid respons

      navigate("/tb/dbtable");
      customDispatch(clearFileName());
      customDispatch(clearTableData());
      customDispatch(clearMetaData());
    } catch (error) {
      console.error("Error saving data:", error);

      // Dispatch action to clear the loading state
      customDispatch(clearLoading());

      // Show toast with error message
      toast.error(`Save failed: ${error.message}`, {
        position: "top-right",
      });

      // It could be appropriate here to also navigate away or take other corrective actions
    }
  };

  const handleSaveToPDF = async () => {
    await handleSaveToDB();

    console.log("dfsfdsfdsdf");

    const tableData = Object.values(state.data);
    const doc = new jsPDF();

    const addSectionToPDF = (title, data, pdfColumns) => {
      doc.addPage();
      doc.text(title, 20, 20);
      doc.autoTable({
        startY: 40,
        head: [pdfColumns],
        body: data.map((item) =>
          pdfColumns.map((col) => item[col]?.toString() || "")
        ),
        margin: { top: 30 },
      });
    };

    const titleMap = [
      "General Benefit",
      "In Patient Benefit",
      "Other Benefit",
      "Out Patient Benefit",
    ];

    tableData.forEach((sectionData, index) => {
      if (sectionData.length > 0) {
        const title = titleMap[index];
        addSectionToPDF(title, sectionData, Object.keys(sectionData[0]));
      }
    });

    const fileName = `${metaData.client}-${new Date().toISOString()}`;
    doc.save(`${fileName}.pdf`);

    toast.success("Successfully generated!", {
      position: "top-right",
    });
    customDispatch(clearMetaData());
    customDispatch(clearTableData());
  };

  const handleSaveToCSV = async () => {
    await handleSaveToDB();

    const tableData = Object.values(state.data);

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

    customDispatch(clearMetaData());
    customDispatch(clearTableData());
  };

  const handleClose = () => {
    navigate("/tb/dbtable");
  };

  const isEditable = endPoint === "new_or_edit" ? true : false;

  return (
    <div className="w-full h-full  flex flex-col items-start justify-start">
      <ToastContainer />
      <div
        style={{ display: "flex" }}
        className="w-full bg-white rounded-lg my-4"
      >
        <div className="w-full px-8 flex flex-col gap-4 justify-center py-8">
          {state.data &&
            state.tableList.map((tableName, index) => {
              let tabledata = state.data[tableName];
              return (
                <div key={index} className="mb-8">
                  <p className="w-full text-center text-2xl font-serif">
                    {tableName}
                  </p>
                  <Table
                    columns={
                      isEditable
                        ? state.columns[tableName]
                        : state.columns[tableName].slice(0, -1)
                    }
                    data={tabledata}
                    dispatch={(action) => dispatch({ ...action, tableName })}
                    skipReset={state.skipReset}
                    handleClick={(rowIndex) => handleClick(tableName, rowIndex)}
                    style={{ width: "100%" }}
                    isEditable={isEditable ? true : false}
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
