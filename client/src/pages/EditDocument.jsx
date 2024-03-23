import { useSelector } from "react-redux";

import EditableTable from "../components/EditableTable/EditableTable";

const EditDocument = () => {
  const { metaData } = useSelector((state) => state.table);
  const { table } = useSelector((state) => state.table);

  const { broker, client, insurer, sourceTOB, tobType } = metaData;

  const tobTypeList = ["Elite Care", "Gulf Care", "Al Madallah", "Thiqa"];
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
              disabled
              className="border border-gray-200 rounded-lg w-full lg:w-2/3 px-3 py-3.5 outline-none focus:border-sky-700"
            >
              {tobTypeList.map((item, index) => (
                <option id="tobType" key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          {tobType !== "" && tobType === tobTypeList[0] && (
            <div className="flex flex-col gap-2">
              {/* Insurer */}
              <div className="flex flex-col">
                <label htmlFor="insurer">Insurer</label>
                <select
                  name="insurer"
                  id="insurer"
                  value={insurer}
                  disabled
                  className="border border-gray-200 rounded-lg w-full lg:w-2/3 px-3 py-3.5 outline-none focus:border-sky-700"
                >
                  {companyList.map((option, index) => {
                    return <option key={index}>{option}</option>;
                  })}
                </select>
              </div>

              {/* Client */}
              <div className="flex flex-col">
                <label htmlFor="client">Client</label>
                <input
                  type="text"
                  name="client"
                  id="client"
                  value={client}
                  disabled
                  className="border border-gray-200 rounded-lg w-full lg:w-2/3 p-3 outline-none focus:border-sky-700"
                />
              </div>

              {/* Broker */}
              <div className="flex flex-col">
                <label htmlFor="broker">Broker</label>
                <input
                  type="text"
                  name="broker"
                  id="broker"
                  value={broker}
                  disabled
                  className="border border-gray-200 rounded-lg w-full lg:w-2/3 p-3 outline-none focus:border-sky-700"
                />
              </div>

              {/* sourceTOB */}
              <div className="flex flex-col">
                <label className="text-black" htmlFor="sourceTOB">
                  Source TOB File
                </label>
                <div className="flex gap-4 w-full lg:w-2/3">
                  <div className="flex flex-col flex-1">
                    <input
                      type="text"
                      value={sourceTOB ? sourceTOB : ""}
                      className="w-full p-3 rounded-md border border-gray-200"
                      disabled
                      readOnly // Since this input is not intended to be modified directly by the user
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {Object.keys(table).length !== 0 && (
        <div className="w-full my-2 bg-white rounded-lg">
          <EditableTable />
        </div>
      )}
    </div>
  );
};

export default EditDocument;
