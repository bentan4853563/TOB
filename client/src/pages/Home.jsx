import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import { clearMetaData, clearTableData } from "../redux/reducers/tableSlice";

import { clearLoading, setLoading } from "../redux/reducers/loadingSlice";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const node_server_url = import.meta.env.VITE_NODE_SERVER_URL;

  const [dbTableData, setDBTableData] = useState([]);
  const [statisticalData, setStatisticalData] = useState({
    Processed: 0,
    Reviewed: 0,
    Revised: 0,
  });

  useEffect(() => {
    dispatch(clearTableData());
    dispatch(clearMetaData());
    const fetchData = async () => {
      try {
        dispatch(setLoading());
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
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (dbTableData) {
      dbTableData.map((item) => {
        let categories = Object.keys(item);
        let processed = 0;
        let reviewed = 0;
        let revised = 0;
        item.statusByCategory.map((categoryData) => {
          if (categoryData.status === "Processed") processed = processed + 1;
          else if (categoryData.status === "Reviewed") reviewed = reviewed + 1;
          if (categoryData.version > 1) revised = revised + 1;
        });
        if (revised === categories.length) {
          setStatisticalData((previousState) => ({
            ...previousState,
            Revised: previousState.Revised + 1,
          }));
        } else if (reviewed === categories.length) {
          setStatisticalData((previousState) => ({
            ...previousState,
            Reviewed: previousState.Reviewed + 1,
          }));
        } else {
          setStatisticalData((previousState) => ({
            ...previousState,
            Processed: previousState.Processed + 1,
          }));
        }
      });
    }
  }, [dbTableData]);

  // const handleClickUpload = () => {
  // 	setSettingModalOpen(true);
  // 	// setIsModalOpen(false);
  // };

  const handleClickRow = (status) => {
    navigate("/tb/dbtable", { state: status });
  };

  return (
    <div className="w-full h-full bg-gray-100 px-8 lg:px-24 flex flex-col items-center justify-start">
      {/* Dashboard */}
      <div className="w-full lg:w-1/2 py-2 mb-4 flex flex-col items-start bg-white rounded-lg px-4 mt-8">
        <table>
          <thead className="">
            <th>Status</th>
            <th>Count</th>
          </thead>
          <tbody>
            {Object.entries(statisticalData).map(([status, count]) => (
              <tr
                key={status}
                onClick={() => handleClickRow(status)}
                className="cursor-pointer"
              >
                <td>{status}</td>
                <td>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
