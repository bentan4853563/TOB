import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ScrollToTop from "react-scroll-to-top";

import { clearLoading, setLoading } from "../redux/reducers/loadingSlice";
import { setMetaData } from "../redux/reducers/tableSlice";
import CategoryConfirmModal from "../components/CategoryConfirmModal";
import CustomizedTable from "../components/CustomizedTable";

const NewDocument = () => {
  const dispatch = useDispatch();
  const { table } = useSelector((state) => state.table);

  const [file, setFile] = useState(null);
  const [broker, setBroker] = useState("");
  const [client, setClient] = useState("");
  const [insurer, setInsurer] = useState("");
  const [sourceTOB, setSourceTOB] = useState("");

  const [categoryList, setCategoryList] = useState([]);
  const [tempFileName, setTempFileName] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [metaFormErrors, setMetaFormErrors] = useState({
    client: "",
    sourceTOB: "",
  });

  const [tobType, setTobType] = useState("");
  const [gulfPlan, setGulfPlan] = useState("");
  const [AIPlan, setAIPlan] = useState("");
  const [ThiqaPlan, setThiqaPlan] = useState("");
  const [regulator, setRegulator] = useState("");
  const TobTypeList = ["Elite Care", "Gulf Care", "Al Madallah", "Thiqa"];
  const gulfPlanList = [
    "Global",
    "International",
    "Arabia",
    "Emirates",
    "Asia",
  ];
  const regulagorList = ["DHA", "DOH"];
  const AIPlanList = [];
  const ThiqaPlanList = [];
  for (let i = 1; i < 15; i++) {
    AIPlanList.push(`Plan ${i}`);
  }
  for (let i = 1; i < 6; i++) {
    ThiqaPlanList.push(`Plan ${i}`);
  }

  const python_server_url = import.meta.env.VITE_PYTHON_SERVER_URL;

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
    setTobType(TobTypeList[0]);
  }, []);

  useEffect(() => {
    if (tobType === TobTypeList[0]) {
      setInsurer(companyList[0]);
    } else if (tobType === TobTypeList[1]) {
      setGulfPlan(gulfPlanList[0]);
    } else if (tobType === TobTypeList[2]) {
      setThiqaPlan(ThiqaPlanList[0]);
    }
  }, [tobType]);

  const handleProcess = async () => {
    let newMetaData = {};
    if (tobType === TobTypeList[0]) {
      let newErrors = {};
      if (!client || !client.trim()) {
        newErrors.client = "Client is required";
      }
      if (!sourceTOB || !sourceTOB.trim()) {
        newErrors.sourceTOB = "Source TOB is required";
      }
      setMetaFormErrors(newErrors);
      // Check if there are no errors in the newErrors object
      if (Object.keys(newErrors).length === 0) {
        newMetaData.client = client;
        // Only add the 'broker' key if 'broker' is not an empty string
        if (insurer !== "") {
          newMetaData.insurer = insurer;
        }
        if (broker !== "") {
          newMetaData.broker = broker;
        }
        if (sourceTOB !== "") {
          newMetaData.sourceTOB = sourceTOB;
        }
        handleFetch();
        dispatch(setMetaData(newMetaData));
      }
    } else if (tobType === TobTypeList[1]) {
      if (tobType === TobTypeList[0] && insurer !== "") {
        newMetaData.insurer = insurer;
      }
      if (broker !== "") {
        newMetaData.broker = broker;
      }
      if (tobType === TobTypeList[0] && sourceTOB !== "") {
        newMetaData.sourceTOB = sourceTOB;
      }
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
    dispatch(setLoading());
    try {
      const response = await fetch(`${python_server_url}/checkCategory`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setCategoryList(data.category_list);
        setTempFileName(data.file_name);
        setModalOpen(true);
        dispatch(clearLoading());
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const renderContent = () => {
    switch (tobType) {
      case "Elite Care":
        return (
          <div className="flex flex-col">
            <label htmlFor="insurer">Insurer</label>
            <select
              name="insurer"
              id="insurer"
              value={insurer}
              onClick={handleFocus}
              onChange={(e) => setInsurer(e.target.value)}
              className="border border-gray-200 rounded-lg w-full lg:w-2/3 px-3 py-3.5 outline-none focus:border-sky-700"
            >
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
        );
      case "Gulf Care":
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label htmlFor="gulfPlan">Plan</label>
              <select
                name="gulfPlan"
                id="gulfPlan"
                value={gulfPlan}
                onClick={handleFocus}
                onChange={(e) => setGulfPlan(e.target.value)}
                className="border border-gray-200 rounded-lg w-full lg:w-2/3 px-3 py-3.5 outline-none focus:border-sky-700"
              >
                {gulfPlanList.map((value, index) => {
                  return <option key={index}>{value}</option>;
                })}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="regulator">Regulator</label>
              <select
                name="regulator"
                id="regulator"
                value={regulator}
                onClick={handleFocus}
                onChange={(e) => setRegulator(e.target.value)}
                className="border border-gray-200 rounded-lg w-full lg:w-2/3 px-3 py-3.5 outline-none focus:border-sky-700"
              >
                {regulagorList.map((value, index) => {
                  return <option key={index}>{value}</option>;
                })}
              </select>
            </div>
          </div>
        );
      case "Al Madallah":
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label htmlFor="AIPlan">Plan</label>
              <select
                name="AIPlan"
                id="AIPlan"
                value={AIPlan}
                onClick={handleFocus}
                onChange={(e) => setAIPlan(e.target.value)}
                className="border border-gray-200 rounded-lg w-full lg:w-2/3 px-3 py-3.5 outline-none focus:border-sky-700"
              >
                {AIPlanList.map((value, index) => {
                  return <option key={index}>{value}</option>;
                })}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="regulator">Regulator</label>
              <select
                name="regulator"
                id="regulator"
                value={regulator}
                onClick={handleFocus}
                onChange={(e) => setRegulator(e.target.value)}
                className="border border-gray-200 rounded-lg w-full lg:w-2/3 px-3 py-3.5 outline-none focus:border-sky-700"
              >
                {regulagorList.map((value, index) => {
                  return <option key={index}>{value}</option>;
                })}
              </select>
              {metaFormErrors.regulator && (
                <p className="w-full text-red-400 text-xs text-left">
                  {metaFormErrors.regulator}
                </p>
              )}
            </div>
          </div>
        );
      case "Thiqa":
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label htmlFor="ThiqaPlan">Plan</label>
              <select
                name="ThiqaPlan"
                id="ThiqaPlan"
                value={ThiqaPlan}
                onClick={handleFocus}
                onChange={(e) => setThiqaPlan(e.target.value)}
                className="border border-gray-200 rounded-lg w-full lg:w-2/3 px-3 py-3.5 outline-none focus:border-sky-700"
              >
                {ThiqaPlanList.map((value, index) => {
                  return <option key={index}>{value}</option>;
                })}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="regulator">Regulator</label>
              <select
                name="regulator"
                id="regulator"
                value={regulator}
                onClick={handleFocus}
                onChange={(e) => setRegulator(e.target.value)}
                className="border border-gray-200 rounded-lg w-full lg:w-2/3 px-3 py-3.5 outline-none focus:border-sky-700"
              >
                {regulagorList.map((value, index) => {
                  return <option key={index}>{value}</option>;
                })}
              </select>
            </div>
          </div>
        );
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
        <div className="w-full px-8 py-2 flex flex-col gap-4">
          {/* tobType */}
          <div className="flex flex-col">
            <label htmlFor="tobType">Type of TOB</label>
            <select
              name="tobType"
              id="tobType"
              value={tobType}
              onClick={handleFocus}
              onChange={(e) => setTobType(e.target.value)}
              className="border border-gray-200 rounded-lg w-full lg:w-2/3 px-3 py-3.5 outline-none focus:border-sky-700"
            >
              {TobTypeList.map((item, index) => (
                <option id="tobType" key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {renderContent()}

          {/* Client */}
          <div className="flex flex-col">
            <label htmlFor="client">Client</label>
            <input
              type="text"
              name="client"
              id="client"
              value={client}
              onFocus={handleFocus}
              onChange={(e) => setClient(e.target.value)}
              className="border border-gray-200 rounded-lg w-full lg:w-2/3 p-3 outline-none focus:border-sky-700"
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
              onChange={(e) => setBroker(e.target.value)}
              className="border border-gray-200 rounded-lg w-full lg:w-2/3 p-3 outline-none focus:border-sky-700"
            />
          </div>

          {/* sourceTOB */}
          {tobType === TobTypeList[0] && (
            <div className="flex flex-col">
              <label className="text-black" htmlFor="sourceTOB">
                Source TOB File
              </label>
              <div className="flex gap-4 w-full lg:w-2/3">
                <div className="flex flex-col flex-1">
                  <input
                    type="text"
                    value={sourceTOB ? sourceTOB : ""}
                    onFocus={handleFocus}
                    disabled
                    readOnly // Since this input is not intended to be modified directly by the user
                    className="w-full p-3 rounded-md border border-gray-200"
                  />
                </div>
                <label htmlFor="fileInput">
                  <span
                    onClick={() =>
                      setMetaFormErrors({ ...metaFormErrors, file: "" })
                    }
                    className="w-48 bg-indigo-600 text-white flex justify-center items-end px-4 py-3 rounded-md cursor-pointer"
                  >
                    Upload
                  </span>
                  <input
                    type="file"
                    id="fileInput"
                    name="fileInput"
                    className="hidden border border-gray-200"
                    onChange={handleFileInput}
                  />
                </label>
              </div>
              {metaFormErrors.sourceTOB && (
                <p className="w-full text-red-400 text-xs text-left">
                  {metaFormErrors.sourceTOB}
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleProcess}
            className="w-full md:w-72 lg-w-2/3 mt-2 py-3 bg-indigo-600 text-white focus:outline-none"
          >
            Process
          </button>
        </div>
      </div>

      {Object.keys(table).length > 0 && <CustomizedTable />}

      {modalOpen && (
        <CategoryConfirmModal
          list={categoryList}
          file_name={tempFileName}
          hideModal={() => setModalOpen(false)}
        />
      )}

      <ScrollToTop
        className="scroll-to-top flex fixed focus:outline-none text-black shadow-md shadow-gray-800 justify-center items-center rounded-full"
        smooth
        height={18}
        style={{ zIndex: 999, fontSize: 4 }}
      />
    </div>
  );
};

export default NewDocument;
