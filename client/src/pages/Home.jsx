import { useEffect, useMemo, useState } from "react";
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

  const generatedCount = useMemo(() => {
    return dbTableData.reduce((acc, data) => {
      const generated = data.statusByCategory.reduce((sum, category) => {
        if (category.status === "Generated") sum += 1;
        return sum;
      }, 0);
      return acc + (generated === data.statusByCategory.length ? 1 : 0);
    }, 0);
  }, [dbTableData]);

  const handleClickRow = (status) => {
    navigate("/tb/dbtable", { state: status });
  };

  return (
    <div className="w-full h-full bg-gray-100 px-8 lg:px-24 flex flex-col items-center justify-start">
      {/* Dashboard */}
      <div className="w-full lg:w-1/2 py-2 mb-4 flex flex-col items-start bg-white rounded-lg px-4 mt-8">
        <table className="text-black">
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            <tr
              onClick={() => handleClickRow("Processed")}
              className="cursor-pointer"
            >
              <td>Processed</td>
              <td>{dbTableData.length - generatedCount}</td>
            </tr>
            <tr
              onClick={() => handleClickRow("Generated")}
              className="cursor-pointer"
            >
              <td>Generated</td>
              <td>{generatedCount}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
