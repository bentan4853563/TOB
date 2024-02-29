import { useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";

// import { IoSaveOutline } from "react-icons/io5";

import Table from "./Table";
import MakeData from "./makeData";

import { shortId } from "./utils";
import "./style.css";
import {
	setReview,
	clearFileName,
	clearTablData,
	clearMetaData,
} from "../../redux/reducers/tableSlice";
import { clearLoading, setLoading } from "../../redux/reducers/loadingSlice";

function reducer(state, action) {
	switch (action.type) {
		case "UPDATE_DATA": {
			return {
				...state,
				...action.payload,
			};
		}
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

function EditableTable() {
	const navigate = useNavigate();
	const customDispatch = useDispatch();
	const base_URL = import.meta.env.VITE_BACKEND_URL;

	const { token } = useSelector((state) => state.auth);
	const { metaData } = useSelector((state) => state.table);
	const { uploadedFile } = useSelector((state) => state.table);
	const { table } = useSelector((state) => state.table);

	const [state, dispatch] = useReducer(reducer, {
		data: [],
		columns: [],
		skipReset: false,
	});

	useEffect(() => {
		const newDataState = MakeData(table);
		dispatch({ type: "UPDATE_DATA", payload: newDataState });
	}, [table]);

	const handleClick = (index) => {
		dispatch({ type: "delete_row", columnId: index });
	};

	const handleReview = async () => {
		// await fetch(`${base_URL}/table/review`, {
		// 	method: "POST",
		// 	headers: {
		// 		"content-type": "application/json",
		// 		"x-auth-token": token, // Include the token in the Authorization header
		// 		"ngrok-skip-browser-warning": true,
		// 	},
		// 	body: JSON.stringify({ id: metaData._id }),
		// });
		customDispatch(setReview());
	};

	// const handleSaveasCSV = () => {
	// 	if (Object.values(errors).every((error) => error === "")) {
	// 		Makecsv(state.data);
	// 	}
	// };

	const handleSaveToDB = async () => {
		// Proceed with saving data to the database
		let source_TOB = "";
		if (metaData.sourceTOB) {
			source_TOB = metaData.sourceTOB;
		} else {
			source_TOB = uploadedFile;
		}
		const formData = {
			table: state.data,
			metaData: {
				_id: metaData._id,
				broker: metaData.broker,
				client: metaData.client,
				previousInsurer: metaData.previousInsurer,
				status: "Generated",
				sourceTOB: source_TOB,
			},
		};

		customDispatch(setLoading());
		try {
			const response = await fetch(`${base_URL}/table/fileUploadAndSave`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-auth-token": token,
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				throw new Error("Failed to save data. Please try again.");
			}
			customDispatch(clearLoading());
			navigate("/tb/dbtable");
			dispatch(clearFileName());
			dispatch(clearTablData());
			dispatch(clearMetaData());
		} catch (error) {
			console.error("Error saving data:", error);
			// Handle error if needed
		}
	};

	const handleClose = () => {
		navigate("/tb/dbtable");
	};

	return (
		<div className='w-full h-full bg-gray-100 flex flex-col items-start justify-start'>
			{state.data && state.data.length > 0 && (
				<div
					style={{ display: "flex" }}
					className='w-full bg-white rounded-lg my-4'
				>
					<div className='w-full px-8 flex flex-col gap-4 justify-center py-8'>
						<Table
							columns={state.columns}
							data={state.data}
							dispatch={dispatch}
							skipReset={state.skipReset}
							handleClick={handleClick}
							style={{ width: "100%" }}
						/>
						<div className='flex gap-4'>
							{metaData.status === "Progress" && (
								<button
									onClick={handleReview}
									className='w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none'
								>
									Review
								</button>
							)}
							{(metaData.status === "Review" ||
								metaData.status === "Generated") && (
								<button
									onClick={handleSaveToDB}
									className='w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none'
								>
									Generate
								</button>
							)}
							<button
								onClick={handleClose}
								className='w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none'
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default EditableTable;
