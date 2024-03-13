import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// import { clearLoading, setLoading } from "../redux/reducers/loadingSlice";
import {
  // setTableData,
  // setUploadedFile,
  setMetaData,
} from "../redux/reducers/tableSlice";
import EditableTable from "../components/EditableTable/EditableTable";
import CategoryConfirmModal from "../components/CategoryConfirmModal";
import { clearLoading, setLoading } from "../redux/reducers/loadingSlice";

const NewDocument = () => {
  const customdispatch = useDispatch();
  const { metaData } = useSelector((state) => state.table);
  const { table } = useSelector((state) => state.table);

  const [tobType, setTobType] = useState("");

  const [file, setFile] = useState(null);
  const [broker, setBroker] = useState("");
  const [client, setClient] = useState("");
  const [insurer, setInsurer] = useState("");
  const [sourceTOB, setSourceTOB] = useState("");

  const [categoryList, setCategoryList] = useState([]);
  const [tempFileName, setTempFileName] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  const [metaFormErrors, setMetaFormErrors] = useState({
    broker: "",
    client: "",
    insurer: "",
    tobType: "",
    file: null,
    categoryList: [],
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
    setSourceTOB(metaData.sourceTOB);
  }, [metaData]);

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
      newErrors.tobType = "Type of TOB field must include one type.";
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
        topType: tobType,
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
    const newFile =
      e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFile(newFile);
    setSourceTOB(newFile.name);
  };

  const handleFetch = async () => {
    const formData = new FormData();
    formData.append("file", file);
    // formData.append("category_list", JSON.stringify(categoryList));
    customdispatch(setLoading());
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PYTHON_BACKEND_URL}/checkCategory`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Category List=====>", data);
        setCategoryList(data.category_list);
        setTempFileName(data.file_name);
        setModalOpen(true);
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
          {/* Insurer */}
          <div className="flex flex-col">
            <label htmlFor="insurer">Insurer</label>
            <select
              name="insurer"
              id="insurer"
              value={insurer}
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

          {/* Client */}
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

          {/* Broker */}
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

          {/* tobType */}
          <div className="flex flex-col">
            <label htmlFor="tobType">Type of TOB</label>
            <select
              name="tobType"
              id="tobType"
              value={tobType}
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

          {/* sourceTOB */}
          <div className="flex flex-col">
            <label className="text-black" htmlFor="sourceTOB">
              Source TOB File
            </label>
            <div className="flex gap-2 w-full lg:w-2/3">
              <div className="flex flex-col flex-1">
                <input
                  type="text"
                  value={sourceTOB ? sourceTOB : ""}
                  className="w-full px-4 py-1.5 rounded-md border border-gray-200"
                  disabled
                  readOnly // Since this input is not intended to be modified directly by the user
                />

                {metaFormErrors.file && (
                  <p className="w-full text-red-400 text-xs text-left">
                    {metaFormErrors.file}
                  </p>
                )}
              </div>
              {Object.keys(metaData).length === 0 && (
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
              )}
            </div>
          </div>

          {Object.keys(metaData).length === 0 && (
            <button
              onClick={handleProcess}
              disabled={isDisabled}
              className="w-full md:w-72 lg-w-2/3 bg-indigo-600 text-white focus:outline-none"
            >
              Process
            </button>
          )}
        </div>
      </div>
      {Object.keys(table).length !== 0 && (
        <div className="w-full my-2 bg-white rounded-lg">
          <EditableTable />
        </div>
      )}
      {modalOpen && (
        <CategoryConfirmModal
          list={categoryList}
          file_name={tempFileName}
          hideModal={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default NewDocument;
