import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Register } from "../redux/actions/auth";
import { useDispatch } from "react-redux";

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

  const handleFocus = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
  };

  return (
    <div className="w-full h-[100vh] flex justify-center items-center bg-gray-200">
      <div className="fadeup w-4/5 md:w-2/3 xl:w-2/3 2xl:w-1/2 h-4/5 block rounded-lg bg-white shadow-lg dark:bg-neutral-800">
        <div className="w-full h-full g-0 lg:flex lg:flex-wrap">
          <div className="px-4 md:px-0 lg:w-6/12">
            <div className="md:mx-6 md:p-12">
              {/* <!--Logo--> */}
              <div className="text-center">
                <img
                  className="mx-auto w-48"
                  src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
                  alt="logo"
                />
                <h4 className="mb-12 mt-1 pb-1 text-2xl font-bold">Register</h4>
              </div>

              <div className="flex flex-col">
                <p>Please signin to your account</p>
                {/* <!--Username input--> */}
                <input
                  type="email"
                  name="email"
                  value={email}
                  placeholder="Email"
                  autoFocus
                  onFocus={handleFocus}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-1 mt-4 rounded-sm pl-2 border border-gray-600 focus:outline-none"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs text-left w-4/5 sm:w-2/3">
                    {errors.email}
                  </p>
                )}
                <input
                  type="password"
                  name="password"
                  value={password}
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handleFocus}
                  className="w-full py-1 mt-8 rounded-sm pl-2 border border-gray-600 focus:outline-none"
                />
                {errors.password && (
                  <p className="text-red-400 text-xs text-left w-4/5 sm:w-2/3">
                    {errors.password}
                  </p>
                )}
                <button
                  className="my-8 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                  onClick={handleSubmit}
                  style={{
                    background:
                      "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
                  }}
                >
                  Register
                </button>

                {/* <!--Register button--> */}
                <div className="flex items-center justify-between mt-12 pb-6">
                  <p className="mb-0 mr-2">Have an account?</p>
                  <Link
                    to="/"
                    type="button"
                    className="inline-block rounded border-2 border-danger px-6 pb-[6px] pt-2 text-xs font-medium uppercase leading-normal text-danger transition duration-150 ease-in-out hover:border-danger-600 hover:bg-neutral-500 hover:bg-opacity-10 hover:text-danger-600 focus:border-danger-600 focus:text-danger-600 focus:outline-none focus:ring-0 active:border-danger-700 active:text-danger-700 dark:hover:bg-neutral-100 dark:hover:bg-opacity-10"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div
            className="flex items-center rounded-b-lg lg:w-6/12 lg:rounded-r-lg lg:rounded-bl-none"
            style={{
              background:
                "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
            }}
          >
            <div className="px-4 py-6 text-white md:mx-6 md:p-12">
              <h4 className="mb-6 text-xl font-semibold">
                We are more than just a company
              </h4>
              <p className="text-sm">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
