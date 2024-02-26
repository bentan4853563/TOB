import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { MdOutlineModeEditOutline } from "react-icons/md";
import { BsTrash3 } from "react-icons/bs";
import UploadSettingModal from "../components/UploadSettingModal";

import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import {
  clearFileName,
  clearMetaData,
  clearTablData,
  setFileName,
  setMetaData,
  setTableData,
} from "../redux/reducers/tableSlice";
import { clearLoading, setLoading } from "../redux/reducers/loadingSlice";

const DisplayTable = ({ setSelectedRow }) => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [dbTableData, setDBTableData] = useState(null);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [settingModalOpen, setSettingModalOpen] = useState(false);

  useEffect(() => {
    dispatch(clearTablData());
    dispatch(clearFileName());
    dispatch(clearMetaData());
    const fetchData = async () => {
      try {
        dispatch(setLoading());
        const response = await fetch(
          "https://8555-88-99-162-157.ngrok-free.app/api/table/readAll",
          {
            method: "GET",
            headers: {
              "content-type": "application/json",
              "x-auth-token": token, // Include the token in the Authorization header
              "ngrok-skip-browser-warning": true,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setDBTableData(data);
        dispatch(clearLoading());
      } catch (error) {
        console.error("Fetching data failed:", error);
      }
    };
    fetchData();
  }, []);

  const columns =
    dbTableData && dbTableData.length > 0 ? Object.keys(dbTableData[0]) : [];
  const handleDelete = async (id) => {
    confirmAlert({
      title: "Confirm!",
      message: "Are you sure to do this.",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              dispatch(setLoading());
              const response = await fetch(
                `https://8555-88-99-162-157.ngrok-free.app/api/table/delete/${id}`,
                {
                  method: "DELETE",
                  headers: {
                    "x-auth-token": token,
                    "ngrok-skip-browser-warning": true,
                  },
                }
              );
              if (response.ok) {
                console.log(dbTableData);
                // Optimistic Update: Remove the item immediately from the table
                setDBTableData((previousData) =>
                  previousData.filter((item) => item._id !== id)
                );
                console.error("Failed to delete the item:", response.status);
              }
              dispatch(clearLoading());
            } catch (error) {
              console.error("Error occurred while deleting the item:", error);
            }
          },
        },
        {
          label: "No",
          onClick: () => console.log("no"),
        },
      ],
    });
  };
  const handleClickUpload = () => {
    setSettingModalOpen(true);
    // setIsModalOpen(false);
  };

  const handleEdit = async (index) => {
    dispatch(setLoading());
    setSelectedRow(dbTableData[index]);
    const metaData = dbTableData[index];
    dispatch(setMetaData(metaData));
    const response = await fetch(
      "https://8555-88-99-162-157.ngrok-free.app/api/table/getOne",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
          "ngrok-skip-browser-warning": true,
        },
        body: JSON.stringify(metaData),
      }
    );
    const result = await response.json();
    dispatch(setMetaData(result.metaData));
    dispatch(setTableData(result.fileData));
    dispatch(setFileName(metaData.sourceTOB));
    navigate("/tb/createtable");
    dispatch(clearLoading());
  };

  const handleCreate = () => {
    navigate("/tb/createtable");
  };

  return (
    <div className="w-full px-24 flex flex-col items-start justify-start">
      <h1 className="w-full text-center mt-16 select-none">DB Table</h1>
      <Menu
        menuButton={
          <MenuButton className="h-10 flex items-center border border-gray-200 my-4 focus:outline-none">
            New
          </MenuButton>
        }
        transition
        gap={10}
      >
        <MenuItem onClick={handleClickUpload}>Uplaod</MenuItem>
        <MenuItem onClick={handleCreate}>Create</MenuItem>
      </Menu>
      {settingModalOpen && (
        <UploadSettingModal hideModal={() => setSettingModalOpen(false)} />
      )}
      {dbTableData && (
        <table className="w-full">
          <thead>
            <tr>
              <th>No</th>
              {columns.slice(1, columns.length).map((item, index) => (
                <th className="py-3" key={index}>
                  {item}
                </th>
              ))}
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {dbTableData.map((row, rowIndex) => (
              <tr key={rowIndex} className=" hover:bg-gray-100">
                <td>{rowIndex + 1}</td>
                {columns.slice(1, columns.length).map((colKey, colIndex) => (
                  <td key={colIndex}>{row[colKey]}</td>
                ))}
                <td className="relative">
                  <MdOutlineModeEditOutline
                    className="mx-auto cursor-pointer"
                    onClick={() => handleEdit(rowIndex)}
                  />
                </td>
                <td>
                  <BsTrash3
                    className="mx-auto cursor-pointer"
                    onClick={() => handleDelete(row._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

DisplayTable.propTypes = {
  setSelectedRow: PropTypes.func.isRequired,
};

export default DisplayTable;
