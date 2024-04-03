import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ScrollToTop from "react-scroll-to-top";
import { confirmAlert } from "react-confirm-alert";
import Select from "react-select";
import "react-confirm-alert/src/react-confirm-alert.css";

import { clearLoading, setLoading } from "../redux/reducers/loadingSlice";
import { setMetaData } from "../redux/reducers/tableSlice";
import SendCategoryModal from "../components/SendCategoryModal";
import CustomizedTable from "../components/CustomizedTable";

const NewDocument = () => {
  const dispatch = useDispatch();
  const { table } = useSelector((state) => state.table);

  const [file, setFile] = useState(null);
  const [broker, setBroker] = useState("");
  const [client, setClient] = useState("");
  const [insurer, setInsurer] = useState("");
  const [tobType, setTobType] = useState("");
  const [sourceTOB, setSourceTOB] = useState("");

  const [categoryList, setCategoryList] = useState([]);
  const [tempFileName, setTempFileName] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [enableNew, setEnableNew] = useState(true);

  const [metaFormErrors, setMetaFormErrors] = useState({
    client: "",
    sourceTOB: "",
  });

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

  // To ensure alphabetical order, we sort the array
  companyList.sort();

  const typeOfTOBOptions = TobTypeList.map((tobType) => ({
    value: tobType,
    label: tobType,
  }));

  const insurerOptions = companyList.map((company) => ({
    label: company,
    value: company,
  }));

  useEffect(() => {
    setTobType(typeOfTOBOptions[0]);
  }, []);

  useEffect(() => {
    if (Object.keys(table).length > 0) {
      setEnableNew(false);
    }
  }, [table]);

  useEffect(() => {
    if (tobType.label === typeOfTOBOptions[0].label) {
      setInsurer(insurerOptions[0]);
    } else if (tobType.label === typeOfTOBOptions[1].label) {
      setGulfPlan(gulfPlanList[0]);
    } else if (tobType.label === typeOfTOBOptions[2].label) {
      setThiqaPlan(ThiqaPlanList[0]);
    }
  }, [tobType]);

  const handleProcess = async () => {
    let newMetaData = {};
    if (tobType.label === typeOfTOBOptions[0].label) {
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
        newMetaData.tobType = tobType.label;
        newMetaData.client = client;
        // Only add the 'broker' key if 'broker' is not an empty string
        if (insurer !== "") {
          newMetaData.insurer = insurer.label;
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
        newMetaData.insurer = insurer.label;
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
    if (Object.keys(table).length !== 0) {
      confirmAlert({
        title: "Confirm!",
        message: "Are you sure to upload another file?",
        buttons: [
          {
            label: "Yes",
            onClick: async () => {
              setEnableNew(true);
              const newFile =
                e.target.files && e.target.files[0] ? e.target.files[0] : null;
              setFile(newFile);
              setSourceTOB(newFile.name);
            },
          },
          {
            label: "No",
            onClick: () => {},
          },
        ],
      });
    } else {
      const newFile =
        e.target.files && e.target.files[0] ? e.target.files[0] : null;
      setFile(newFile);
      setSourceTOB(newFile.name);
    }
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
    switch (tobType.label) {
      case "Elite Care":
        return (
          <div className="flex flex-col">
            <label htmlFor="insurer">Insurer</label>
            <Select
              id="tobType"
              options={insurerOptions}
              onChange={(selectedOption) => setInsurer(selectedOption)}
              value={insurer}
            />
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
                className="border border-gray-200 rounded-md p-2 outline-none focus:border-sky-700"
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
                className="border border-gray-200 rounded-md p-2 outline-none focus:border-sky-700"
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
                className="border border-gray-200 rounded-md p-2 outline-none focus:border-sky-700"
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
                className="border border-gray-200 rounded-md p-2 outline-none focus:border-sky-700"
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
                className="border border-gray-200 rounded-md p-2 outline-none focus:border-sky-700"
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
                className="border border-gray-200 rounded-md p-2 outline-none focus:border-sky-700"
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
        <div className="w-full p-8">
          <div className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2 flex flex-col gap-2">
            {/* tobType */}
            <div className="flex flex-col">
              <label htmlFor="tobType">Type of TOB</label>
              <Select
                id="filter"
                options={typeOfTOBOptions}
                onChange={(tobType) => setTobType(tobType)}
                value={tobType}
              />
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
                className="border border-gray-200 rounded-[4px] p-2 outline-none focus:border-sky-700"
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
                className="border border-gray-200 rounded-[4px] p-2 outline-none focus:border-sky-700"
              />
            </div>

            {/* sourceTOB */}
            <div className="flex flex-col">
              <label className="text-black" htmlFor="sourceTOB">
                Source TOB File
              </label>
              <div className="flex gap-4">
                <div className="flex flex-col flex-1">
                  <input
                    type="text"
                    value={sourceTOB ? sourceTOB : ""}
                    onFocus={handleFocus}
                    disabled
                    readOnly // Since this input is not intended to be modified directly by the user
                    className="w-full p-2 rounded-md border border-gray-200"
                  />
                </div>
                <label htmlFor="fileInput">
                  <span
                    onClick={() =>
                      setMetaFormErrors({ ...metaFormErrors, file: "" })
                    }
                    className="bg-indigo-600 text-white flex justify-center items-end px-12 py-2 rounded-md cursor-pointer"
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

            <div>
              <button
                onClick={handleProcess}
                disabled={!enableNew}
                className={`mt-2 px-12 py-2 rounded-md text-white focus:outline-none ${
                  enableNew ? "bg-indigo-600" : "bg-indigo-600/70"
                }`}
              >
                Process
              </button>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(table).length > 0 && <CustomizedTable />}

      {modalOpen && (
        <SendCategoryModal
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
