import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Register } from "../redux/actions/auth";
import { useDispatch } from "react-redux";
import logo from "../assets/logo.png";

const SignUp = () => {
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState({
		email: "",
		password: "",
	});

	const dispatch = useDispatch();

	function isValidEmail(email) {
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return regex.test(email);
	}

	const handleSubmit = () => {
		let newErrors = {};

		if (!email.trim()) {
			newErrors.email = "Email is required";
		} else if (!isValidEmail(email)) {
			newErrors.email = "Please enter a valid email address";
		}
		if (!password.trim()) {
			newErrors.password = "Password is required";
		}

		setErrors(newErrors);

		if (Object.keys(newErrors).length === 0) {
			const signInfo = {
				email,
				password,
			};
			dispatch(Register(signInfo, navigate));
			setEmail("");
			setPassword("");
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
			setErrors({ ...errors, section: "" });
		}
	};

	const handleFocus = (e) => {
		setErrors({ ...errors, [e.target.name]: "" });
	};

	return (
		<div className='w-[100vw] h-[100vh] flex justify-center items-center bg-gray-200'>
			<div className='fadeup w-4/5 md:w-1/2 xl:w-1/3 2xl:w-1/4 h-2/3 block rounded-lg bg-white shadow-lg dark:bg-neutral-800'>
				<div className='mx-12'>
					{/* <!--Logo--> */}
					<div className='text-center'>
						<img
							className='mx-auto w-32 my-16'
							src={logo}
							alt='logo'
						/>
						<h4 className='my-8 text-2xl font-bold'>Register</h4>
					</div>

					<div className='flex flex-col'>
						<p>Please signin to your account</p>
						{/* <!--Username input--> */}
						<input
							type='email'
							name='email'
							value={email}
							placeholder='Email'
							autoFocus
							onFocus={handleFocus}
							onChange={(e) => setEmail(e.target.value)}
							className='w-full py-2 mt-4 rounded-sm pl-2 border border-gray-600 focus:outline-none'
						/>
						{errors.email && (
							<p className='text-red-400 text-xs text-left w-4/5 sm:w-2/3'>
								{errors.email}
							</p>
						)}
						<input
							type='password'
							name='password'
							value={password}
							placeholder='Password'
							onChange={(e) => setPassword(e.target.value)}
							onFocus={handleFocus}
							onKeyDown={handleKeyDown}
							className='w-full py-2 mt-8 rounded-sm pl-2 border border-gray-600 focus:outline-none'
						/>
						{errors.password && (
							<p className='text-red-400 text-xs text-left w-4/5 sm:w-2/3'>
								{errors.password}
							</p>
						)}
						<button
							className='bg-indigo-700 my-8 inline-block w-full rounded px-6 py-3 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out focus:outline-none'
							onClick={handleSubmit}
						>
							Register
						</button>

						{/* <!--Register button--> */}
						<div className='flex items-center justify-between mt-12 pb-6'>
							<Link
								to='/'
								className='mb-0 mr-2'
							>
								Have an account?
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignUp;
