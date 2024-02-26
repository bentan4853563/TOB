import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";

import { IoSaveOutline } from "react-icons/io5";

import Table from "../components/EditableTable/Table";
import makeData from "../components/EditableTable/makeData";
import { Makecsv } from "../utils/csvmaker";
import { grey } from "../components/EditableTable/colors";
import { shortId } from "../components/EditableTable/utils";
import "../components/EditableTable/style.css";
import {
  clearFileName,
  clearTablData,
  clearMetaData,
} from "../redux/reducers/tableSlice";

function reducer(state, action) {
  switch (action.type) {
    case "add_option_to_column": {
      const optionIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, optionIndex),
          {
            ...state.columns[optionIndex],
            options: [
              ...state.columns[optionIndex].options,
              { label: action.option, backgroundColor: action.backgroundColor },
            ],
          },
          ...state.columns.slice(optionIndex + 1, state.columns.length),
        ],
      };
    }
    case "add_row":
      return {
        ...state,
        skipReset: true,
        data: [...state.data, {}],
      };
    case "delete_row": {
      let id = action.columnId;
      return {
        ...state,
        skipReset: true,
        data: [
          ...state.data.slice(0, id),
          ...state.data.slice(id + 1, state.data.length),
        ],
      };
    }
    case "update_column_type": {
      const typeIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      switch (action.dataType) {
        case "number":
          if (state.columns[typeIndex].dataType === "number") {
            return state;
          } else {
            return {
              ...state,
              columns: [
                ...state.columns.slice(0, typeIndex),
                { ...state.columns[typeIndex], dataType: action.dataType },
                ...state.columns.slice(typeIndex + 1, state.columns.length),
              ],
              data: state.data.map((row) => ({
                ...row,
                [action.columnId]: isNaN(row[action.columnId])
                  ? ""
                  : Number.parseInt(row[action.columnId]),
              })),
            };
          }
        case "text":
          if (state.columns[typeIndex].dataType === "text") {
            return state;
          } else if (state.columns[typeIndex].dataType === "select") {
            return {
              ...state,
              skipReset: true,
              columns: [
                ...state.columns.slice(0, typeIndex),
                { ...state.columns[typeIndex], dataType: action.dataType },
                ...state.columns.slice(typeIndex + 1, state.columns.length),
              ],
            };
          } else {
            return {
              ...state,
              skipReset: true,
              columns: [
                ...state.columns.slice(0, typeIndex),
                { ...state.columns[typeIndex], dataType: action.dataType },
                ...state.columns.slice(typeIndex + 1, state.columns.length),
              ],
              data: state.data.map((row) => ({
                ...row,
                [action.columnId]: row[action.columnId] + "",
              })),
            };
          }
        default:
          return state;
      }
    }
    case "update_column_header": {
      const index = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, index),
          { ...state.columns[index], label: action.label },
          ...state.columns.slice(index + 1, state.columns.length),
        ],
      };
    }
    case "update_cell":
      return {
        ...state,
        skipReset: true,
        data: state.data.map((row, index) => {
          if (index === action.rowIndex) {
            return {
              ...state.data[action.rowIndex],
              [action.columnId]: action.value,
            };
          }
          return row;
        }),
      };
    case "add_column_to_left": {
      const leftIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      let leftId = shortId();
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, leftIndex),
          {
            id: leftId,
            label: "Column",
            accessor: leftId,
            dataType: "text",
            created: action.focus && true,
            options: [],
          },
          ...state.columns.slice(leftIndex, state.columns.length),
        ],
      };
    }
    case "add_column_to_right": {
      const rightIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      const rightId = shortId();
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, rightIndex + 1),
          {
            id: rightId,
            label: "Column",
            accessor: rightId,
            dataType: "text",
            created: action.focus && true,
            options: [],
          },
          ...state.columns.slice(rightIndex + 1, state.columns.length),
        ],
      };
    }
    case "delete_column": {
      const deleteIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, deleteIndex),
          ...state.columns.slice(deleteIndex + 1, state.columns.length),
        ],
      };
    }
    case "enable_reset":
      return {
        ...state,
        skipReset: false,
      };
    default:
      return state;
  }
}

function CreateTable() {
  const [state, dispatch] = useReducer(reducer, makeData(10));

  const { token } = useSelector((state) => state.auth);
  const { fileName } = useSelector((state) => state.table);
  const navigate = useNavigate();

  const { metaData } = useSelector((state) => state.table);

  const [broker, setBroker] = useState("");
  const [client, setClient] = useState("");
  const [previousInsurer, setPreviousInsurer] = useState(
    "ABU DHABI NATIONAL INSURANCE COMPANY"
  );
  const [policyPeriod, setPolicyPeriod] = useState("");
  const [errors, setErrors] = useState({
    broker: "",
    client: "",
    policyPeriod: "",
    previousInsurer: "",
    emptyTable: "",
  });
  useEffect(() => {
    if (metaData) {
      setBroker(metaData.broker);
      setClient(metaData.client);
      setPolicyPeriod(metaData.policyPeriod);
    }
  }, [metaData]);

  const insuranceCompanies = [
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

  const handleClick = (index) => {
    dispatch({ type: "delete_row", columnId: index });
  };

  const handleFocus = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleValidate = () => {
    let newErrors = {};

    if (state.data.length === 0) {
      newErrors.emptyTable = "Please input data into the table.";
    }

    if (!broker || broker.trim() === "") {
      newErrors.broker = "Broker meta data is required";
    }

    if (!client || client.trim() === "") {
      newErrors.client = "Client meta data is required";
    }

    if (!policyPeriod || policyPeriod.trim() === "") {
      newErrors.policyPeriod = "Policy period message meta data is required";
    }

    if (!previousInsurer || previousInsurer.trim() === "") {
      newErrors.previousInsurer =
        "Previous Insurer message meta data is required";
    }

    setErrors(newErrors);
  };

  const handleSaveasCSV = () => {
    if (Object.values(errors).every((error) => error === "")) {
      Makecsv(state.data);
    }
  };
  useEffect(() => {
    handleValidate();
  }, [broker, client, previousInsurer, policyPeriod, state.data]);

  const handleSaveToDB = async () => {
    if (Object.values(errors).every((error) => error === "")) {
      // Proceed with saving data to the database
      const formData = {
        table: state.data,
        metaData: {
          _id: metaData._id,
          broker,
          client,
          previousInsurer,
          policyPeriod,
          sourceTOB: fileName,
        },
      };

      try {
        const response = await fetch(
          "https://8555-88-99-162-157.ngrok-free.app/api/table/fileUploadAndSave",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token,
            },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save data. Please try again.");
        }

        navigate("/tb/dbtable");
        dispatch(clearFileName());
        dispatch(clearTablData());
        dispatch(clearMetaData());
      } catch (error) {
        console.error("Error saving data:", error);
        // Handle error if needed
      }
    } else {
      console.log("Form has errors. Please correct them before saving.");
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
        className="mt-16"
      >
        <h1 className="text-2xl md:text-5xl">Createable React Table</h1>
        <div className="w-full px-32 flex justify-end relative z-30">
          <Menu
            menuButton={
              <MenuButton className="h-10 rounded-md border border-gray-200 flex justify-center items-center focus:outline-none">
                <IoSaveOutline className="w-6 h-10 cursor-pointer" />
              </MenuButton>
            }
            transition
            gap={10}
            align="end"
          >
            <MenuItem onClick={handleSaveToDB} className="flex justify-center">
              Save to DB
            </MenuItem>
            <MenuItem className="flex justify-center" onClick={handleSaveasCSV}>
              Save as CSV
            </MenuItem>
          </Menu>
        </div>
      </div>
      <div className="w-full px-8 md:px-16 xl:px-32 flex justify-center">
        <form className="w-full flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              name="broker"
              placeholder="Broker"
              required
              value={broker}
              onFocus={handleFocus}
              onChange={(e) => {
                setBroker(e.target.value);
              }}
              className="w-full border border-gray-500 rounded-sm px-2 py-1 outline-none focus:border-sky-700"
            />
            {errors.broker && (
              <p className="w-full text-red-400 text-xs text-left">
                {errors.broker}
              </p>
            )}
          </div>
          <div className="flex-1">
            <input
              type="text"
              name="client"
              placeholder="Client"
              required
              value={client}
              onFocus={handleFocus}
              onChange={(e) => {
                setClient(e.target.value);
              }}
              className="w-full border border-gray-500 rounded-sm px-2 py-1 outline-none focus:border-sky-700"
            />
            {errors.client && (
              <p className="w-full text-red-400 text-xs text-left">
                {errors.client}
              </p>
            )}
          </div>
          <div className="flex-1">
            <input
              type="text"
              name="policyPeriod"
              placeholder="Policy Period"
              required
              value={policyPeriod}
              onFocus={handleFocus}
              onChange={(e) => {
                setPolicyPeriod(e.target.value);
              }}
              className="w-full border border-gray-500 rounded-sm px-2 py-1 outline-none focus:border-sky-700"
            />
            {errors.policyPeriod && (
              <p className="w-full text-red-400 text-xs text-left">
                {errors.policyPeriod}
              </p>
            )}
          </div>
          <div className="flex-1">
            <select
              name="previousInsurer"
              id="select"
              onClick={handleFocus}
              onChange={(e) => setPreviousInsurer(e.target.value)}
              className="w-full border border-gray-500 rounded-sm outline-none focus:border-sky-700"
              style={{ padding: "5px 4px" }}
            >
              {insuranceCompanies.map((item, index) => {
                return (
                  <option key={index} value={item}>
                    {item}
                  </option>
                );
              })}
            </select>
            {errors.previousInsurer && (
              <p className="w-full text-red-400 text-xs text-left">
                {errors.previousInsurer}
              </p>
            )}
          </div>
        </form>
      </div>
      <div style={{ overflow: "auto", display: "flex" }} className="w-full">
        <div className="w-full px-8 md:px-16 xl:px-32 flex flex-col justify-center py-8">
          {errors.emptyTable && (
            <p className="w-full text-red-400 text-xs text-left">
              {errors.emptyTable}
            </p>
          )}
          <Table
            columns={state.columns}
            data={state.data}
            dispatch={dispatch}
            skipReset={state.skipReset}
            handleClick={handleClick}
            style={{ width: "100%" }}
          />
        </div>
      </div>
      <div
        style={{
          height: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <p style={{ color: grey(600) }}>
          Built by{" "}
          <a
            href="https://twitter.com/thesysarch"
            style={{ color: grey(600), fontWeight: 600 }}
          >
            @thesysarch
          </a>
        </p>
      </div>
    </div>
  );
}

CreateTable.propTypes = {
  selectedRow: PropTypes.object,
};

export default CreateTable;
