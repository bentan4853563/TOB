import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { IoClose } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { clearLoading, setLoading } from "../redux/reducers/loadingSlice";
import { setTableData } from "../redux/reducers/tableSlice";

const CategoryConfirmModal = ({ list, file_name, hideModal }) => {
  const dispatch = useDispatch();

  const [categoryInput, setCategoryInput] = useState("");
  const [categoryList, setCategoryList] = useState([]);

  const [metaFormErrors, setMetaFormErrors] = useState({
    categoryList: [],
  });

  useEffect(() => {
    setCategoryList(list);
  }, [list]);

  // useEffect(() => {
  //   if (categoryList && categoryList.length > 0) {
  //     setMetaFormErrors({ ...metaFormErrors, categoryList: "" });
  //   }
  // }, [categoryList, metaFormErrors]);

  // const handleProcess = async () => {
  //   let newErrors = {};

  //   if (categoryList.length === 0) {
  //     newErrors.categoryList = "Category list is required.";
  //   }
  // };

  console.log("categoryList", categoryList);

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

  // const handleFocus = (e) => {
  //   setMetaFormErrors({ ...metaFormErrors, [e.target.name]: "" });
  // };

  const handleSubmit = async () => {
    // const requestData = {
    //   category_list: categoryList,
    //   file_name,
    // };
    const formData = new FormData();
    formData.append("category_list", JSON.stringify(categoryList));
    formData.append("file_name", JSON.stringify(file_name));
    dispatch(setLoading());
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PYTHON_BACKEND_URL}/generateDoc`,
        {
          method: "POST",
          body: formData,
          "ngrok-skip-browser-warning": true,
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("table Data=====>", data);
        dispatch(setTableData(data));
        dispatch(clearLoading());
        hideModal();
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
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
              Category List
            </label>
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
        <button onClick={handleSubmit} className="bg-indigo-600 text-white">
          Submit
        </button>
      </div>
    </div>
  );
};

CategoryConfirmModal.propTypes = {
  list: PropTypes.array.isRequired,
  file_name: PropTypes.string.isRequired,
  hideModal: PropTypes.func.isRequired,
};

export default CategoryConfirmModal;
