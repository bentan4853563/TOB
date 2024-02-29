import { useState } from "react";
import { useDispatch } from "react-redux";

import { Button } from "primereact/button";
import { IoClose } from "react-icons/io5";
import { clearLoading, setLoading } from "../redux/reducers/loadingSlice";
import {
	setMetaData,
	setTableData,
	setUploadedFile,
} from "../redux/reducers/tableSlice";
import EditableTable from "../components/EditableTable/EditableTable";

const NewDocument = () => {
	const dispatch = useDispatch();

	const [isMetaForm, setIsMetaForm] = useState(true);

	const [select, setSelect] = useState("Standard");
	const [catetoryInput, setCategoryInput] = useState("");
	const [sections, setSections] = useState([]);
	const [file, setFile] = useState(null);

	const [broker, setBroker] = useState("");
	const [client, setClient] = useState("");
	const [insurer, setInsurer] = useState(
		"ABU DHABI NATIONAL INSURANCE COMPANY"
	);

	const [optionErrors, setOptionErrors] = useState({
		select: "",
		file: "",
	});

	const [metaFormErrors, setMetaFormErrors] = useState({
		broker: "",
		client: "",
	});

	const optionList = ["Standard", "EliteCare", "GulfCare"];
	const companyList = [
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

	const handleProcess = () => {
		let newErrors = {};
		if (!broker.trim()) {
			newErrors.broker = "Broker is required";
		}
		if (!client.trim()) {
			newErrors.client = "Client is required";
		}

		setMetaFormErrors(newErrors);

		if (Object.keys(newErrors).length === 0) {
			const newMetaData = {
				broker,
				client,
				previousInsurer: insurer,
			};
			setMetaData(newMetaData);
			setIsMetaForm(false);
		}
	};

	const handleFocus = (e) => {
		setOptionErrors({ ...optionErrors, [e.target.name]: "" });
		setMetaFormErrors({ ...metaFormErrors, [e.target.name]: "" });
	};

	const handleFileInput = (e) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
		}
	};

	const handleRemoveSection = (param) => {
		setSections((prev) => prev.filter((item, index) => index !== param));
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			setSections((prev) => [...prev, e.target.value]);
			setCategoryInput("");
			setOptionErrors({ ...optionErrors, section: "" });
		}
	};

	const handleFetch = async () => {
		let newErrors = {};

		if (!sections.length) {
			newErrors.section = "Section field have to be include one section.";
		}
		if (!file) {
			newErrors.file = "Please upload file.";
		}
		setOptionErrors(newErrors);
		if (Object.keys(newErrors).length === 0) {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("category_list", JSON.stringify(sections));
			dispatch(setLoading());
			try {
				const response = await fetch(
					`${import.meta.env.VITE_PYTHON_BACKEND_URL}/generateDoc`,
					{
						method: "POST",
						body: formData,
					}
				);
				if (response.ok) {
					const data = await response.json();
					dispatch(setUploadedFile(file.name));
					dispatch(setTableData(data));
					dispatch(clearLoading());
				} else {
					console.error("Error:", response.statusText);
				}
			} catch (error) {
				console.error("Error:", error);
			}
		}
	};

	return (
		<div className='w-full h-full bg-gray-100 px-24 flex flex-col items-start justify-start'>
			<div className='w-full px-8 py-4 my-4 flex justify-start items-center bg-white rounded-lg'>
				<span className='text-2xl'>Documents</span>
			</div>
			<div className='w-full py-2 flex flex-col items-start bg-white rounded-lg divide-y divide-gray-300'>
				<div className='py-2 px-8'>
					<span className='text-xl font-bold font-sans'>New Document</span>
				</div>
				{isMetaForm ? (
					<div className='w-full px-8 py-2 flex flex-col gap-2'>
						<div className='flex flex-col gap-1'>
							<label htmlFor='broker'>Broker</label>
							<input
								type='text'
								name='broker'
								id='broker'
								value={broker}
								onFocus={handleFocus}
								onChange={(e) => setBroker(e.target.value)}
								className='border border-gray-200 rounded-lg w-full lg:w-2/3 px-2 py-2 outline-none focus:border-sky-700'
							/>
							{metaFormErrors.broker && (
								<p className='w-full text-red-400 text-xs text-left'>
									{metaFormErrors.broker}
								</p>
							)}
						</div>
						<div className='flex flex-col gap-1'>
							<label htmlFor='client'>Client</label>
							<input
								type='text'
								name='client'
								id='client'
								value={client}
								onFocus={handleFocus}
								onChange={(e) => setClient(e.target.value)}
								className='border border-gray-200 rounded-lg w-full lg:w-2/3 px-2 py-2 outline-none focus:border-sky-700'
							/>
							{metaFormErrors.client && (
								<p className='w-full text-red-400 text-xs text-left'>
									{metaFormErrors.client}
								</p>
							)}
						</div>
						<div className='flex flex-col gap-1'>
							<label htmlFor='insurer'>Insurer</label>
							<select
								name='insurer'
								id='insurer'
								onChange={(e) => setInsurer(e.target.value)}
								className='border border-gray-200 rounded-lg w-full lg:w-2/3 px-2 py-2 outline-none focus:border-sky-700'
							>
								{companyList.map((option, index) => {
									return <option key={index}>{option}</option>;
								})}
							</select>
						</div>
						<button
							onClick={handleProcess}
							className='w-48 lg-w-2/3 bg-indigo-600 text-white'
						>
							Process
						</button>
					</div>
				) : (
					<div className='w-full py-2 px-8 flex flex-col'>
						<div className='w-2/3 flex flex-col gap-1'>
							<div className='w-full flex flex-col gap-4'>
								<div>
									<select
										name='select'
										id='select'
										onChange={(e) => setSelect(e.target.value)}
										className='border border-gray-200 rounded-lg w-full lg:w-2/3 px-2 py-2 outline-none focus:border-sky-700'
									>
										{optionList.map((item, index) => {
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
								<input
									id='set_List'
									type='text'
									name='category'
									placeholder='Category'
									value={catetoryInput}
									onChange={(e) => {
										setCategoryInput(e.target.value);
									}}
									onKeyDown={handleKeyDown}
									className='border border-gray-200 rounded-lg w-full lg:w-2/3 px-2 py-2 outline-none focus:border-sky-700'
								/>
								<div>
									<div className='p-2 flex flex-wrap gap-2 min-h-24  border border-gray-200'>
										{sections &&
											sections.length > 0 &&
											sections.map((item, index) => {
												return (
													<span
														key={index}
														className='h-8 pl-4 pr-5 py-2 flex items-center rounded-sm relative bg-green-100'
													>
														{item}
														<IoClose
															className='w-4 h-4 absolute top-0.5 right-0.5 cursor-pointer'
															onClick={() => handleRemoveSection(index)}
														/>
													</span>
												);
											})}
									</div>
									{optionErrors.section && (
										<p className='w-full text-red-400 text-xs text-left'>
											{optionErrors.section}
										</p>
									)}
								</div>
							</div>
							<label
								className='text-black'
								htmlFor='sourceTOB'
							>
								Source TOB File
							</label>
							<div className='flex gap-2'>
								<div className='flex flex-col flex-1'>
									<input
										type='text'
										value={file ? file.name : ""}
										className='flex-1 px-4 py-1.5 rounded-md border border-gray-200'
										disabled
									/>
									{optionErrors.file && (
										<p className='w-full text-red-400 text-xs text-left'>
											{optionErrors.file}
										</p>
									)}
								</div>
								<label htmlFor='fileInput'>
									<span
										name='file'
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
							<Button
								onClick={handleFetch}
								className='border border-gray-200 py-2 my-2 focus:outline-none text-center cursor-pointer w-full select-none'
								role='button'
								tabIndex='0'
								severity='info'
							>
								Fetch
							</Button>
						</div>
					</div>
				)}
			</div>
			<div className='w-full my-2 bg-white rounded-lg'>
				<EditableTable />
			</div>
		</div>
	);
};

export default NewDocument;
