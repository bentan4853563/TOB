import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { BsEye } from "react-icons/bs";
import { BsTrash3 } from "react-icons/bs";
import { MdOutlineModeEditOutline } from "react-icons/md";

import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import {
  clearMetaData,
  clearTableData,
  setMetaData,
  setTableData,
} from "../redux/reducers/tableSlice";

import { clearLoading, setLoading } from "../redux/reducers/loadingSlice";

const DisplayTable = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const base_URL = import.meta.env.VITE_BACKEND_URL;

  const [dbTableData, setDBTableData] = useState([]);
  const [showData, setShowData] = useState([]);

  const status = useLocation().state;

  useEffect(() => {
    console.log(status);
    if (status) {
      const filteredData = dbTableData.filter((row) => row.status === status);
      setShowData(filteredData);
    }
  }, [status, dbTableData]);

  useEffect(() => {
    dispatch(clearTableData());
    dispatch(clearMetaData());
    const fetchData = async () => {
      try {
        dispatch(setLoading());
        const response = await fetch(`${base_URL}/table/readAll`, {
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
        data = data.map((item) => ({
          previousInsurer: item.previousInsurer,
          client: item.client,
          broker: item.broker,
          sourceTOB: item.sourceTOB,
          resultTOB: item.resultTOB,
          status: item.status,
        }));
        setDBTableData(data);
        dispatch(clearLoading());
      } catch (error) {
        console.error("Fetching data failed:", error);
      }
    };
    dispatch(setLoading());
    fetchData();
    dispatch(clearLoading());
  }, [dispatch]);

  useEffect(() => {}, [dbTableData]);

  const columns =
    dbTableData && dbTableData.length > 0 ? Object.keys(dbTableData[0]) : [];
  const handleDelete = async (id) => {
    confirmAlert({
      title: "Confirm!",
      message: "Are you sure to do this.",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              dispatch(setLoading());
              const response = await fetch(`${base_URL}/table/delete/${id}`, {
                method: "DELETE",
                headers: {
                  "x-auth-token": token,
                  "ngrok-skip-browser-warning": true,
                },
              });
              if (response.ok) {
                setDBTableData((previousData) =>
                  previousData.filter((item) => item._id !== id)
                );
                console.error("Failed to delete the item:", response.status);
              }
              dispatch(clearLoading());
            } catch (error) {
              console.error("Error occurred while deleting the item:", error);
            }
          },
        },
        {
          label: "No",
          onClick: () => console.log("no"),
        },
      ],
    });
  };

  // const handleClickUpload = () => {
  // 	setSettingModalOpen(true);
  // 	// setIsModalOpen(false);
  // };

  const handleView = async (index) => {
    dispatch(setLoading());
    const metaData = showData[index];
    console.log(index, metaData);
    dispatch(setMetaData(metaData));
    const response = await fetch(`${base_URL}/table/getOne`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
        "ngrok-skip-browser-warning": true,
      },
      body: JSON.stringify(metaData),
    });
    const result = await response.json();
    console.log("result", result);
    // dispatch(setMetaData(result.metaData));
    dispatch(setTableData(result.fileData));
    navigate("/tb/view");
    dispatch(clearLoading());
  };

  const handleEdit = async (index) => {
    dispatch(setLoading());
    const metaData = showData[index];
    dispatch(setMetaData(metaData));
    const response = await fetch(`${base_URL}/table/getOne`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
        "ngrok-skip-browser-warning": true,
      },
      body: JSON.stringify(metaData),
    });
    const result = await response.json();
    // dispatch(setMetaData(result.metaData));
    dispatch(setTableData(result.fileData));
    navigate("/tb/new_or_edit");
    dispatch(clearLoading());
  };

  const handleNewAndEdit = () => {
    navigate("/tb/new_or_edit");
  };

  const [searchValues, setSearchValues] = useState({
    broker: "",
    client: "",
    insurer: "",
  });

  // const handleSearch = async () => {
  // 	dispatch(setLoading());
  // 	const searchData = {
  // 		broker,
  // 		client,
  // 		insurer,
  // 	};
  // 	const response = await fetch(`${base_URL}/table/search`, {
  // 		method: "POST",
  // 		headers: {
  // 			"Content-Type": "application/json",
  // 			"x-auth-token": token,
  // 			"ngrok-skip-browser-warning": true,
  // 		},
  // 		body: JSON.stringify(searchData),
  // 	});
  // 	const result = await response.data;
  // 	setDBTableData(result);
  // 	// dispatch(setMetaData(result.metaData));
  // 	// dispatch(setTableData(result.fileData));
  // 	// dispatch(setFileName(metaData.sourceTOB));
  // 	// navigate("/tb/new_or_edit");
  // 	dispatch(clearLoading());
  // };

  const areAllSearchValuesEmpty = () => {
    return Object.values(searchValues).every((value) => value.trim() === "");
  };

  const handleSearch = () => {
    if (areAllSearchValuesEmpty()) {
      toast.error("Please input any fields!", {
        position: "top-right",
      });
    } else {
      console.log(dbTableData);
      const filteredData = dbTableData.filter((row) => {
        // Safely access and convert strings to lowercase, ensuring they are defined first
        const previousInsurer = row.previousInsurer
          ? row.previousInsurer.toLowerCase()
          : "";
        const client = row.client ? row.client.toLowerCase() : "";
        const broker = row.broker ? row.broker.toLowerCase() : "";

        return (
          (!searchValues.insurer ||
            previousInsurer.includes(searchValues.insurer.toLowerCase())) &&
          (!searchValues.client ||
            client.includes(searchValues.client.toLowerCase())) &&
          (!searchValues.broker ||
            broker.includes(searchValues.broker.toLowerCase()))
        );
      });
      setShowData(filteredData);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const insuranceCompanies = [
    "ABU DHABI NATIONAL INSURANCE COMPANY",
    "SUKOON",
    "ARAB ORIENT",
    "METLIFE",
    "CIGNA",
    "GIG GULF",
    "RAS AL KHAIMAH INSURANCE COMPANY",
    "NATIONAL GENERAL INSURANCE",
    "DUBAI INSURANCE COMPANY",
    "DUBAI NATIONAL INSURANCE & REINSURANCE PSC",
    "LIVA",
    "ABU DHABI NATIONAL TAKAFUL COMPANY PSC",
    "NOW HEALTH",
    "SALAMA",
    "DNIRC",
    "WATANIA TAKAFUL",
    "INSURANCE HOUSE",
    "AL BUHAIRA INSURANCE COMPANY",
    "UNION",
    "MEDGULF",
    "AL SAGR",
    "DAMAN",
    "MEDITERRANEAN & GULF INSURANCE COMPANY",
    "ARABIA INSURANCE COMPANY",
    "FIDELITY UNITED INSURANCE COMPANY",
    "WILLIAM RUSSELL",
    "ORIENTAL INSURANCE COMPANY",
    "GLOBAL CARE",
  ];

  return (
    <div className="w-full h-full bg-gray-100 px-8 lg:px-24 flex flex-col items-start justify-start">
      {/* Header */}
      <div className="w-full px-8 py-4 my-4 flex justify-between items-center bg-white rounded-lg">
        <span className="text-2xl">Documents</span>
        <button
          onClick={handleNewAndEdit}
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
              Insurer
            </label>
            <select
              name="insurer"
              id="insurer"
              onChange={(e) =>
                setSearchValues({ ...searchValues, insurer: e.target.value })
              }
              className="w-full lg:w-1/2 px-2 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:border-indigo-600"
            >
              <option value=""></option>
              {insuranceCompanies.map((item, index) => {
                return (
                  <option key={index} value={item}>
                    {item}
                  </option>
                );
              })}
            </select>
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
              onKeyDown={handleKeyDown}
              onChange={(e) =>
                setSearchValues({ ...searchValues, client: e.target.value })
              }
              className="w-full lg:w-1/2 px-2 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:border-indigo-600"
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
              onKeyDown={handleKeyDown}
              onChange={(e) =>
                setSearchValues({ ...searchValues, broker: e.target.value })
              }
              className="w-full lg:w-1/2 px-2 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:border-indigo-600"
            />
          </div>
          <button
            onClick={handleSearch}
            className="w-32 py-2 bg-indigo-600 text-white border-none focus:outline-none"
          >
            Search
          </button>
        </div>
      </div>
      {dbTableData && dbTableData.length > 0 && (
        <div className="w-full py-2 my-4 flex flex-col bg-white rounded-lg divide-y divide-gray-300">
          <div className="py-2 px-8">
            <span className="text-xl font-bold font-sans">Search Results</span>
          </div>
          <div className="px-4 py-4">
            {showData && (
              <table className="w-full">
                <thead>
                  <tr>
                    <th>S No</th>
                    {columns.map(
                      (item, index) =>
                        item !== "_id" && (
                          <th className="py-3" key={index}>
                            {capitalizeFirstLetter(item)}
                          </th>
                        )
                    )}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {showData &&
                    showData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-100">
                        <td>{rowIndex + 1}</td>
                        {columns.map(
                          (colKey, colIndex) =>
                            colKey !== "_id" && (
                              <td key={colIndex}>{row[colKey]}</td>
                            )
                        )}
                        <td>
                          <div className="flex gap-2">
                            <BsEye
                              className="cursor-pointer"
                              size={20}
                              onClick={() => handleView(rowIndex)}
                            />
                            <MdOutlineModeEditOutline
                              className="cursor-pointer"
                              size={20}
                              onClick={() => handleEdit(rowIndex)}
                            />
                            <BsTrash3
                              className="cursor-pointer"
                              size={20}
                              onClick={() => handleDelete(row._id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayTable;
