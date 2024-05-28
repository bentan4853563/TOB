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
import "react-toastify/dist/ReactToastify.css";
import { confirmAlert } from "react-confirm-alert";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";

import ViewTable from "./ViewTable";
import EditableTable from "./EditableTable";
import ExclusionTable from "./ExclusionTable";
import AdditionalTable from "./AdditionalTable";

import { handleSaveToDB } from "../redux/actions/table";
import { handleUpdateExclusion } from "../redux/actions/content";
import { setMetaData, storeTableData } from "../redux/reducers/tableSlice";
import { clearLoading, setLoading } from "../redux/reducers/loadingSlice";

import logo from "../assets/logo.png";

export default function CustomizedTable() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const node_server_url = import.meta.env.VITE_NODE_SERVER_URL;

  const { table } = useSelector((state) => state.table);
  const { token } = useSelector((state) => state.auth);
  const { metaData } = useSelector((state) => state.table);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRegulator, setSelectedRegulator] = useState("");
  // const [manualRegulator, setManualRegulator] = useState("");
  const [filteredTable, setFilteredTable] = useState({});
  const [tableData, setTableData] = useState({});

  const [comment, setComment] = useState("");
  const [rowNumber, setRowNumber] = useState(0);
  const [tableName, setTableName] = useState("");
  const [column, setColumn] = useState("");
  const [clickedButton, setClickedButton] = useState("");
  const [reviewedAll, setReviewedAll] = useState(false);

  const [saved, setSaved] = useState(true);
  const [enableReview, setEnableReview] = useState(true);
  const [enableRevise, setEnableRevise] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const [modalIsOpen, setIsOpen] = useState(false);

  const { contents } = useSelector((state) => state.content);
  const [dha, setDha] = useState([]);
  const [haad, setHaad] = useState([]);

  const regulatorOptions = [
    { label: "HAAD", value: "HAAD" },
    { label: "DHA", value: "DHA" },
  ];

  const categoryOptions = Object.keys(tableData)
    .filter((category) => category !== "notes")
    .map((category) => ({
      value: category,
      label: category,
    }));

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "may-not-bt-edited", label: "May Not Be Edited" },
    { value: "to-be-edited", label: "To Be Edited" },
    { value: "edited", label: "Edited" },
    { value: "review-required", label: "Review Required" },
    { value: "reviewed", label: "Reviewed" },
    { value: "review-pending", label: "Review Pending" },
  ];

  const titleMap = [
    "General Benefits",
    "In Patient Benefits",
    "Out Patient Benefits",
    "Other Benefits",
  ];

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption.value);
    localStorage.setItem("category", selectedOption.value);
  };

  const handleRegulatorChange = (selectedOption) => {
    setSelectedRegulator(selectedOption.label);
  };

  const handleFilterChange = (selectedOption) => {
    setSelectedFilter(selectedOption.value);
  };

  useEffect(() => {
    return () => {
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
    if (contents && contents.length > 0) {
      contents.map((content) => {
        if (content.regulator === "DHA") setDha(content.description);
        else setHaad(content.description);
      });
    }
  }, [contents]);

  // useEffect(() => {
  //   if (categoryOptions.length > 0 && selectedRegulator) {
  //     setSelectedCategory(categoryOptions[0].label);
  //   }
  // }, [selectedRegulator]);

  useEffect(() => {
    if (tableData && Object.keys(tableData).length > 0 && selectedCategory) {
      let uncheckedCount = 0;
      let generated = 0;
      titleMap.map((tableName) => {
        if (tableData[selectedCategory][tableName]) {
          tableData[selectedCategory][tableName].map((row) => {
            if (row.color === "red" && row["Review Required"] === false)
              uncheckedCount = uncheckedCount + 1;
          });
        }
      });
      if (uncheckedCount !== 0) {
        setEnableReview(false);
      } else {
        setEnableReview(true);
      }
      Object.keys(tableData).map((category) => {
        if (tableData[category].status === "Generated") {
          generated = generated + 1;
        }
      });
      if (
        Object.keys(tableData).filter((category) => category !== "notes")
          .length === generated
      ) {
        setEnableRevise(true);
      } else {
        setEnableRevise(false);
      }
    }
  }, [tableData, selectedCategory]);

  useEffect(() => {
    if (
      selectedCategory !== "" &&
      selectedFilter !== "" &&
      Object.keys(tableData).length > 0
    ) {
      filterTableData();
    }
  }, [selectedCategory, selectedFilter, tableData]);

  useEffect(() => {
    setTableData((currentTableData) => {
      const updatedTableData = {};
      Object.keys(currentTableData).forEach((category) => {
        if (category !== "notes") {
          updatedTableData[category] = { ...currentTableData[category] };

          titleMap.map((title) => {
            if (updatedTableData[category][title]) {
              updatedTableData[category][title] = updatedTableData[category][
                title
              ].map((row) => {
                if (row["Review Required"] === true) {
                  return {
                    ...row,
                    Reviewed: reviewedAll ? reviewedAll : row.Reviewed,
                  };
                } else {
                  return row;
                }
              });
            }
          });
        } else {
          updatedTableData[category] = currentTableData[category];
        }
      });
      return updatedTableData;
    });
    setSaved(false);
  }, [reviewedAll]);

  function filterTableData() {
    const newFilteredTable = {};

    titleMap.map((tableName) => {
      switch (selectedFilter) {
        case "all":
          newFilteredTable[tableName] = tableData[selectedCategory][tableName];
          break;
        case "may-not-bt-edited":
          newFilteredTable[tableName] = tableData[selectedCategory][
            tableName
          ].filter((row) => row.color === "green" && !row.edit);
          break;
        case "to-be-edited":
          // Define what constitutes a row "to-be-edited"
          newFilteredTable[tableName] = tableData[selectedCategory][
            tableName
          ].filter((row) => row.color === "red" && !row.edit);
          break;
        case "edited":
          newFilteredTable[tableName] = tableData[selectedCategory][
            tableName
          ].filter((row) => row.edit);
          break;
        case "review-required":
          newFilteredTable[tableName] = tableData[selectedCategory][
            tableName
          ].filter((row) => row["Review Required"]);
          break;
        case "reviewed":
          newFilteredTable[tableName] = tableData[selectedCategory][
            tableName
          ].filter((row) => row.Reviewed);
          break;
        case "review-pending":
          // Define your own logic for "review pending" status
          newFilteredTable[tableName] = tableData[selectedCategory][
            tableName
          ].filter((row) => row["Review Required"] && !row.Reviewed);
          break;
        default:
          newFilteredTable[tableName] = tableData[selectedCategory][tableName];
      }
    });

    setFilteredTable(newFilteredTable);
  }

  const handleEdit = (tableName, value, rowId, fieldName) => {
    setTableData((currentTableData) => ({
      ...currentTableData,
      [selectedCategory]: {
        ...tableData[selectedCategory],
        [tableName]: tableData[selectedCategory][tableName].map((row) => {
          if (row.id === rowId) {
            return {
              ...row,
              Reviewed: false,
              [fieldName]: value,
            };
          }
          return row;
        }),
        status: "Processed",
      },
    }));
    setSaved(false);
  };

  const handleNewRow = (tableName, rowId) => {
    setTableData((currentTableData) => {
      // Find the index of the row with the corresponding rowId
      const rowIndex = currentTableData[selectedCategory][tableName].findIndex(
        (row) => row.id === rowId
      );

      // If the rowId is not found, return the original currentTableData without changes
      if (rowIndex === -1) {
        return currentTableData;
      }

      const newRow = {
        id: crypto.randomUUID(), // Generate a new unique ID for the new row
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
      };

      // Create the new table data with the new row inserted at the correct position
      const updatedTableData = {
        ...currentTableData,
        [selectedCategory]: {
          ...currentTableData[selectedCategory],
          [tableName]: [
            ...currentTableData[selectedCategory][tableName].slice(
              0,
              rowIndex + 1
            ),
            newRow,
            ...currentTableData[selectedCategory][tableName].slice(
              rowIndex + 1
            ),
          ],
          status: "Processed",
        },
      };

      return updatedTableData;
    });
  };

  const handleReason = (tableName, rowId, column) => {
    console.log(tableName, rowId, column);
    setTableData((currentTableData) => {
      const rows = currentTableData[selectedCategory][tableName];
      const rowIndex = rows.findIndex((row) => row.id === rowId);
      if (column === "Edit Reason") {
        if (rowIndex !== -1 && rows[rowIndex].edit === true) {
          setIsOpen(true);
          setRowNumber(rowIndex); // Assuming you still need the index for other purposes
          setTableName(tableName);
          setColumn(column);
          setComment(rows[rowIndex][column]);
        } else {
          toast.warning("This line has not been edited.", {
            position: "top-right",
          });
        }
      } else {
        if (rowIndex !== -1 && rows[rowIndex].Reviewed === true) {
          setIsOpen(true);
          setRowNumber(rowIndex); // Assuming you still need the index for other purposes
          setTableName(tableName);
          setColumn(column);
          setComment(rows[rowIndex][column]);
        } else {
          toast.warning("This line has not been reviewed.", {
            position: "top-right",
          });
        }
      }
      return currentTableData;
    });
    setSaved(false);
  };

  const handleEditConfirm = (tableName, rowId, column) => {
    setTableData((currentTableData) => ({
      ...currentTableData,
      [selectedCategory]: {
        ...tableData[selectedCategory],
        [tableName]: tableData[selectedCategory][tableName].map((row) => {
          if (row.id === rowId && column === "edit") {
            if (row.Reviewed) {
              return row;
            }
            return {
              ...row,
              ["New Benefit"]: row.edit ? "" : row["benefit"],
              ["New Limit"]: row.edit ? "" : row["limit"],
              edit: !row.edit,
              "Review Required": row.edit ? false : true,
            };
          } else {
            return row;
          }
        }),
        status: "Processed",
      },
    }));
    setSaved(false);
  };

  const handleReviewConfirm = (tableName, rowId, column) => {
    setTableData((currentTableData) => ({
      ...currentTableData,
      [selectedCategory]: {
        ...tableData[selectedCategory],
        [tableName]: tableData[selectedCategory][tableName].map((row) => {
          if (row.id === rowId && column === "Reviewed") {
            return {
              ...row,
              Reviewed: !row.Reviewed,
              "Review Comment": comment,
            };
          } else {
            return row;
          }
        }),
        status: "Processed",
      },
    }));
    setSaved(false);
  };

  const handleReviewAll = () => {
    let reviewRequiredRow = 0;

    Object.keys(tableData)
      .filter((category) => category !== "notes")
      .forEach((category) => {
        titleMap.forEach((title) => {
          if (tableData[category][title]) {
            tableData[category][title].forEach((row) => {
              if (row["Review Required"] === true) {
                reviewRequiredRow += 1; // Simplified incrementation
              }
            });
          }
        });
      });

    if (reviewRequiredRow > 0) setReviewedAll(!reviewedAll);
  };

  const handleSaveCommentForRow = () => {
    setTableData((currentTableData) => ({
      ...currentTableData,
      [selectedCategory]: {
        ...tableData[selectedCategory],
        [tableName]: tableData[selectedCategory][tableName].map(
          (row, index) => {
            if (index === rowNumber && column === "Edit Reason") {
              return {
                ...row,
                ["New Benefit"]: row["benefit"],
                ["New Limit"]: row["limit"],
                edit: true,
                "Review Required": true,
                "Edit Reason": comment,
              };
            } else if (index === rowNumber && column === "Review Comment") {
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

  const handleDeleteRow = (tableName, rowId) => {
    setTableData((currentTableData) => ({
      ...currentTableData,
      [selectedCategory]: {
        ...currentTableData[selectedCategory],
        [tableName]: currentTableData[selectedCategory][tableName].filter(
          (row) => row.id !== rowId
        ),
      },
    }));
    toast.success("Successfully deleted the selected row");
    setSaved(false);
  };

  const handleReviewSeletedCategory = async () => {
    let required = 0;
    let reviewed = 0;
    titleMap.forEach((title) => {
      tableData[selectedCategory][title].forEach((row) => {
        if (row["Review Required"]) required++;
        if (row.Reviewed) reviewed++;
      });
    });

    if (required === reviewed) {
      setClickedButton("handleReview");
      setIsOpen(true);
    } else {
      toast.warning(
        `${required} / ${required - reviewed} Record still under review.`,
        {
          position: "top-right",
        }
      );
    }
  };

  const reviewCategoryProcess = () => {
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

    toast.success("Successfuly Reviewed!!!", {
      position: "top-right",
    });

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
    const updatedData = Object.keys(tableData).reduce((acc, category) => {
      if (category !== "notes") {
        acc[category] = {
          ...tableData[category],
          ...Object.keys(tableData[category]).reduce((innerAcc, title) => {
            if (
              title !== "status" &&
              title !== "comment" &&
              title !== "version"
            ) {
              const isDataArray = Array.isArray(tableData[category][title]);
              if (isDataArray) {
                innerAcc[title] = tableData[category][title].map((row) => {
                  if (row.edit === true || row.Reviewed === true) {
                    return {
                      ...row,
                      benefit: row["New Benefit"],
                      limit: row["New Limit"],
                      color: "green",
                    };
                  }
                  return { ...row, color: "green" };
                });
              } else {
                console.error(
                  `Expected an array for ${title}, but received:`,
                  tableData[category][title]
                );
                innerAcc[title] = tableData[category][title];
              }
            }
            return innerAcc;
          }, {}),
          status: "Processed",
          comment: comment || "",
          version: tableData[category].version + 1,
        };
      } else {
        acc[category] = tableData[category];
      }
      return acc;
    }, {});

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

  const handleSave = () => {
    dispatch(handleSaveToDB(tableData, metaData, token));

    // Filter out contents that do not match the selectedRegulator
    const matchedContents = contents.filter(
      (content) => content.regulator === selectedRegulator
    );

    // Ensure that at least one content matches before trying to access properties.
    if (matchedContents.length > 0) {
      const exclusionData = {
        id: matchedContents[0]._id,
        description: (() => {
          if (selectedRegulator === "DHA") return dha;
          else if (selectedRegulator === "HAAD") return haad;
          else return null;
        })(), // Immediately invoked function expression to calculate description
      };

      console.log("exclusionData :>> ", exclusionData);
      dispatch(handleUpdateExclusion(exclusionData));
    }

    setSaved(true);
  };

  const handleSaveToPDF = async () => {
    dispatch(setLoading());
    const doc = new jsPDF();

    const pdfColumns = ["benefit", "limit"];
    const headers = pdfColumns.map((header) => capitalizeFirstLetter(header));
    let currentY = 30; // Starting Y position for the first section (after the logo)

    const addLogoToPage = () => {
      const pdfWidth = doc.internal.pageSize.getWidth();
      doc.addImage(logo, "PNG", pdfWidth - 40, 10, 30, 10);
    };

    titleMap.forEach((title) => {
      const sectionData =
        tableData[selectedCategory] && tableData[selectedCategory][title];
      if (Array.isArray(sectionData) && sectionData.length > 0) {
        // Add a new page if the current section won't fit on the current page
        if (
          currentY + sectionData.length * 8 + 20 >
          doc.internal.pageSize.getHeight() - 20
        ) {
          doc.addPage();
          currentY = 30;
          addLogoToPage();
        } else {
          addLogoToPage(); // Add the logo to the current page
        }

        doc.setFontSize(14);
        doc.text(title, 20, currentY);

        if (title === "General Benefit") {
          doc.setFontSize(10);
          doc.text(
            `Client: ${metaData.client}     Category: ${selectedCategory}`,
            20,
            currentY + 10
          );
        }

        doc.autoTable({
          startY: title === "General Benefit" ? currentY + 20 : currentY + 5,
          head: [["S No"].concat(headers)],
          body: sectionData.map((item, index) => {
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
        });

        currentY += sectionData.length * 8 + 50; // Update the currentY for the next section
      } else {
        console.error(
          `No data provided for title "${title}", skipping section.`
        );
      }
    });

    if (tableData.notes && tableData.notes.length > 0) {
      // Add a new page if the notes section won't fit on the current page
      if (
        currentY + tableData.notes.length * 8 + 40 >
        doc.internal.pageSize.getHeight() - 20
      ) {
        doc.addPage();
        currentY = 30;
        addLogoToPage();
      } else {
        addLogoToPage(); // Add the logo to the current page
      }

      doc.setFontSize(14);
      doc.text("Notes", 20, currentY);

      doc.autoTable({
        startY: currentY + 10,
        head: [["No", "Description"]], // Set headers for the notes
        body: tableData.notes.map((note, index) => [
          (index + 1).toString(),
          note.toString(),
        ]),
      });

      currentY += tableData.notes.length * 8 + 30; // Update the currentY for the exclusions section
    }

    // Add the exclusions section
    const exclusionData = selectedRegulator === "DHA" ? dha : haad;

    // Add a new page if the exclusions section won't fit on the current page
    if (
      currentY + exclusionData.length * 8 + 30 >
      doc.internal.pageSize.getHeight() - 20
    ) {
      doc.addPage();
      currentY = 30;
      addLogoToPage();
    } else {
      addLogoToPage(); // Add the logo to the current page
    }

    doc.setFontSize(14);
    doc.text(`${selectedRegulator} Exclusions`, 20, currentY);

    doc.autoTable({
      startY: currentY + 5,
      head: [["No", "Description"]],
      body: exclusionData.map((desc, index) => [
        (index + 1).toString(),
        desc.toString(),
      ]),
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

    if (tableData.notes && tableData.notes.length > 0) {
      csvData += `"Notes"\n`;
      csvData += `"No","Description"\n`; // Set headers for the notes
      csvData +=
        tableData.notes
          .map(
            (note, index) =>
              `"${(index + 1).toString()}","${note.replace(/"/g, '""')}"`
          )
          .join("\n") + "\n\n";
    }

    // Include Exclusions after all sections
    const exclusionData = selectedRegulator === "DHA" ? dha : haad;
    csvData += `"${selectedRegulator} Exclusions"\n`;
    csvData += `"No","Description"\n`;
    csvData += exclusionData
      .map((desc, index) => {
        return `"${(index + 1).toString()}","${desc
          .toString()
          .replace(/"/g, '""')}"`;
      })
      .join("\n");

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

    if (tableData.notes && tableData.notes.length > 0) {
      const notesHeaders = ["No", "Description"]; // Set headers for the notes
      const notesWorkSheetData = tableData.notes.map((note, index) => ({
        No: (index + 1).toString(),
        Description: note.toString(),
      }));

      const notesWorkSheet = utils.json_to_sheet(notesWorkSheetData, {
        header: notesHeaders,
        skipHeader: false, // Include headers in the worksheet
      });

      utils.book_append_sheet(workBook, notesWorkSheet, "Notes"); // Append worksheet for notes
    }

    // Include Exclusions after all sections
    const exclusionData = selectedRegulator === "DHA" ? dha : haad;
    const exclusionHeaders = ["No", "Description"];
    const exclusionWorkSheetData = exclusionData.map((desc, index) => ({
      No: (index + 1).toString(),
      Description: desc.toString(),
    }));

    // Create worksheet with headers and data
    const exclusionWorkSheet = utils.json_to_sheet(exclusionWorkSheetData, {
      header: exclusionHeaders,
      skipHeader: false,
    });

    // Append worksheet to workbook for Exclusions
    utils.book_append_sheet(
      workBook,
      exclusionWorkSheet,
      `${selectedRegulator} Exclusions`
    );

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

  function closeModal() {
    setIsOpen(false);
    setTableName("");
    setColumn("");
  }

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      borderRadius: "8px",
      transform: "translate(-50%, -50%)",
    },
  };

  const modalHeather = () => {
    if (column === "") {
      if (clickedButton === "handleReview") {
        return <h2 className="text-2xl mb-4 font-medium">Review</h2>;
      }
    } else {
      if (column === "Edit Reason") {
        return <h2 className="text-2xl mb-4 font-medium">Reason For Edit</h2>;
      } else if (column === "Review Comment") {
        return <h2 className="text-2xl mb-4 font-medium">Review Comment</h2>;
      }
    }
  };

  const handleEditExclusion = (index, newValue) => {
    if (selectedRegulator === "DHA") {
      const updatedDha = [...dha];
      updatedDha[index] = newValue;
      setDha(updatedDha);
    } else if (selectedRegulator === "HAAD") {
      const updatedHaad = [...haad];
      updatedHaad[index] = newValue;
      setHaad(updatedHaad);
    }
  };

  const handleNewExclusion = (index) => {
    if (selectedRegulator === "DHA") {
      const updatedDha = [...dha];
      updatedDha.splice(index + 1, 0, ""); // Insert a new empty row next to the clicked row
      setDha(updatedDha);
    } else if (selectedRegulator === "HAAD") {
      const updatedHaad = [...haad];
      updatedHaad.splice(index + 1, 0, ""); // Insert a new empty row next to the clicked row
      setHaad(updatedHaad);
    }
  };

  const handleDeleteExclusion = (index) => {
    confirmAlert({
      title: "Delete!",
      message: "Are you sure?",
      buttons: [
        {
          label: "Delete",
          onClick: async () => {
            if (selectedRegulator === "DHA") {
              const updatedDha = [...dha];
              updatedDha.splice(index, 1);
              setDha(updatedDha);
            } else if (selectedRegulator === "HAAD") {
              const updatedHaad = [...haad];
              updatedHaad.splice(index, 1);
              setHaad(updatedHaad);
            }
          },
        },
        {
          label: "Cancel",
          onClick: () => {},
        },
      ],
    });
  };

  // Adds a new empty note immediately after the selected index
  const handleNewAdditional = (index) => {
    setTableData((currentTableData) => {
      const updatedNotes = [...currentTableData.notes];
      updatedNotes.splice(index + 1, 0, "");

      return {
        ...currentTableData,
        notes: updatedNotes,
      };
    });
  };

  // Edits an existing note at a given index with the new value
  const handleEditAdditional = (index, newValue) => {
    setTableData((currentTableData) => ({
      ...currentTableData,
      notes: currentTableData.notes.map(
        (note, i) => (i === index ? newValue : note) // Only updates the note at the specific index
      ),
    }));
  };

  // Deletes a note at a given index from the array
  const handleDeleteAdditional = (index) => {
    setTableData((currentTableData) => ({
      ...currentTableData,
      notes: currentTableData.notes.filter((_, i) => i !== index), // Removes the note at the specified index
    }));
  };

  Modal.setAppElement("#root");
  console.log("tableData", tableData);
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
              column !== ""
                ? column === "Edit Reason"
                  ? "Reason"
                  : "Comment"
                : "Review Comments"
            }
            required
            value={comment}
            autoFocus
            className="w-full h-24 max-h-32 min-h-24 p-2 border border-gray-300 focus:border-gray-500 rounded-md focus:outline-none"
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex gap-8">
            <button
              className="px-2 py-1 rounded-md bg-emerald-500 text-white active:bg-emerald-600 active:outline-none"
              onClick={
                column !== "" ? handleSaveCommentForRow : reviewCategoryProcess
              }
            >
              Submit
            </button>
            <button
              className="bg-gray-200 px-2 py-1 rounded-md outline-none active:outline-none"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
      <ToastContainer />

      <div className="flex items-end gap-8">
        <div className="w-1/2 flex gap-[2rem]">
          {/* Category Select */}
          <div className="w-full sm:w-1/2 flex flex-col">
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
              components={{
                IndicatorSeparator: () => null,
              }}
            />
          </div>

          {/* Regulator Select */}
          {selectedCategory !== "" &&
          tableData[selectedCategory].regulator === "" ? (
            <div className="w-full sm:w-1/2 flex flex-col">
              <label htmlFor="regulator" className="font-bold">
                Regulator
              </label>
              <input
                type="text"
                value={selectedRegulator}
                onChange={(e) => setSelectedRegulator(e.target.value)}
                className="border border-gray-400 rounded-md p-1"
              />
            </div>
          ) : (
            <div className="w-full sm:w-1/2 flex flex-col">
              <label htmlFor="regulator" className="font-bold">
                Regulator
              </label>
              <Select
                id="regulator"
                options={regulatorOptions}
                onChange={handleRegulatorChange}
                value={regulatorOptions.find(
                  (option) => option.value === selectedRegulator
                )}
                components={{
                  IndicatorSeparator: () => null,
                }}
              />
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex flex-col items-center">
          <label htmlFor="status" className="font-bold">
            Status
          </label>
          <span
            id="status"
            className="w-40 bg-cyan-200 px-4 py-2 flex justify-center rounded-full"
          >
            {tableData &&
              Object.keys(tableData).length > 0 &&
              selectedCategory &&
              Object.keys(tableData[selectedCategory].length > 0) &&
              tableData[selectedCategory].status}
          </span>
        </div>

        {/* Version */}
        <div className="flex flex-col items-center">
          <label htmlFor="version" className="font-bold">
            Version
          </label>
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
            components={{
              IndicatorSeparator: () => null,
            }}
          />
        </div>
      </div>

      {/* Table Group */}
      <div className="w-full flex flex-col gap-4 my-4">
        <label
          htmlFor="review-all"
          className="flex items-center ml-auto mr-[10rem]"
        >
          <input
            id="review-all"
            type="checkbox"
            checked={reviewedAll}
            onChange={handleReviewAll}
            className="h-4 w-4 mr-4"
          />
          Review All
        </label>
        {filteredTable &&
          Object.keys(filteredTable).length > 0 &&
          titleMap.map((tableName, index) => {
            if (filteredTable[tableName]) {
              let table = Object.values(filteredTable[tableName]);
              return (
                <div
                  key={index}
                  className="w-full px-8 pb-8 bg-white flex flex-col items-start"
                >
                  <h1 className="text-3xl text-black font-bold m-4">
                    {tableName}
                  </h1>
                  {tableData[selectedCategory].status !== "Generated" ? (
                    <EditableTable
                      tableName={tableName}
                      tableData={table}
                      handleEdit={handleEdit}
                      newRow={handleNewRow}
                      handleReason={handleReason}
                      handleEditConfirm={handleEditConfirm}
                      handleReviewConfirm={handleReviewConfirm}
                      handleDelete={handleDeleteRow}
                    />
                  ) : (
                    <ViewTable tableData={table} />
                  )}
                </div>
              );
            }
          })}
      </div>

      {tableData &&
        tableData.notes &&
        Object.keys(tableData.notes).length > 0 && (
          <div className="bg-white px-8 pb-8">
            <AdditionalTable
              notes={tableData.notes.notes}
              handleNewAdditional={handleNewAdditional}
              handleEditAdditional={handleEditAdditional}
              handleDeleteAdditional={handleDeleteAdditional}
            />
          </div>
        )}

      {selectedRegulator !== "" && (
        <div className="bg-white px-8 pb-8 mt-8">
          <ExclusionTable
            regulator={selectedRegulator}
            editable={
              Object.keys(tableData).length > 0 &&
              tableData[selectedCategory].status !== "Generated"
            }
            dha={dha}
            haad={haad}
            handleNewExclusion={handleNewExclusion}
            handleEditExclusion={handleEditExclusion}
            handleDeleteExclusion={handleDeleteExclusion}
          />
        </div>
      )}

      {!enableRevise && (
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
            (tableData[selectedCategory].status === "To Be Reviewed" ||
              tableData[selectedCategory].status === "Processed") &&
            saved && (
              <button
                onClick={handleReviewSeletedCategory}
                className="w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none"
              >
                Review
              </button>
            )}

          {tableData &&
            tableData[selectedCategory] &&
            tableData[selectedCategory].status === "Reviewed" &&
            saved && (
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

          {enableRevise && (
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
      )}
    </div>
  );
}
