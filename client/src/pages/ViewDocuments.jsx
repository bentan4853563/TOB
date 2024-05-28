import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ScrollToTop from "react-scroll-to-top";
import Select from "react-select";
import { confirmAlert } from "react-confirm-alert";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { setMetaData, storeTableData } from "../redux/reducers/tableSlice";

import ViewTable from "../components/ViewTable";
import AdditionalContent from "../components/ExclusionTable";

export default function CustomizedTable() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const node_server_url = import.meta.env.VITE_NODE_SERVER_URL;
  const { token } = useSelector((state) => state.auth);
  const { contents } = useSelector((state) => state.content);

  const { table } = useSelector((state) => state.table);
  const { metaData } = useSelector((state) => state.table);
  const [selectedRegulator, setSelectedRegulator] = useState("");
  const [selectedCategory, setselectedCategory] = useState("");
  const [selectedTable, setSelectedTable] = useState({});
  const [tableData, setTableData] = useState({});
  const [enableRevise, setEnableRevise] = useState(false);

  const [dha, setDha] = useState([]);
  const [haad, setHaad] = useState([]);

  const categoryOptions = Object.keys(tableData)
    .filter(
      (category) =>
        category !== "notes" &&
        selectedRegulator.label === tableData[category].regulator
    )
    .map((category) => ({
      value: category,
      label: category,
    }));

  const regulatorOptions = [
    { label: "DHA", value: "DHA" },
    { label: "HAAD", value: "HAAD" },
  ];

  useEffect(() => {
    console.log(table);
    if (table && Object.keys(table).length > 0) {
      setselectedCategory(Object.keys(table)[0]);
      setTableData(table);
    }
  }, [table]);

  useEffect(() => {
    if (contents && contents.length > 0) {
      setSelectedRegulator(regulatorOptions[0]);
      setDha(contents[0].description);
      setHaad(contents[1].description);
    }
  }, [contents]);

  useEffect(() => {
    if (categoryOptions.length > 0 && selectedRegulator) {
      setselectedCategory(categoryOptions[0].label);
    }
  }, [selectedRegulator]);

  useEffect(() => {
    if (tableData && selectedCategory !== null) {
      setSelectedTable(tableData[selectedCategory]);
    }
  }, [tableData, selectedCategory]);

  useEffect(() => {
    if (tableData && Object.keys(tableData).length > 0 && selectedCategory) {
      let generated = 0;
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

  const handleClickEdit = () => {
    navigate("/tb/edit");
  };

  const handleCategoryChange = (selectedOption) => {
    setselectedCategory(selectedOption.value);
  };

  const handleRegulatorChange = (selectedOption) => {
    setSelectedRegulator(selectedOption);
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

  const reviseProcess = async () => {
    const updatedData = Object.keys(tableData)
      .filter((category) => category !== "notes")
      .reduce((acc, category) => {
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
          version: tableData[category].version + 1,
        };
        return acc;
      }, {});

    update(updatedData);
    toast.success("Successfully Revised!!!", { position: "top-right" });
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
        console.log("res- table", tableData);
        dispatch(setMetaData(metaData));
        dispatch(storeTableData(tableData));
      } else {
        console.error("Error:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const titleMap = [
    "General Benefits",
    "In Patient Benefits",
    "Other Benefits",
    "Out Patient Benefits",
  ];

  console.log("selectedTable :>> ", selectedTable);

  return (
    <div className="w-full h-full bg-gray-100 px-8 md:px-16 xl:px-24 flex flex-col items-start justify-start">
      <div className="w-full px-8 py-4 my-4 flex justify-between items-center bg-white rounded-lg">
        <span className="text-2xl">Documents</span>
        {enableRevise ? (
          <button
            onClick={handleRevise}
            className="w-32 py-2 bg-indigo-600 text-white border-none focus:outline-none"
          >
            Revise
          </button>
        ) : (
          <button
            onClick={handleClickEdit}
            className="w-32 py-2 bg-indigo-600 text-white border-none focus:outline-none"
          >
            Edit
          </button>
        )}
      </div>
      <div className="w-full py-2 flex flex-col items-start bg-white rounded-lg divide-y divide-gray-300">
        <div className="py-2 px-8">
          <span className="text-xl font-bold font-sans">View Document</span>
        </div>
        <div className="w-full px-8 py-4 flex flex-col gap-3">
          {metaData.tobType && (
            <div className="flex flex-col gap-1">
              <label className="text-black font-bold" htmlFor="client">
                Type of TOB
              </label>
              <span className="ml-4">
                {metaData.tobType ? metaData.tobType : "None"}
              </span>
            </div>
          )}
          {metaData.client && (
            <div className="flex flex-col gap-1">
              <label className="text-black font-bold" htmlFor="client">
                Client
              </label>
              <span className="ml-4">
                {metaData.client ? metaData.client : "None"}
              </span>
            </div>
          )}
          {metaData.insurer && (
            <div className="flex flex-col gap-1">
              <label className="text-black font-bold" htmlFor="insurer">
                Insurer
              </label>
              <span className="ml-4">
                {metaData.insurer ? metaData.insurer : "None"}
              </span>
            </div>
          )}

          {metaData.broker && (
            <div className="flex flex-col gap-1">
              <label className="text-black font-bold" htmlFor="broker">
                Broker
              </label>
              <span className="ml-4">
                {metaData.broker ? metaData.broker : "None"}
              </span>
            </div>
          )}

          {metaData.sourceTOB && (
            <div className="flex flex-col gap-1">
              <label className="text-black font-bold" htmlFor="sourceTOB">
                Source TOB
              </label>
              <span className="ml-4">
                {metaData.sourceTOB ? metaData.sourceTOB : "None"}
              </span>
            </div>
          )}
        </div>
      </div>

      <ToastContainer />

      <div className="w-full mt-4 flex items-end gap-8">
        <div className="w-full flex items-end gap-8">
          {/* Category Selector */}
          <div className="w-1/2 flex gap-[2rem]">
            <div className="w-full sm:w-1/2 flex flex-col">
              <label htmlFor="regulator" className="font-bold">
                Regulator
              </label>
              <Select
                id="regulator"
                options={regulatorOptions}
                onChange={handleRegulatorChange}
                value={selectedRegulator}
                components={{
                  IndicatorSeparator: () => null,
                }}
              />
            </div>
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
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label htmlFor="status" className="font-bold">
              Status
            </label>
            <span
              id="status"
              className="bg-cyan-200 w-24 px-4 py-1.5 flex justify-center rounded-full"
            >
              {tableData &&
                Object.keys(tableData).length > 0 &&
                selectedCategory !== "" &&
                tableData[selectedCategory].status}
            </span>
          </div>
          {/* Version */}
          <div className="flex flex-col">
            <label htmlFor="version" className="font-bold">
              Version
            </label>
            <span
              id="version"
              className="bg-orange-200 w-24 px-4 py-1.5 flex justify-center rounded-full"
            >
              {tableData &&
                Object.keys(tableData).length > 0 &&
                tableData[selectedCategory].version}
            </span>
          </div>
        </div>
      </div>

      {/* Table Group */}
      <div className="w-full flex flex-col gap-4 my-4">
        {selectedTable &&
          titleMap.map((tableName, index) => {
            return (
              <div
                key={index}
                className="w-full p-4 bg-white flex flex-col items-start"
              >
                <h1 className="text-3xl text-black font-bold m-4">
                  {tableName}
                </h1>
                {selectedTable && Object.keys(selectedTable).length > 0 && (
                  <ViewTable tableData={selectedTable[tableName]} />
                )}
              </div>
            );
          })}
      </div>

      <AdditionalContent
        regulator={selectedRegulator.value}
        editable={
          Object.keys(tableData).length > 0 &&
          tableData[selectedCategory].status !== "Generated"
        }
        dha={dha}
        haad={haad}
      />

      <ScrollToTop
        className="scroll-to-top flex fixed focus:outline-none text-black shadow-md shadow-gray-800 justify-center items-center rounded-full"
        smooth
        height={18}
        style={{ zIndex: 999, fontSize: 4 }}
      />
    </div>
  );
}
