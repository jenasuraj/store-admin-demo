import { useEffect, useState } from "react";
import Layout from "../Layout";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser, setAuth, userLogin } from "../app/AuthSlice";
import { PreLoader } from "./ui/Preloader";
import axios, { AxiosError } from "axios";
import { BASE_URL } from "../lib/constants";
import { toast } from "sonner";

const ProtectedRoutes = () => {
  const { isAuthenticated, loading: reduxLoading } = useSelector(selectUser);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const ValidateToken = async () => {
    try {
      const response = await axios.get(BASE_URL + "/API/Login/ValidateToken");
      if (response.status === 200) {
        dispatch(setAuth(response.data));
        if (pathname === "/") {
          navigate(response.data?.path);
        }
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.status === 401) {
        toast.error(
          "Your session has expired or is invalid. Please log in again to continue."
        );
        navigate("/login", { replace: true });
        dispatch(logout());
        dispatch({
          type: "store/reset",
        });
        sessionStorage.clear();
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      // toast.error(
      //   "Your session has expired or is invalid. Please log in again to continue."
      // );
      navigate("/login", { replace: true });
      dispatch({
        type: "store/reset",
      });
      sessionStorage.clear();
    } else {
      ValidateToken();
    }

    setLoading(false);
  }, [isAuthenticated]);

  if (loading || reduxLoading) {
    return <PreLoader messages={["Loading", "Just there"]} dotCount={3} />; // Show loader while checking authentication
  }

  return isAuthenticated ? <Layout /> : null;
};

export default ProtectedRoutes;
