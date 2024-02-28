import { useState } from "react";
import PropTypes from "prop-types";

import { Button } from "primereact/button";

import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setFileName, setTableData } from "../redux/reducers/tableSlice";
import { clearLoading, setLoading } from "../redux/reducers/loadingSlice";

// import FormData from "form-data";

const UploadSettingModal = ({ hideModal }) => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const { uploadedFile } = useSelector((state) => state.table);
	const [select, setSelect] = useState("Option1");
	const [sections, setSections] = useState([]);
	const [enableUpload, setEnableUpload] = useState(false);
	const [errors, setErrors] = useState({
		section: "",
		select: "",
	});

	const [input4, setInputValue4] = useState("");

	const optionList = ["Option1", "Option2", "Option3"];

	const handleFetch = async () => {
		let newErrors = {};

		if (!select.trim()) {
			newErrors.select = "Input field is required";
		}
		if (!sections.length) {
			newErrors.section = "Section field have to be include one section.";
		}
		setErrors(newErrors);
		if (Object.keys(newErrors).length === 0) {
			setEnableUpload(true);
		} else {
			setEnableUpload(false);
		}
		const formData = new FormData();
		formData.append("file", uploadedFile);
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
				dispatch(setTableData(data));
				// dispatch(setFileName(file.name));
				dispatch(clearLoading());
				navigate("/tb/createtable");
				hideModal();
			} else {
				console.error("Error:", response.statusText);
			}
		} catch (error) {
			console.error("Error:", error);
		}
	};

	const handleRemoveSection = (value) => {
		setSections((prev) => prev.filter((item) => item !== value));
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			setSections((prev) => [...prev, e.target.value]);
			setInputValue4("");
			setErrors({ ...errors, section: "" });
		}
	};

	const handleClickModal = (e) => {
		if (e.target.id == "modal-pan") {
			hideModal();
		}
	};
	return (
		<div
			id='modal-pan'
			className='flex h-full w-full justify-center items-center z-30 fixed top-0 left-0'
			onClick={handleClickModal}
		>
			<div className='w-4/5 md:w-1/2 xl:w-1/3 2xl:w-1/4 h-2/3 px-12 py-16 flex flex-col items-center bg-white shadow-md shadow-gray-500 rounded-md relative'>
				<IoClose
					className='absolute top-4 right-4 cursor-pointer w-8 h-8'
					onClick={() => hideModal()}
				/>
				<p className='my-8 font-sans font-semibold text-4xl text-center'>
					Please Input Some Needs
				</p>
				<div className='w-full flex flex-col gap-6'>
					<div>
						<select
							name='select'
							id='select'
							onChange={(e) => setSelect(e.target.value)}
							className='border border-gray-500 rounded-sm w-full px-2 py-2 outline-none focus:border-sky-700'
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
						{errors.select && (
							<p className='w-full text-red-400 text-xs text-left'>
								{errors.select}
							</p>
						)}
					</div>
					<input
						id='set_List'
						type='text'
						name='input4'
						placeholder='Category'
						value={input4}
						onChange={(e) => {
							setInputValue4(e.target.value);
						}}
						onKeyDown={handleKeyDown}
						className='border border-gray-500 rounded-sm w-full px-2 py-2 outline-none focus:border-sky-700'
					/>
					<div>
						<div className='p-2 flex flex-wrap gap-2 min-h-24  border border-gray-500'>
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
												onClick={() => handleRemoveSection(item)}
											/>
										</span>
									);
								})}
						</div>
						{errors.section && (
							<p className='w-full text-red-400 text-xs text-left'>
								{errors.section}
							</p>
						)}
					</div>

					<Button
						onClick={handleFetch}
						className='border border-gray-200 py-2 text-center focus:outline-none text-center cursor-pointer w-full select-none'
						role='button'
						tabIndex='0'
						severity='info'
					>
						Fetch
					</Button>
				</div>
			</div>
		</div>
	);
};

UploadSettingModal.propTypes = {
	hideModal: PropTypes.func.isRequired,
};

export default UploadSettingModal;
