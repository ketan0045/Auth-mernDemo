import React, { useContext, useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Error from "./pages/Error";
import ForgotPassword from "./pages/ForgotPassword";
import PasswordReset from "./pages/PasswordReset";
import Profile from "./pages/Profile";
import { LoginContext } from "./ContextProvider/Context";
import axios from "axios";

function App() {
  const navigate = useNavigate();
  const [data, setData] = useState(false);
  const { setLoginData } = useContext(LoginContext);

  const DashboardValid = async () => {
    let token = localStorage.getItem("usersdatatoken");

    if (token) {
      try {
        const res = await axios.get("http://localhost:8009/validuser", {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });

        if (res.status === 401) {
          navigate("/");
          localStorage.clear();
          console.log("User not valid");
        } else {
          console.log("User verified");
          setLoginData(res.data);
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error verifying user:", error);
        navigate("/");
        localStorage.clear();
      }
    }
  };

  useEffect(() => {
    setTimeout(() => {
      DashboardValid();
      setData(true);
    }, 2000);
  }, []); 

  return (
    <>
      {data ? (
        <>
          <Header />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/forgotpassword/:id/:token" element={<ForgotPassword />} />
            <Route path="*" element={<Error />} />
          </Routes>
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          Loading... &nbsp;
          <CircularProgress />
        </Box>
      )}
    </>
  );
}

export default App;







