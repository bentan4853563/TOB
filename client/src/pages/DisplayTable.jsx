import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import { MdOutlineInsertComment } from "react-icons/md";
import Select from "react-select";

import "react-toastify/dist/ReactToastify.css";

import { BsEye } from "react-icons/bs";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";

import Pagination from "../components/Pagination";

import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import {
  clearMetaData,
  clearTableData,
  setMetaData,
  storeTableData,
} from "../redux/reducers/tableSlice";

import { clearLoading, setLoading } from "../redux/reducers/loadingSlice";

const DisplayTable = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const node_server_url = import.meta.env.VITE_NODE_SERVER_URL;

  const [dbTableData, setDBTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [searchValues, setSearchValues] = useState({
    broker: "",
    client: "",
  });
  const [insurer, setInsurer] = useState({});
  const [tobType, setTobType] = useState({});

  const [expand, setExpand] = useState({
    previousRow: null,
    currentRow: null,
    expanded: false,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const currentItems = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
  };

  useEffect(() => {
    dispatch(clearTableData());
    dispatch(clearMetaData());
    dispatch(setLoading());
    const fetchData = async () => {
      try {
        const response = await fetch(`${node_server_url}/api/table/readAll`, {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "x-auth-token": token, // Include the token in the Authorization header
            "ngrok-skip-browser-warning": true,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let data = await response.json();
        setDBTableData(data);
        dispatch(clearLoading());
      } catch (error) {
        console.error("Fetching data failed:", error);
      }
    };
    dispatch(setLoading());
    fetchData();
    dispatch(clearLoading());
  }, []);

  useEffect(() => {
    if (filteredData.length > 0) {
      setTotalItems(filteredData.length);
    }
  }, [filteredData]);

  const mainColumns = [
    { label: "Type of TOB", key: "tobType" },
    { label: "Insurer", key: "insurer" },
    { label: "Client", key: "client" },
    { label: "Broker", key: "broker" },
    { label: "Source TOB", key: "sourceTOB" },
  ];

  const subColumns = [
    { label: "Category", key: "category" },
    { label: "Result TOB", key: "resultTOB" },
    { label: "Version", key: "version" },
    { label: "Status", key: "status" },
  ];

  const TobTypeList = ["Elite Care", "Gulf Care", "Al Madallah", "Thiqa"];
  const companyList = [
    "ABU DHABI NATIONAL INSURANCE COMPANY",
    "ABU DHABI NATIONAL TAKAFUL COMPANY PSC",
    "AL BUHAIRA INSURANCE COMPANY",
    "AL SAGR",
    "ARAB ORIENT",
    "ARABIA INSURANCE COMPANY",
    "CIGNA",
    "DAMAN",
    "DNIRC",
    "DUBAI INSURANCE COMPANY",
    "DUBAI NATIONAL INSURANCE & REINSURANCE PSC",
    "FIDELITY UNITED INSURANCE COMPANY",
    "GIG GULF",
    "GLOBAL CARE",
    "INSURANCE HOUSE",
    "LIVA",
    "MEDGULF",
    "MEDITERRANEAN & GULF INSURANCE COMPANY",
    "METLIFE",
    "NATIONAL GENERAL INSURANCE",
    "NOW HEALTH",
    "ORIENTAL INSURANCE COMPANY",
    "RAS AL KHAIMAH INSURANCE COMPANY",
    "SALAMA",
    "SUKOON",
    "UNION",
    "WATANIA TAKAFUL",
    "WILLIAM RUSSELL",
  ];

  const typeOfTOBOptions = TobTypeList.map((tobType) => ({
    value: tobType,
    label: tobType,
  }));

  const insurerOptions = companyList.map((company) => ({
    label: company,
    value: company,
  }));

  const handleView = async (uuid) => {
    dispatch(setLoading());
    const response = await fetch(`${node_server_url}/api/table/getOne`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
        "ngrok-skip-browser-warning": true,
      },
      body: JSON.stringify({ uuid: uuid }),
    });
    const result = await response.json();
    dispatch(setMetaData(result.metaData));
    console.log(result.fileData);
    dispatch(storeTableData(result.fileData));
    navigate("/tb/view");
    dispatch(clearLoading());
  };

  const handleEdit = async (uuid) => {
    try {
      dispatch(setLoading());
      const response = await fetch(`${node_server_url}/api/table/getOne`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
          "ngrok-skip-browser-warning": true,
        },
        body: JSON.stringify({ uuid: uuid }),
      });
      if (response.ok) {
        const result = await response.json();
        dispatch(setMetaData(result.metaData));
        dispatch(storeTableData(result.fileData));
        navigate("/tb/edit");
      } else {
        if (response.status === 401) {
          navigate("/");
          toast.error("Please sign in!!!", {
            position: "top-right",
          });
        }
        console.log(response.body);
      }
      dispatch(clearLoading());
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleNew = () => {
    navigate("/tb/new");
  };

  useEffect(() => {
    handleSearch();
  }, [tobType, insurer, searchValues]);

  const handleSearch = () => {
    const filteredData = dbTableData.filter((row) => {
      const tobTypeMatch = tobType ? row.tobType === tobType : true;
      const insurerMatch = insurer ? row.insurer === insurer : true;

      const clientSearchLower = searchValues.client.toLowerCase();
      const brokerSearchLower = searchValues.broker.toLowerCase();

      // Check if the client field includes the search text or is not being searched
      // If client search value is empty, match all; otherwise, match if the row's client contains the search value
      const clientMatch =
        !searchValues.client ||
        (row.client && row.client.toLowerCase().includes(clientSearchLower));

      // Check if the broker field includes the search text or is not being searched
      // If broker search value is empty, match all; otherwise, match if the row's broker contains the search value
      const brokerMatch =
        !searchValues.broker ||
        (row.broker && row.broker.toLowerCase().includes(brokerSearchLower));

      // Only include rows that match all criteria
      return insurerMatch && tobTypeMatch && clientMatch && brokerMatch;
    });

    setFilteredData(filteredData);
  };

  const isEditable = (rowData) => {
    let generated = 0;
    rowData["statusByCategory"].map((category) => {
      if (category.status === "Generated") {
        generated = generated + 1;
      }
    });
    if (generated === rowData["statusByCategory"].length) {
      return false;
    } else {
      return true;
    }
  };
  // console.log(dbTableData, tobType, insurer, searchValues);
  // const handleKeyDown = (e) => {
  //   if (e.key === "Enter") {
  //     handleSearch();
  //   }
  // };

  return (
    <div className="w-full h-full bg-gray-100 px-8 lg:px-24 flex flex-col items-start justify-start">
      {/* Header */}
      <div className="w-full px-8 py-4 my-4 flex justify-between items-center bg-white rounded-lg">
        <span className="text-2xl">Documents</span>
        <button
          onClick={handleNew}
          className="py-2 bg-indigo-600 text-white border-none focus:outline-none"
        >
          New Document
        </button>
      </div>
      <ToastContainer />
      {/* Search form */}
      <div className="w-full py-2 flex flex-col items-start bg-white rounded-lg divide-y divide-gray-300">
        <div className="py-2 px-8">
          <span className="text-xl font-bold font-sans">Search</span>
        </div>
        <div className="w-full px-8 py-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-black" htmlFor="insurer">
              Type of TOB
            </label>
            <Select
              id="filter"
              options={typeOfTOBOptions}
              onChange={(tobType) => setTobType(tobType.value)}
              value={tobType.value}
              components={{
                IndicatorSeparator: () => null,
              }}
              className="w-full lg:w-1/2 text-black"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-black" htmlFor="tobType">
              Insurer
            </label>
            <Select
              id="tobType"
              options={insurerOptions}
              onChange={(selectedOption) => setInsurer(selectedOption.value)}
              value={insurer.value}
              components={{
                IndicatorSeparator: () => null,
              }}
              className="w-full lg:w-1/2 text-black"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-black" htmlFor="client">
              Client
            </label>
            <input
              type="text"
              name="client"
              placeholder="Please enter Client Name"
              value={searchValues.client}
              // onKeyDown={handleKeyDown}
              onChange={(e) =>
                setSearchValues({ ...searchValues, client: e.target.value })
              }
              className="w-full lg:w-1/2 text-black px-2 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:border-indigo-600"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-black" htmlFor="broker">
              Broker
            </label>
            <input
              type="text"
              name="broker"
              placeholder="Please enter Broker Name"
              value={searchValues.broker}
              // onKeyDown={handleKeyDown}
              onChange={(e) =>
                setSearchValues({ ...searchValues, broker: e.target.value })
              }
              className="w-full lg:w-1/2 text-black px-2 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:border-indigo-600"
            />
          </div>
          <button
            // onClick={handleSearch}
            className="w-32 py-2 bg-indigo-600 text-white border-none focus:outline-none"
          >
            Search
          </button>
        </div>
      </div>

      {filteredData && filteredData.length > 0 && (
        <div className="w-full py-2 my-4 flex flex-col bg-white rounded-lg divide-y divide-gray-300">
          <div className="py-2 px-8">
            <span className="text-xl font-bold font-sans">Search Results</span>
          </div>

          {/* Table */}
          <div className="px-4 py-4">
            {filteredData && (
              <table className="w-full">
                <thead>
                  <tr>
                    <th></th>
                    <th>S No</th>
                    {mainColumns.map(
                      (item, index) =>
                        item.label !== "_id" && (
                          <th className="py-3" key={index}>
                            {item.label}
                          </th>
                        )
                    )}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems &&
                    currentItems.map((row, rowIndex) => (
                      <React.Fragment key={`fragment-${row.uuid}`}>
                        <tr
                          key={`main-${row.uuid}`}
                          className="hover:bg-gray-100"
                        >
                          <td
                            onClick={() =>
                              setExpand((previous) => ({
                                previousRow: previous.currentRow,
                                currentRow: rowIndex,
                                expanded:
                                  previous.currentRow !== rowIndex ||
                                  !previous.expanded,
                              }))
                            }
                          >
                            {expand.currentRow === rowIndex &&
                            expand.expanded ? (
                              <IoIosArrowDown className="cursor-pointer" />
                            ) : (
                              <IoIosArrowForward className="cursor-pointer" />
                            )}
                          </td>
                          <td>{(currentPage - 1) * pageSize + rowIndex + 1}</td>
                          {mainColumns.map((item, colIndex) => (
                            <td key={colIndex}>{row[item.key]}</td>
                          ))}
                          <td>
                            <div className="flex gap-4">
                              <BsEye
                                className="cursor-pointer hover:text-sky-600"
                                size={20}
                                onClick={() => handleView(row.uuid)}
                              />
                              {isEditable(row) && (
                                <MdOutlineModeEditOutline
                                  className="cursor-pointer hover:text-green-600"
                                  size={20}
                                  onClick={() => handleEdit(row.uuid)}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                        {expand.currentRow === rowIndex && expand.expanded && (
                          <tr key={`sub-${rowIndex}`} className="bg-gray-50">
                            <td></td>
                            <td></td>
                            <td colSpan={mainColumns.length}>
                              <table className="w-full">
                                <thead>
                                  <tr>
                                    {subColumns.map(
                                      (subColumn, subColIndex) => (
                                        <th
                                          key={`sub-header-${subColIndex}`}
                                          className="py-2 bg-gray-200"
                                        >
                                          {subColumn.label}
                                        </th>
                                      )
                                    )}
                                    <th className="py-2 bg-gray-200">
                                      Comment
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {row["statusByCategory"].map(
                                    (subRow, subRowIndex) => (
                                      <tr key={`sub-row-${subRowIndex}`}>
                                        {subColumns.map(
                                          (subColumn, subColIndex) => (
                                            <td key={`sub-data-${subColIndex}`}>
                                              {subRow[subColumn.key]}
                                            </td>
                                          )
                                        )}
                                        <td>
                                          {subRow["comment"] &&
                                            subRow["comment"] !== "" && (
                                              <>
                                                <MdOutlineInsertComment
                                                  data-tip
                                                  data-tooltip-id={`comment-${rowIndex}`}
                                                  className="text-green-500 focus:outline-none cursor-pointer"
                                                />
                                                <Tooltip
                                                  id={`comment-${rowIndex}`}
                                                  place="bottom"
                                                  effect="solid"
                                                  content={subRow["comment"]}
                                                  style={{
                                                    width: "240px",
                                                    textAlign: "left",
                                                    fontSize: "14px",
                                                    backgroundColor: "#595959",
                                                    color: "white",
                                                    borderRadius: "4px",
                                                    padding: "8px",
                                                  }}
                                                />
                                              </>
                                            )}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {filteredData.length > 10 && (
        <Pagination
          itemsCount={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
        />
      )}
    </div>
  );
};

export default DisplayTable;
