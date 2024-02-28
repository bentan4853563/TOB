import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
	setMetaData,
	setUploadedFile,
	setReview,
} from "../redux/reducers/tableSlice";
import UploadSettingModal from "../components/UploadSettingModal";

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

function NewDocument() {
	const navigate = useNavigate();
	const customDispatch = useDispatch();
	const [state, dispatch] = useReducer(reducer, makeData(10));
	const base_URL = import.meta.env.VITE_BACKEND_URL;

	const { token } = useSelector((state) => state.auth);
	const { fileName } = useSelector((state) => state.table);

	const { metaData } = useSelector((state) => state.table);
	const [file, setFile] = useState(null);
	// const [uploadedFileName, setUploadedFileName] = useState("");
	const [settingModalOpen, setSettingModalOpen] = useState(false);
	const [broker, setBroker] = useState("");
	const [client, setClient] = useState("");
	const [previousInsurer, setPreviousInsurer] = useState(
		"ABU DHABI NATIONAL INSURANCE COMPANY"
	);
	// const [policyPeriod, setPolicyPeriod] = useState("");
	const [errors, setErrors] = useState({
		broker: "",
		client: "",
		previousInsurer: "",
		emptyTable: "",
		file,
	});
	useEffect(() => {
		if (metaData) {
			setBroker(metaData.broker);
			setClient(metaData.client);
			// setPolicyPeriod(metaData.policyPeriod);
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

	const handleFileInput = (e) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
		}
	};

	const handleProcess = () => {
		if (Object.values(errors).every((error) => error === "")) {
			const newMetaData = {
				broker: broker,
				client: client,
				previousInsurer: previousInsurer,
			};
			customDispatch(setMetaData(newMetaData));
			customDispatch(setUploadedFile(file));
			setSettingModalOpen(true);
		} else {
			console.log("Form has errors. Please correct them before saving.");
		}
	};

	const handleValidate = () => {
		let newErrors = {};

		if (!broker || broker.trim() === "") {
			newErrors.broker = "Broker meta data is required";
		}

		if (!client || client.trim() === "") {
			newErrors.client = "Client meta data is required";
		}

		if (!file) {
			newErrors.file = "Please upload file";
		}

		if (!previousInsurer || previousInsurer.trim() === "") {
			newErrors.previousInsurer =
				"Previous Insurer message meta data is required";
		}

		setErrors(newErrors);
	};

	const handleReview = async () => {
		const response = await fetch(`${base_URL}/table/review`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-auth-token": token, // Include the token in the Authorization header
				"ngrok-skip-browser-warning": true,
			},
			body: JSON.stringify({ id: metaData._id }),
		});
		console.log("response", response);
		if (response.status === "ok") {
			customDispatch(setReview());
		}
	};

	const handleSaveasCSV = () => {
		if (Object.values(errors).every((error) => error === "")) {
			Makecsv(state.data);
		}
	};

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
					sourceTOB: fileName,
				},
			};

			try {
				const response = await fetch(
					"fetch(`${base_URL}/table/fileUploadAndSave",
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
				customDispatch(clearFileName());
				customDispatch(clearTablData());
				customDispatch(clearMetaData());
			} catch (error) {
				console.error("Error saving data:", error);
				// Handle error if needed
			}
		} else {
			console.log("Form has errors. Please correct them before saving.");
		}
	};

	useEffect(() => {
		handleValidate();
	}, [broker, client, previousInsurer, file]);
	console.log("state.data", state.data);
	return (
		<div className='w-full h-full bg-gray-100 px-24 flex flex-col items-start justify-start'>
			<div className='w-full px-8 py-4 my-4 flex justify-start items-center bg-white rounded-lg'>
				<span className='text-2xl'>Documents</span>
			</div>
			<div className='w-full py-2 flex flex-col items-start bg-white rounded-lg divide-y divide-gray-300'>
				<div className='py-2 px-8'>
					<span className='text-xl font-bold font-sans'>New Document</span>
				</div>
				<div className='w-full flex items-end'>
					<div className='w-1/2 px-8 py-4 flex flex-col gap-3'>
						<div className='flex flex-col gap-1'>
							<label
								className='text-black'
								htmlFor='insurer'
							>
								Insurer
							</label>
							<select
								name='insurer'
								id='insurer'
								value={previousInsurer}
								onChange={(e) => setPreviousInsurer(e.target.value)}
								className='w-full px-2 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:border-indigo-600'
							>
								{insuranceCompanies.map((item, index) => {
									return (
										<option
											key={index}
											value={item}
										>
											{item}
										</option>
									);
								})}
							</select>
						</div>
						<div className='flex flex-col gap-1'>
							<label
								className='text-black'
								htmlFor='client'
							>
								Client
							</label>
							<input
								type='text'
								name='client'
								placeholder='Please enter Client Name'
								value={client}
								onFocus={handleFocus}
								onChange={(e) => setClient(e.target.value)}
								className='w-full px-2 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-600'
							/>
							{errors.client && (
								<p className='w-full text-red-400 text-xs text-left'>
									{errors.client}
								</p>
							)}
						</div>
						<div className='flex flex-col gap-1'>
							<label
								className='text-black'
								htmlFor='broker'
							>
								Broker
							</label>
							<input
								type='text'
								name='broker'
								placeholder='Please enter Broker Name'
								value={broker}
								onFocus={handleFocus}
								onChange={(e) => setBroker(e.target.value)}
								className='w-full px-2 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:border-indigo-600'
							/>
							{errors.broker && (
								<p className='w-full text-red-400 text-xs text-left'>
									{errors.broker}
								</p>
							)}
						</div>
						<div className='flex flex-col gap-1'>
							<label
								className='text-black'
								htmlFor='sourceTOB'
							>
								Source TOB File
							</label>
							<div className='flex gap-2'>
								<div className='flex flex-col'>
									<input
										type='text'
										value={file ? file.name : ""}
										className='flex-1 px-4 py-1.5 rounded-md border border-gray-200'
										disabled
									/>
									{errors.file && (
										<p className='w-full text-red-400 text-xs text-left'>
											{errors.broker}
										</p>
									)}
								</div>
								<label htmlFor='fileInput'>
									<span
										onClick={handleFocus}
										className='w-48 bg-indigo-600 text-white flex justify-center items-end px-4 py-2 rounded-md cursor-pointer'
									>
										Upload
									</span>
									<input
										type='file'
										id='fileInput'
										name='fileInput'
										className='hidden px-4 border border-gray-200'
										onChange={handleFileInput}
									/>
								</label>
							</div>
						</div>
						<div className='flex'>
							<span
								className='w-48 bg-indigo-600 text-white text-center focus:outline-none px-4 py-2 rounded-md cursor-pointer'
								onClick={handleProcess}
							>
								Process
							</span>
						</div>
					</div>
				</div>
			</div>

			{state.data && state.data.length > 0 && (
				<div
					style={{ display: "flex" }}
					className='w-full bg-white rounded-lg my-4'
				>
					<div className='w-full px-8 flex flex-col gap-4 justify-center py-8'>
						{errors.emptyTable && (
							<p className='w-full text-red-400 text-xs text-left'>
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
						<div className='flex gap-4'>
							<button
								onClick={handleReview}
								className='w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none'
							>
								Review
							</button>
							{metaData.status === "Review" && (
								<button className='w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none'>
									Generate
								</button>
							)}
							<button className='w-48 bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none'>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{settingModalOpen && (
				<UploadSettingModal hideModal={() => setSettingModalOpen(false)} />
			)}
		</div>
	);
}

export default NewDocument;
