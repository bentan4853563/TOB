import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";

import { BsEye } from "react-icons/bs";
import { BsTrash3 } from "react-icons/bs";
import { MdOutlineModeEditOutline } from "react-icons/md";

import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import {
	clearFileName,
	clearMetaData,
	clearTablData,
	setFileName,
	setMetaData,
	setTableData,
} from "../redux/reducers/tableSlice";

import { clearLoading, setLoading } from "../redux/reducers/loadingSlice";

const DisplayTable = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { token } = useSelector((state) => state.auth);

	const [broker, setBroker] = useState("");
	const [client, setClient] = useState("");
	const [insurer, setInsurer] = useState(
		"ABU DHABI NATIONAL INSURANCE COMPANY"
	);

	const base_URL = import.meta.env.VITE_BACKEND_URL;

	const [dbTableData, setDBTableData] = useState(null);
	useEffect(() => {
		dispatch(clearTablData());
		dispatch(clearFileName());
		dispatch(clearMetaData());
		const fetchData = async () => {
			try {
				dispatch(setLoading());
				const response = await fetch(`${base_URL}/table/readAll`, {
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
							const response = await fetch(`${base_URL}/table/delete/${id}`, {
								method: "DELETE",
								headers: {
									"x-auth-token": token,
									"ngrok-skip-browser-warning": true,
								},
							});
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

	// const handleClickUpload = () => {
	// 	setSettingModalOpen(true);
	// 	// setIsModalOpen(false);
	// };

	const handleView = async (index) => {
		dispatch(setLoading());
		const metaData = dbTableData[index];
		dispatch(setMetaData(metaData));
		const response = await fetch(`${base_URL}/table/getOne`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-auth-token": token,
				"ngrok-skip-browser-warning": true,
			},
			body: JSON.stringify(metaData),
		});
		const result = await response.json();
		dispatch(setMetaData(result.metaData));
		dispatch(setTableData(result.fileData));
		dispatch(setFileName(metaData.sourceTOB));
		navigate("/tb/view");
		dispatch(clearLoading());
	};

	const handleEdit = async (index) => {
		dispatch(setLoading());
		const metaData = dbTableData[index];
		dispatch(setMetaData(metaData));
		const response = await fetch(`${base_URL}/table/getOne`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-auth-token": token,
				"ngrok-skip-browser-warning": true,
			},
			body: JSON.stringify(metaData),
		});
		const result = await response.json();
		dispatch(setMetaData(result.metaData));
		dispatch(setTableData(result.fileData));
		dispatch(setFileName(metaData.sourceTOB));
		navigate("/tb/new_or_edit");
		dispatch(clearLoading());
	};

	const handleNewAndEdit = () => {
		navigate("/tb/new_or_edit");
	};

	const handleSearch = async () => {
		dispatch(setLoading());
		const searchData = {
			broker,
			client,
			insurer,
		};
		const response = await fetch(`${base_URL}/table/search`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-auth-token": token,
				"ngrok-skip-browser-warning": true,
			},
			body: JSON.stringify(searchData),
		});
		const result = await response.json();
		console.log(result);
		setDBTableData(result);
		// dispatch(setMetaData(result.metaData));
		// dispatch(setTableData(result.fileData));
		// dispatch(setFileName(metaData.sourceTOB));
		// navigate("/tb/new_or_edit");
		dispatch(clearLoading());
	};
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
	return (
		<div className='w-full h-full bg-gray-100 px-24 flex flex-col items-start justify-start'>
			<div className='w-full px-8 py-4 my-4 flex justify-between items-center bg-white rounded-lg'>
				<span className='text-2xl'>Documents</span>
				<button
					onClick={handleNewAndEdit}
					className='py-2 bg-indigo-600 text-white border-none focus:outline-none'
				>
					New Document
				</button>
			</div>
			<div className='w-full py-2 flex flex-col items-start bg-white rounded-lg divide-y divide-gray-300'>
				<div className='py-2 px-8'>
					<span className='text-xl font-bold font-sans'>Search</span>
				</div>
				<div className='w-full px-8 py-4 flex flex-col gap-3'>
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
							onChange={(e) => setInsurer(e.target.value)}
							className='w-full lg:w-1/2 px-2 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:border-indigo-600'
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
							onChange={(e) => setClient(e.target.value)}
							className='w-full lg:w-1/2 px-2 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:border-indigo-600'
						/>
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
							onChange={(e) => setBroker(e.target.value)}
							className='w-full lg:w-1/2 px-2 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:border-indigo-600'
						/>
					</div>
					<button
						onClick={handleSearch}
						className='w-32 py-2 bg-indigo-600 text-white border-none focus:outline-none'
					>
						Search
					</button>
				</div>
			</div>
			{dbTableData && dbTableData.length > 0 && (
				<div className='w-full py-2 my-4 flex flex-col bg-white rounded-lg divide-y divide-gray-300'>
					<div className='py-2 px-8'>
						<span className='text-xl font-bold font-sans'>Search Results</span>
					</div>
					<div className='px-4 py-4'>
						{dbTableData && (
							<table className='w-full'>
								<thead>
									<tr>
										<th>No</th>
										{columns.map(
											(item, index) =>
												item !== "_id" && (
													<th
														className='py-3'
														key={index}
													>
														{/* {item === "sourceTOB"
												? "Source TOB"
												: item === "resultTOB"
												? "TOB"
												: item} */}
														{item}
													</th>
												)
										)}
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{dbTableData.map((row, rowIndex) => (
										<tr
											key={rowIndex}
											className='hover:bg-gray-100'
										>
											<td>{rowIndex + 1}</td>
											{columns.map(
												(colKey, colIndex) =>
													colKey !== "_id" && (
														<td key={colIndex}>{row[colKey]}</td>
													)
											)}
											<td>
												<div className='flex gap-2'>
													<BsEye
														className='cursor-pointer'
														size={20}
														onClick={() => handleView(rowIndex)}
													/>
													<MdOutlineModeEditOutline
														className='cursor-pointer'
														size={20}
														onClick={() => handleEdit(rowIndex)}
													/>
													<BsTrash3
														className='cursor-pointer'
														size={20}
														onClick={() => handleDelete(row._id)}
													/>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default DisplayTable;
