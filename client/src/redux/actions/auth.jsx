import api from "../../utils/api";
import { login } from "../reducers/authSlice";

export const Login = (signInfo, navigate) => async (dispatch) => {
  await api
    .post("/auth/login", signInfo)
    .then((res) => {
      dispatch(login(res.data));
      navigate("/tb/dbtable");
    })
    .catch((error) => alert(error?.response?.data));
};

export const Register = (signInfo, navigate) => async () => {
  await api
    .post("/auth/register", signInfo)
    .then(() => {
      navigate("/");
    })
    .catch((error) => alert(error?.response?.data));
};
