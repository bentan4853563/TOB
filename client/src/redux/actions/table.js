import { useSelector } from "react-redux";
import { clearLoading, setLoading } from "../reducers/loadingSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { storeTableData } from "../reducers/tableSlice";

const node_server_url = import.meta.env.VITE_NODE_SERVER_URL;

export const handleSaveToDB = (tableData) => async (dispatch) => {
  dispatch(setLoading());

  const { metaData } = useSelector((state) => state.table);
  const { token } = useSelector((state) => state.auth);

  try {
    const response = await fetch(`${node_server_url}/api/table/file-save`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-auth-token": token, // Include the token in the Authorization header
        "ngrok-skip-browser-warning": true,
      },
      body: JSON.stringify({
        uuid: metaData.uuid,
        tableData,
      }),
    });
    if (response.ok) {
      dispatch(clearLoading());
      const savedTableData = await response.json();
      dispatch(storeTableData(savedTableData));
      toast.success("Successfuly saved!!!", {
        position: "top-right",
      });
    } else {
      dispatch(clearLoading());

      console.error("Error:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Fetch Error:", error);
  }
};
