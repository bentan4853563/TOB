import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import "react-toastify/dist/ReactToastify.css";

import { clearMetaData } from "../redux/reducers/tableSlice";
import EditableTable from "./EditableTable";

export default function CustomizedTable() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const node_server_url = import.meta.env.VITE_NODE_SERVER_URL;

  const { table } = useSelector((state) => state.table);
  const { token } = useSelector((state) => state.auth);
  const { metaData, uuid } = useSelector((state) => state.table);

  const [selectedCategory, setSlectedCategory] = useState("");
  const [selectedTable, setSelectedTable] = useState({});
  const [tableData, setTableData] = useState({});

  const [enableReview, setEnableReview] = useState(true);

  useEffect(() => {
    if (Object.keys(table).length > 0) {
      setSlectedCategory(Object.keys(table)[0]);
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
          return { ...row, [fieldName]: value };
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
          return {
            ...row,
            status: row.status === "checked" ? "unchecked" : "checked",
          };
        }
        return row;
      }),
    }));
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
          uuid: uuid,
          tableData: temp,
        }),
      });
      if (response.ok) {
        const responseData = await response.json();
        console.log("update response", responseData);
      } else {
        console.error("Error:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const handleReview = async () => {
    let temp = { ...selectedTable, status: "Reviewed" };
    let tempData = {
      ...tableData,
      [selectedCategory]: ((preview) => ({
        ...preview,
        status: "Reviewed",
      }))(tableData[selectedCategory]),
    };
    setSelectedTable(temp);
    update(tempData);
  };

  const handleGenerate = async () => {
    let temp = { ...selectedTable, status: "Generated" };
    let tempData = {
      ...tableData,
      [selectedCategory]: ((preview) => ({
        ...preview,
        status: "Generated",
      }))(tableData[selectedCategory]),
    };
    setSelectedTable(temp);
    update(tempData);
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

  // const handleGenerate = async () => {
  //   // Proceed with saving data to the database
  //   let source_TOB = metaData.sourceTOB || uploadedFile;

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

  //   dispatch(setLoading()); // Start the loading process
  //   try {
  //     const response = await fetch(`${node_server_url}/api/table/fileUploadAndSave`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "x-auth-token": token,
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     if (!response.ok) {
  //       // Check for HTTP errors
  //       throw new Error(`HTTP error: ${response.status}`);
  //     }

  //     // Parsing the JSON body of the response (optional)
  //     const responseData = await response.json();

  //     // Additional checks for server-side validation errors or other conditions
  //     if (responseData.error) {
  //       throw new Error(responseData.error);
  //     }

  //     // Present a toast for successful generation after valid respons

  //     navigate("/tb/dbtable");
  //     dispatch(clearFileName());
  //     dispatch(clearTableData());
  //     dispatch(clearMetaData());
  //   } catch (error) {
  //     console.error("Error saving data:", error);

  //     // Dispatch action to clear the loading state
  //     dispatch(clearLoading());

  //     // Show toast with error message
  //     toast.error(`Save failed: ${error.message}`, {
  //       position: "top-right",
  //     });

  //     // It could be appropriate here to also navigate away or take other corrective actions
  //   }
  // };

  const handleSaveToPDF = async () => {
    await handleGenerate();

    //   console.log("dfsfdsfdsdf");

    //   const tableData = Object.values(state.data);
    //   const doc = new jsPDF();

    //   const addSectionToPDF = (title, data, pdfColumns) => {
    //     doc.addPage();
    //     doc.text(title, 20, 20);
    //     doc.autoTable({
    //       startY: 40,
    //       head: [pdfColumns],
    //       body: data.map((item) =>
    //         pdfColumns.map((col) => item[col]?.toString() || "")
    //       ),
    //       margin: { top: 30 },
    //     });
    //   };

    //   const titleMap = [
    //     "General Benefit",
    //     "In Patient Benefit",
    //     "Other Benefit",
    //     "Out Patient Benefit",
    //   ];

    //   tableData.forEach((sectionData, index) => {
    //     if (sectionData.length > 0) {
    //       const title = titleMap[index];
    //       addSectionToPDF(title, sectionData, Object.keys(sectionData[0]));
    //     }
    //   });

    //   const fileName = `${metaData.client}-${new Date().toISOString()}`;
    //   doc.save(`${fileName}.pdf`);

    //   toast.success("Successfully generated!", {
    //     position: "top-right",
    //   });
    //   dispatch(clearMetaData());
    //   dispatch(clearTableData());
  };

  // const handleSaveToCSV = async () => {
  //   await handleGenerate();

  //   const tableData = Object.values(state.data);

  //   const convertToCSV = (arr) => {
  //     return arr
  //       .map((row) =>
  //         Object.values(row)
  //           .map((value) => `"${String(value).replace(/"/g, '""')}"`)
  //           .join(",")
  //       )
  //       .join("\n");
  //   };

  //   let csvContent = "data:text/csv;charset=utf-8,";
  //   tableData.forEach((sectionData, index) => {
  //     if (sectionData.length > 0) {
  //       const sectionTitles = [
  //         "General Benefit",
  //         "In Patient Benefit",
  //         "Other Benefit",
  //         "Out Patient Benefit",
  //       ];
  //       const headers = Object.keys(sectionData[0]);
  //       csvContent += `${sectionTitles[index]}\n`;
  //       csvContent += headers.join(",") + "\n";
  //       csvContent += convertToCSV(sectionData) + "\n\n";
  //     }
  //   });

  //   const fileName = createFileNameWithPrefix(metaData.client);
  //   const encodedUri = encodeURI(csvContent);
  //   const link = document.createElement("a");
  //   link.setAttribute("href", encodedUri);
  //   link.setAttribute("download", `${fileName}.csv`);
  //   document.body.appendChild(link); // Required for Firefox
  //   link.click();
  //   document.body.removeChild(link);

  //   toast.success("Successfully generated CSV!", {
  //     position: "top-right",
  //   });

  //   dispatch(clearMetaData());
  //   dispatch(clearTableData());
  // };

  // const handleClose = () => {
  //   navigate("/tb/dbtable");
  // };

  return (
    <div className="w-full flex flex-col mt-8">
      <div className="flex flex-col items-start gap-2">
        <label htmlFor="category" className="font-bold">
          Category
        </label>
        <select
          name="category"
          id="category"
          onChange={(e) => setSlectedCategory(e.target.value)}
          className="w-full md:w-2/3 lg:w-1/2 p-3 gap-4 text-xl"
        >
          {table &&
            Object.keys(table).map((category, index) => {
              return (
                <option key={index} value={category} className="py-2 text-lg">
                  {category}
                </option>
              );
            })}
        </select>
      </div>

      {/* Table Group */}
      <div className="w-full flex flex-col gap-4 my-4">
        {selectedTable &&
          Object.keys(selectedTable).map((tableName, index) => {
            if (tableName !== "status") {
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
                  />
                </div>
              );
            }
          })}
      </div>

      <div className="flex gap-4 my-8">
        {selectedTable &&
          enableReview &&
          selectedTable.status === "Processed" && (
            <button
              onClick={handleReview}
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
                  onClick={handleSaveToPDF}
                  className="flex justify-center"
                >
                  Save to PDF
                </MenuItem>
                <MenuItem className="flex justify-center">Save to CSV</MenuItem>
              </Menu>
            </div>
          )}
        <button
          onClick={handleDelete}
          className="w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none"
        >
          Delete
        </button>
        {/* <button
          onClick={handleClose}
          className="w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none"
        >
          Close
        </button> */}
      </div>
    </div>
  );
}
