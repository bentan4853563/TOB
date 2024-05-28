import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import PropTypes from "prop-types";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { IoClose } from "react-icons/io5";
import { clearLoading, setLoading } from "../redux/reducers/loadingSlice";
import {
  setMetaData,
  setUUID,
  storeTableData,
} from "../redux/reducers/tableSlice";

const SendCategoryModal = ({ list, file_name, hideModal }) => {
  const dispatch = useDispatch();
  const node_server_url = import.meta.env.VITE_NODE_SERVER_URL;
  const python_server_url = import.meta.env.VITE_PYTHON_SERVER_URL;

  const { token } = useSelector((state) => state.auth);
  const { metaData } = useSelector((state) => state.table);

  const [categoryInput, setCategoryInput] = useState("");
  const [categoryList, setCategoryList] = useState([]);

  const [metaFormErrors, setMetaFormErrors] = useState({
    categoryList: [],
  });

  useEffect(() => {
    setCategoryList(list);
  }, [list]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setCategoryList((prevList) => [...prevList, e.target.value]);
      setCategoryInput("");
      setMetaFormErrors({ ...metaFormErrors, categoryList: "" });
    }
  };

  const handleRemoveCategory = (param) => {
    setCategoryList((prev) => prev.filter((item, index) => index !== param));
  };

  const handleSubmit = async () => {
    if (categoryList.length > 0) {
      dispatch(setLoading());
      const formData = new FormData();
      formData.append("category_list", JSON.stringify(categoryList));
      formData.append("file_name", file_name);
      dispatch(setLoading());
      try {
        const response = await fetch(`${python_server_url}/getBenefits`, {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": true,
          },
          body: formData,
        });
        console.log("Response:", response);
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          dispatch(clearLoading());

          const initialized = Object.keys(data).reduce(
            (accumulator, category) => {
              if (category !== "notes") {
                let regulator = "";
                if (category.includes("DXB")) regulator = "DHA";
                else if (category.includes("AUH")) regulator = "HAAD";
                else regulator = "";
                accumulator[category] = Object.keys(data[category]).reduce(
                  (innerAccum, subTitle) => {
                    if (subTitle !== "error") {
                      innerAccum[subTitle] = data[category][subTitle].map(
                        (row) => {
                          let color = "";
                          if (row.match === "NOT_FOUND_IN_SOB")
                            color = "orange";
                          else if (row.match === "NOT_FOUND_IN_CONTENT")
                            color = "red";
                          else color = "green";

                          return {
                            id: crypto.randomUUID(),
                            ...row,
                            color: color,
                            edit: false,
                            "New Benefit": "",
                            "New Limit": "",
                            "Edit Reason": "",
                            "Review Required": false,
                            Reviewed: false,
                            "Review Comment": "",
                          };
                        }
                      );
                      return innerAccum;
                    }
                  },
                  {
                    status: "Processed",
                    version: 1,
                    comment: "",
                    resultTOB: "",
                    regulator,
                  }
                );
              } else if (category === "notes") {
                if (data[category]) {
                  accumulator[category] = data[category]; // Return original notes for the "notes" category
                }
              }
              return accumulator;
            },
            {}
          );

          saveStatusByCategory(initialized);
          dispatch(storeTableData(initialized));
          hideModal();
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
    } else {
      toast.warning("Please input category name at least one.", {
        position: "top-right",
      });
    }
  };

  const saveStatusByCategory = async (tableData) => {
    dispatch(setLoading());
    const uuid = crypto.randomUUID();
    dispatch(setUUID(uuid));

    try {
      const response = await fetch(`${node_server_url}/api/table/insert`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-auth-token": token,
          "ngrok-skip-browser-warning": true,
        },
        body: JSON.stringify({
          uuid,
          metaData,
          tableData,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        const { metaData, tableData } = result;
        dispatch(setMetaData(metaData[0]));
        dispatch(storeTableData(tableData));
      } else {
        // Handle non-2xx response statuses by showing a toast.
        toast.error("Failed extraction data by using AI. Please try again!", {
          position: "top-right",
        });
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      // Handle network errors or other exceptions.
      toast.error(
        "Network error or other issue encountered. Please try again!",
        {
          position: "top-right",
        }
      );
      console.error("Error:", error);
    } finally {
      // Stop loading irrespective of the outcome of the request.
      dispatch(clearLoading());
    }
    hideModal(); // Hide modal depending on your application flow.
  };

  return (
    <div className="w-full h-full bg-gray-800/60 flex justify-center items-center fixed top-0 left-0">
      <div className="bg-gray-100 w-[400px] flex flex-col item-center gap-8 rounded-lg px-8 py-12 relative">
        <IoClose
          className="absolute top-2 right-2 text-xl cursor-pointer"
          onClick={hideModal}
        />
        {confirm && (
          <div className="w-full flex flex-col gap-10">
            <label htmlFor="category_list" className="text-4xl text-center">
              Category Input
            </label>
            {categoryList.length > 0 ? (
              <span className="text-black text-md text-left">
                Found the following Category/Categories in the Document. Please
                check and Confirm.
              </span>
            ) : (
              <span className="text-black text-md text-left">
                Unable read and find the Category/Categories in the Document.
                Please provide the Category or List of Categories and add them
                to the list and Submit
              </span>
            )}
            <input
              id="set_List"
              type="text"
              name="category"
              value={categoryInput}
              onChange={(e) => {
                setCategoryInput(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              className="border border-gray-200 rounded-lg w-full px-2 py-2 outline-none focus:border-sky-700"
            />
          </div>
        )}
        {/* Category list */}
        {categoryList.length > 0 && (
          <div>
            <div className="w-full p-2 flex flex-wrap gap-2 min-h-16  border border-gray-200 rounded-lg">
              {categoryList &&
                categoryList.length > 0 &&
                categoryList.map((item, index) => {
                  return (
                    <span
                      key={index}
                      className="h-8 pl-4 pr-5 py-2 flex items-center rounded-sm relative bg-green-100"
                    >
                      {item}
                      <IoClose
                        className="w-4 h-4 absolute top-0.5 right-0.5 cursor-pointer"
                        onClick={() => handleRemoveCategory(index)}
                      />
                    </span>
                  );
                })}
            </div>
            {metaFormErrors.categoryList && (
              <p className="w-full text-red-400 text-xs text-left">
                {metaFormErrors.categoryList}
              </p>
            )}
          </div>
        )}
        <button onClick={handleSubmit} className="bg-indigo-600 text-white">
          Submit
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

SendCategoryModal.propTypes = {
  list: PropTypes.array.isRequired,
  file_name: PropTypes.string.isRequired,
  hideModal: PropTypes.func.isRequired,
};

export default SendCategoryModal;
