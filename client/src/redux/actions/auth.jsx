import api from "../../utils/api";
import { login } from "../reducers/authSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Login = (signInfo, navigate) => async (dispatch) => {
  await api
    .post("/auth/login", signInfo)
    .then((res) => {
      dispatch(login(res.data));
      toast.success("Logged in successfully.");
      navigate("/tb/home");
    })
    .catch((error) => {
      toast.error(error?.response?.data || "An error occurred during login.");
    });
};

export const Register = (signInfo, navigate) => async () => {
  await api
    .post("/auth/register", signInfo)
    .then(() => {
      navigate("/");
    })
    .catch((error) => {
      toast.error(error?.response?.data || "An error occurred during login.");
    });
};
