import { setExclusionData, storeContentData } from "../reducers/contentSlice";
import { clearLoading } from "../reducers/loadingSlice";

const backend_url = import.meta.env.VITE_NODE_SERVER_URL;

export const getContent = () => async (dispatch) => {
  const options = {
    method: "GET", // Request method
    headers: {
      "Content-Type": "application/json", // Indicate JSON content
      "ngrok-skip-browser-warning": true,
    },
  };
  try {
    const response = await fetch(`${backend_url}/api/content/find`, options);
    if (response.ok) {
      const responseData = await response.json();
      console.log("responseData", responseData);
      dispatch(storeContentData(responseData));
    }
  } catch (error) {
    console.log(error);
  }
};

export const handleInsertContent = async (content) => {
  console.log(content);
  const options = {
    method: "POST", // Request method
    headers: {
      "Content-Type": "application/json", // Indicate JSON content
    },
    body: JSON.stringify(content), // Convert data to JSON string
  };
  try {
    const response = await fetch(`${backend_url}/api/content/insert`, options);
    if (response.ok) {
      const responseData = await response.json();
      console.log("response", responseData);
      // dispatch(insertcontent(responseData));
    }
  } catch (error) {
    console.error("Error:", error); // Handle errors
  }
};

export const handleUpdateExclusion = (exclusionData) => async (dispatch) => {
  const options = {
    method: "POST", // Request method
    headers: {
      "Content-Type": "application/json", // Indicate JSON content
    },
    body: JSON.stringify(exclusionData), // Convert data to JSON string
  };
  try {
    const response = await fetch(`${backend_url}/api/content/update`, options);
    if (response.ok) {
      const responseData = await response.json();
      console.log("=", responseData);
      dispatch(setExclusionData(responseData.result));
      dispatch(clearLoading());
    }
  } catch (error) {
    console.error("Error:", error); // Handle errors
  }
};
