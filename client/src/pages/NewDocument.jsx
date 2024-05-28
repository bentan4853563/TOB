import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ScrollToTop from "react-scroll-to-top";
import { confirmAlert } from "react-confirm-alert";
import ReactSelect from "react-select";
import "react-confirm-alert/src/react-confirm-alert.css";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const gulfPlanOptions = gulfPlanList.map((plan) => ({
    label: plan,
    value: plan,
  }));

  const regulatorOptions = regulagorList.map((regulator) => ({
    label: regulator,
    value: regulator,
  }));

  const AIPlanOptions = AIPlanList.map((plan) => ({
    label: `Plan ${plan}`,
    value: `Plan ${plan}`,
  }));

  const ThiqaPlanOptions = ThiqaPlanList.map((plan) => ({
    label: `Plan ${plan}`,
    value: `Plan ${plan}`,
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
    let newErrors = {};

    // Common validation for all tobTypes
    if (!client || !client.trim()) {
      newErrors.client = "Client is required";
    }
    if (!sourceTOB || !sourceTOB.trim()) {
      newErrors.sourceTOB = "Source TOB is required";
    }

    // Validation specific to each tobType
    switch (tobType.value) {
      case "Elite Care":
        if (!insurer || !insurer.value) {
          newErrors.insurer = "Insurer is required for Elite Care";
        }
        break;
      case "Gulf Care":
        if (!gulfPlan || !gulfPlan.value) {
          newErrors.gulfPlan = "Plan is required for Gulf Care";
        }
        if (!regulator || !regulator.value) {
          newErrors.regulator = "Regulator is required for Gulf Care";
        }
        break;
      case "Al Madallah":
        if (!AIPlan || !AIPlan.value) {
          newErrors.AIPlan = "Plan is required for Al Madallah";
        }
        // Assuming regulator is also required for Al Madallah
        if (!regulator || !regulator.value) {
          newErrors.regulator = "Regulator is required for Al Madallah";
        }
        break;
      case "Thiqa":
        if (!ThiqaPlan || !ThiqaPlan.value) {
          newErrors.ThiqaPlan = "Plan is required for Thiqa";
        }
        // Assuming regulator is also required for Thiqa
        if (!regulator || !regulator.value) {
          newErrors.regulator = "Regulator is required for Thiqa";
        }
        break;
      // Add additional cases for other tobTypes if necessary
    }

    setMetaFormErrors(newErrors);

    // If there are no errors in the form, prepare metadata and possibly proceed with further processing
    if (Object.keys(newErrors).length === 0) {
      newMetaData.tobType = tobType.label;
      newMetaData.client = client;

      // Set metadata specific to each tobType
      switch (tobType.value) {
        case "Elite Care":
          newMetaData.insurer = insurer.label;
          break;
        case "Gulf Care":
          newMetaData.gulfPlan = gulfPlan.label;
          newMetaData.regulator = regulator.label;
          break;
        case "Al Madallah":
          newMetaData.AIPlan = AIPlan.label;
          newMetaData.regulator = regulator.label;
          break;
        case "Thiqa":
          newMetaData.ThiqaPlan = ThiqaPlan.label;
          newMetaData.regulator = regulator.label;
          break;
        // Add additional cases for other tobTypes if necessary
      }

      // Optional fields
      if (broker) {
        newMetaData.broker = broker;
      }
      if (sourceTOB) {
        newMetaData.sourceTOB = sourceTOB;
      }

      // Make an API call or dispatch an action with the new metadata
      handleFetch();
      dispatch(setMetaData(newMetaData));
    }
  };

  const handleFocus = (e) => {
    setMetaFormErrors({ ...metaFormErrors, [e.target.id]: "" });
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
      const response = await fetch(`${python_server_url}/check-category`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        console.log("data", data);
        setCategoryList(data.category_list);
        setTempFileName(data.file_name);
        setModalOpen(true);
        dispatch(clearLoading());
      } else {
        dispatch(clearLoading());
        toast.error("Failed extraction data by using AI. Please try again!", {
          position: "top-right",
        });
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  console.log(gulfPlan, regulator, "new ===>");
  const renderContent = () => {
    switch (tobType.label) {
      case "Elite Care":
        return (
          <div className="flex flex-col">
            <label htmlFor="insurer">Insurer</label>
            <ReactSelect
              id="insurer"
              value={insurer}
              options={insurerOptions}
              onChange={(selectedOption) => setInsurer(selectedOption)}
              components={{ IndicatorSeparator: () => null }}
            />
            {metaFormErrors.insurer && (
              <p className="text-red-500 text-xs pt-1">
                {metaFormErrors.insurer}
              </p>
            )}
          </div>
        );
      case "Gulf Care":
        return (
          <>
            <div className="flex flex-col" id="gulfPlan" onClick={handleFocus}>
              <label htmlFor="gulfPlan">Plan</label>
              <ReactSelect
                options={gulfPlanOptions}
                value={gulfPlan}
                onChange={(selectedOption) => setGulfPlan(selectedOption)}
                components={{ IndicatorSeparator: () => null }}
              />
              {metaFormErrors.gulfPlan && (
                <p className="text-red-500 text-xs pt-1">
                  {metaFormErrors.gulfPlan}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="regulator">Regulator</label>
              <ReactSelect
                id="regulator"
                value={regulator}
                options={regulatorOptions}
                onChange={(selectedOption) => setRegulator(selectedOption)}
                components={{ IndicatorSeparator: () => null }}
              />
              {metaFormErrors.regulator && (
                <p className="text-red-500 text-xs pt-1">
                  {metaFormErrors.regulator}
                </p>
              )}
            </div>
          </>
        );
      case "Al Madallah":
        return (
          <>
            <div className="flex flex-col">
              <label htmlFor="AIPlan">Plan</label>
              <ReactSelect
                id="AIPlan"
                options={AIPlanOptions}
                onChange={(selectedOption) => setAIPlan(selectedOption)}
                value={AIPlan}
                components={{ IndicatorSeparator: () => null }}
              />
              {metaFormErrors.AIPlan && (
                <p className="text-red-500 text-xs pt-1">
                  {metaFormErrors.AIPlan}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="regulator">Regulator</label>
              <ReactSelect
                id="regulator"
                options={regulatorOptions}
                onChange={(selectedOption) => setRegulator(selectedOption)}
                value={regulator}
                components={{ IndicatorSeparator: () => null }}
              />
            </div>
            {metaFormErrors.regulator && (
              <p className="text-red-500 text-xs pt-1">
                {metaFormErrors.regulator}
              </p>
            )}
          </>
        );
      case "Thiqa":
        return (
          <>
            <div className="flex flex-col">
              <label htmlFor="ThiqaPlan">Plan</label>
              <ReactSelect
                id="ThiqaPlan"
                options={ThiqaPlanOptions}
                onChange={(selectedOption) => setThiqaPlan(selectedOption)}
                value={ThiqaPlan}
                components={{ IndicatorSeparator: () => null }}
              />
              {metaFormErrors.ThiqaPlan && (
                <p className="text-red-500 text-xs pt-1">
                  {metaFormErrors.ThiqaPlan}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="regulator">Regulator</label>
              <ReactSelect
                id="regulator"
                options={regulatorOptions}
                onChange={(selectedOption) => setRegulator(selectedOption)}
                value={regulator}
                components={{ IndicatorSeparator: () => null }}
              />
              {metaFormErrors.regulator && (
                <p className="text-red-500 text-xs pt-1">
                  {metaFormErrors.regulator}
                </p>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-gray-100 px-8 md:px-16 xl:px-24 flex flex-col items-start justify-start">
      <div className="w-full px-8 py-4 my-4 flex justify-start items-center bg-white rounded-lg">
        <span className="text-2xl">Documents</span>
      </div>
      <ToastContainer />
      <div className="w-full py-2 flex flex-col items-start bg-white rounded-lg divide-y divide-gray-300">
        <div className="py-2 px-8">
          <span className="text-xl font-bold font-sans">New Document</span>
        </div>
        <div className="w-full p-8">
          <div className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2 flex flex-col gap-2 text-black">
            {/* tobType */}
            <div className="flex flex-col">
              <label htmlFor="tobType">Type of TOB</label>
              <ReactSelect
                id="filter"
                options={typeOfTOBOptions}
                onChange={(tobType) => setTobType(tobType)}
                value={tobType}
                components={{
                  IndicatorSeparator: () => null,
                }}
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
                className="bg-white border border-gray-200 rounded-[4px] p-2 outline-none focus:border-sky-700"
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
                className="bg-white border border-gray-200 rounded-[4px] p-2 outline-none focus:border-sky-700"
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
