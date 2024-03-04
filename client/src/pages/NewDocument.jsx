import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { IoClose } from "react-icons/io5";
import { clearLoading, setLoading } from "../redux/reducers/loadingSlice";
import {
  setTableData,
  setUploadedFile,
  setMetaData,
  clearTablData,
} from "../redux/reducers/tableSlice";
import EditableTable from "../components/EditableTable/EditableTable";

const NewDocument = () => {
  const customdispatch = useDispatch();
  const { metaData } = useSelector((state) => state.table);

  const [tobType, setTobType] = useState("");
  const [catetoryInput, setCategoryInput] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [file, setFile] = useState(null);
  const [broker, setBroker] = useState("");
  const [client, setClient] = useState("");
  const [insurer, setInsurer] = useState("");

  const [isDisabled, setIsDisabled] = useState(true);

  const [metaFormErrors, setMetaFormErrors] = useState({
    broker: "",
    client: "",
    insurer: "",
    tobType: "",
    file: "",
    categoryList: "",
  });

  const tobTypeList = ["Standard", "EliteCare", "GulfCare"];
  const companyList = [
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

  useEffect(() => {
    setIsDisabled(Object.keys(metaData).length > 0);
  }, [metaData]);

  useEffect(() => {
    setBroker(metaData.broker);
    setClient(metaData.client);
    setInsurer(metaData.previousInsurer);
    setTobType(metaData.topType);
    setInsurer(metaData.previousInsurer);
  }, []);

  useEffect(() => {
    if (categoryList && categoryList.length > 0) {
      setMetaFormErrors({ ...metaFormErrors, categoryList: "" });
    }
  }, [categoryList]);

  const handleProcess = async () => {
    let newErrors = {};
    if (!insurer || !insurer.trim()) {
      newErrors.insurer = "Insurer is required";
    }
    if (!broker || !broker.trim()) {
      newErrors.broker = "Broker is required";
    }
    if (!client || !client.trim()) {
      newErrors.client = "Client is required";
    }
    if (!tobType || !tobType) {
      newErrors.tobType = "Type of TOB field must include one section.";
    }
    if (categoryList.length === 0) {
      newErrors.categoryList = "Category list is required.";
    }
    if (!file || !file) {
      newErrors.file = "Please upload a file.";
    }

    setMetaFormErrors(newErrors);

    // Check if there are no errors in the newErrors object
    if (Object.keys(newErrors).length === 0) {
      const newMetaData = {
        broker: broker,
        client: client,
        sourceTOB: file.name,
        previousInsurer: insurer,
      };
      customdispatch(setMetaData(newMetaData));
      handleFetch();
    }
  };

  const handleFocus = (e) => {
    setMetaFormErrors({ ...metaFormErrors, [e.target.name]: "" });
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveSection = (param) => {
    setCategoryList((prev) => prev.filter((item, index) => index !== param));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setCategoryList((prev) => [...prev, e.target.value]);
      setCategoryInput("");
      setMetaFormErrors({ ...metaFormErrors, section: "" });
    }
  };

  const handleFetch = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category_list", JSON.stringify(categoryList));
    customdispatch(setLoading());
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PYTHON_BACKEND_URL}/generateDoc`,
        {
          method: "POST",
          body: formData,
          "ngrok-skip-browser-warning": true,
        }
      );
      if (response.ok) {
        const data = await response.json();
        customdispatch(setUploadedFile(file.name));
        customdispatch(setTableData(data));
        customdispatch(clearLoading());
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="w-full h-full bg-gray-100 px-8 md:px-16 xl:px-24 flex flex-col items-start justify-start">
      <div className="w-full px-8 py-4 my-4 flex justify-start items-center bg-white rounded-lg">
        <span className="text-2xl">Documents</span>
      </div>
      <div className="w-full py-2 flex flex-col items-start bg-white rounded-lg divide-y divide-gray-300">
        <div className="py-2 px-8">
          <span className="text-xl font-bold font-sans">New Document</span>
        </div>
        <div className="w-full px-8 py-2 flex flex-col gap-2">
          <div className="flex flex-col">
            <label htmlFor="insurer">Insurer</label>
            <select
              name="insurer"
              id="insurer"
              disabled={isDisabled}
              onClick={handleFocus}
              onChange={(e) => setInsurer(e.target.value)}
              className="border border-gray-200 rounded-lg w-full lg:w-2/3 px-2 py-2 outline-none focus:border-sky-700"
            >
              <option value=""></option>
              {companyList.map((option, index) => {
                return <option key={index}>{option}</option>;
              })}
            </select>
            {metaFormErrors.insurer && (
              <p className="w-full text-red-400 text-xs text-left">
                {metaFormErrors.insurer}
              </p>
            )}
          </div>
          <div className="flex flex-col">
            <label htmlFor="client">Client</label>
            <input
              type="text"
              name="client"
              id="client"
              value={client}
              disabled={isDisabled}
              onFocus={handleFocus}
              onChange={(e) => setClient(e.target.value)}
              className="border border-gray-200 rounded-lg w-full lg:w-2/3 px-2 py-2 outline-none focus:border-sky-700"
            />
            {metaFormErrors.client && (
              <p className="w-full text-red-400 text-xs text-left">
                {metaFormErrors.client}
              </p>
            )}
          </div>
          <div className="flex flex-col">
            <label htmlFor="broker">Broker</label>
            <input
              type="text"
              name="broker"
              id="broker"
              value={broker}
              disabled={isDisabled}
              onFocus={handleFocus}
              onChange={(e) => setBroker(e.target.value)}
              className="border border-gray-200 rounded-lg w-full lg:w-2/3 px-2 py-2 outline-none focus:border-sky-700"
            />
            {metaFormErrors.broker && (
              <p className="w-full text-red-400 text-xs text-left">
                {metaFormErrors.broker}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="tobType">Type of TOB</label>
            <select
              name="tobType"
              id="tobType"
              onClick={handleFocus}
              disabled={isDisabled}
              onChange={(e) => setTobType(e.target.value)}
              className="border border-gray-200 rounded-lg w-full lg:w-2/3 px-2 py-2 outline-none focus:border-sky-700"
            >
              <option value=""></option>
              {tobTypeList.map((item, index) => {
                return (
                  <option id="tobType" key={index} value={item}>
                    {item}
                  </option>
                );
              })}
            </select>
            {metaFormErrors.tobType && (
              <p className="w-full text-red-400 text-xs text-left">
                {metaFormErrors.tobType}
              </p>
            )}
          </div>
          <div className="flex flex-col">
            <label htmlFor="category_list">Category List</label>
            <input
              id="set_List"
              type="text"
              name="category"
              disabled={isDisabled}
              value={catetoryInput}
              onChange={(e) => {
                setCategoryInput(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              className="border border-gray-200 rounded-lg w-full lg:w-2/3 px-2 py-2 outline-none focus:border-sky-700"
            />
          </div>
          <div>
            <div className="w-full lg:w-2/3 p-2 flex flex-wrap gap-2 min-h-16  border border-gray-200 rounded-lg">
              {categoryList &&
                categoryList.length > 0 &&
                categoryList.map((item, index) => {
                  return (
                    <span
                      key={index}
                      className="h-8 pl-4 pr-5 py-2 flex items-center rounded-sm relative bg-green-100"
                    >
                      {item}
                      <IoClose
                        className="w-4 h-4 absolute top-0.5 right-0.5 cursor-pointer"
                        onClick={() => handleRemoveSection(index)}
                      />
                    </span>
                  );
                })}
            </div>
            {metaFormErrors.categoryList && (
              <p className="w-full text-red-400 text-xs text-left">
                {metaFormErrors.categoryList}
              </p>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-black" htmlFor="sourceTOB">
              Source TOB File
            </label>
            <div className="flex gap-2 w-full lg:w-2/3">
              <div className="flex flex-col flex-1">
                <input
                  type="text"
                  value={file ? file.name : ""}
                  className="w-full px-4 py-1.5 rounded-md border border-gray-200"
                  disabled
                />
                {metaFormErrors.file && (
                  <p className="w-full text-red-400 text-xs text-left">
                    {metaFormErrors.file}
                  </p>
                )}
              </div>
              <label htmlFor="fileInput">
                <span
                  onClick={() =>
                    setMetaFormErrors({ ...metaFormErrors, file: "" })
                  }
                  disabled={isDisabled}
                  className="w-48 bg-indigo-600 text-white flex justify-center items-end px-4 py-2 rounded-md cursor-pointer"
                >
                  Upload
                </span>
                <input
                  type="file"
                  id="fileInput"
                  name="fileInput"
                  disabled={isDisabled}
                  className="hidden px-4 border border-gray-200"
                  onChange={handleFileInput}
                />
              </label>
            </div>
          </div>

          <button
            onClick={handleProcess}
            disabled={isDisabled}
            className="w-full md:w-72 lg-w-2/3 bg-indigo-600 text-white focus:outline-none"
          >
            Process
          </button>
        </div>
      </div>
      <div className="w-full my-2 bg-white rounded-lg">
        <EditableTable />
      </div>
    </div>
  );
};

export default NewDocument;
