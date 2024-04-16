import { useSelector } from "react-redux";
import CustomizedTable from "../components/CustomizedTable";
import ScrollToTop from "react-scroll-to-top";

const EditDocument = () => {
  const { metaData } = useSelector((state) => state.table);
  const { table } = useSelector((state) => state.table);
  return (
    <div className="w-full h-full bg-gray-100 px-8 md:px-16 xl:px-24 flex flex-col items-start justify-start">
      <div className="w-full px-8 py-4 my-4 flex justify-between items-center bg-white rounded-lg">
        <span className="text-2xl">Documents</span>
      </div>
      {metaData && (
        <div className="w-full py-2 flex flex-col items-start bg-white rounded-lg divide-y divide-gray-300">
          <div className="py-2 px-8">
            <span className="text-xl font-bold font-sans">Edit Document</span>
          </div>
          <div className="w-full px-8 py-4 flex flex-col gap-3">
            {metaData.tobType && (
              <div className="flex flex-col gap-1">
                <label className="text-black font-medium" htmlFor="client">
                  Type of TOB
                </label>
                <span className="ml-4">
                  {metaData.tobType ? metaData.tobType : "None"}
                </span>
              </div>
            )}
            {metaData.client && (
              <div className="flex flex-col gap-1">
                <label className="text-black font-medium" htmlFor="client">
                  Client
                </label>
                <span className="ml-4">
                  {metaData.client ? metaData.client : "None"}
                </span>
              </div>
            )}
            {metaData.insurer && (
              <div className="flex flex-col gap-1">
                <label className="text-black font-medium" htmlFor="insurer">
                  Insurer
                </label>
                <span className="ml-4">
                  {metaData.insurer ? metaData.insurer : "None"}
                </span>
              </div>
            )}

            {metaData.broker && (
              <div className="flex flex-col gap-1">
                <label className="text-black font-medium" htmlFor="broker">
                  Broker
                </label>
                <span className="ml-4">
                  {metaData.broker ? metaData.broker : "None"}
                </span>
              </div>
            )}

            {metaData.sourceTOB && (
              <div className="flex flex-col gap-1">
                <label className="text-black font-medium" htmlFor="sourceTOB">
                  Source TOB
                </label>
                <span className="ml-4">
                  {metaData.sourceTOB ? metaData.sourceTOB : "None"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      {Object.keys(table).length > 0 && <CustomizedTable />}
      <ScrollToTop
        className="scroll-to-top flex fixed focus:outline-none text-black shadow-md shadow-gray-800 justify-center items-center rounded-full"
        smooth
        height={18}
        style={{ zIndex: 999, fontSize: 4 }}
      />
    </div>
  );
};

export default EditDocument;
