import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import "react-confirm-alert/src/react-confirm-alert.css";

const ViewDocuments = () => {
	const navigate = useNavigate();
	const { metaData } = useSelector((state) => state.table);

	const { table } = useSelector((state) => state.table);

	const columns = table && table.length > 0 ? Object.keys(table[0]) : [];

	const handleNewAndEdit = () => {
		navigate("/tb/new_or_edit");
	};

	return (
		<div className='w-full h-full bg-gray-100 px-24 flex flex-col items-start justify-start'>
			<div className='w-full px-8 py-4 my-4 flex justify-between items-center bg-white rounded-lg'>
				<span className='text-2xl'>Documents</span>
				<button
					onClick={handleNewAndEdit}
					className='w-32 py-2 bg-indigo-600 text-white border-none focus:outline-none'
				>
					Edit
				</button>
			</div>
			<div className='w-full py-2 flex flex-col items-start bg-white rounded-lg divide-y divide-gray-300'>
				<div className='py-2 px-8'>
					<span className='text-xl font-bold font-sans'>View Document</span>
				</div>
				<div className='w-full px-8 py-4 flex flex-col gap-3'>
					<div className='flex flex-col gap-1'>
						<label
							className='text-black'
							htmlFor='insurer'
						>
							Insurer
						</label>
						<span className='ml-4'>
							{metaData.prevInsurer ? metaData.prevInsurer : "None"}
						</span>
					</div>
					<div className='flex flex-col gap-1'>
						<label
							className='text-black'
							htmlFor='client'
						>
							Client
						</label>
						<span className='ml-4'>
							{metaData.client ? metaData.client : "None"}
						</span>
					</div>
					<div className='flex flex-col gap-1'>
						<label
							className='text-black'
							htmlFor='broker'
						>
							Broker
						</label>
						<span className='ml-4'>
							{metaData.broker ? metaData.broker : "None"}
						</span>
					</div>
				</div>
			</div>
			<div className='w-full py-2 my-4 flex flex-col bg-white rounded-lg divide-y divide-gray-300'>
				<div className='py-2 px-8'>
					<span className='text-xl font-bold font-sans'>Benefits</span>
				</div>
				<div className='px-4 py-4'>
					{table && (
						<table className='w-full'>
							<thead>
								<tr>
									<th>No</th>
									{columns.slice(1, columns.length).map((item, index) => (
										<th
											className='py-3'
											key={index}
										>
											{item === "sourceTOB"
												? "Source TOB"
												: item === "resultTOB"
												? "TOB"
												: item}
											{/* {item} */}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{table.map((row, rowIndex) => (
									<tr
										key={rowIndex}
										className='hover:bg-gray-100'
									>
										<td>{rowIndex + 1}</td>
										{columns
											.slice(1, columns.length)
											.map((colKey, colIndex) => (
												<td key={colIndex}>{row[colKey]}</td>
											))}
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</div>
		</div>
	);
};

export default ViewDocuments;
