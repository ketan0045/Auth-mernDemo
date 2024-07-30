import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import handleKeyDown from "../utils/validation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const validationSchema = Yup.object({
  email: Yup.string()
    .matches(
      /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,
      "Enter a valid email"
    )
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const [passShow, setPassShow] = useState(false);

  const data = localStorage.getItem("usersdatatoken");

  const loginUser = async (values, { setSubmitting, resetForm }) => {
 
    try {
      const response = await axios.post("http://localhost:8009/login", values);
      console.log(response, "response=====26"); 
      

      if (response.status === 201) {
        localStorage.setItem("usersdatatoken", response.data.result.token);
        toast.success("Login successfully", {
          position: "top-center",
        });

        const delayPromise = await new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 1500);
        });
        console.log("resolve", delayPromise); 
        if (delayPromise) {
          resetForm();
          navigate("/dashboard");
        }
      } else {
        toast.error("Invalid credentials or", {
          position: "top-center",
        });
      }
    } catch (error) {
      // toast.error("Invalid credentials", {
      //   m position: "top-center",
      // });
      toast.error(error.response.data.error, {
        position: "top-center",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (data) {
      navigate("/dashboard");
    }
  }, [data]);

  return (
    <>
      <section>
        <div className="form_data">
          <div className="form_heading">
            <h1>Welcome Back, Log In</h1>
            <p>Hi, we are glad you are back. Please log in.</p>
          </div>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={loginUser}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="form_input">
                  <label htmlFor="email">Email</label>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Enter Your Email Address"
                    onKeyDown={(event) => {
                      if (event.key === " ") {
                        event.preventDefault();
                      }
                    }}
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="error"
                  />
                </div>

                <div className="form_input">
                  <label htmlFor="password">Password</label>
                  <div className="two">
                    <Field
                      type={!passShow ? "password" : "text"}
                      name="password"
                      placeholder="Enter Your password"
                      onKeyDown={handleKeyDown}
                    />
                    <div
                      className="showpass"
                      onClick={() => setPassShow(!passShow)}
                    >
                      <FontAwesomeIcon icon={passShow ? faEyeSlash : faEye} />
                    </div>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="error"
                  />
                </div>

                <button className="btn" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
                <p>
                  Don't have an Account?
                  <NavLink to="/register">Sign Up</NavLink>
                </p>
                <p style={{ color: "black", fontWeight: "bold" }}>
                  Forgot Password?
                  <NavLink to="/password-reset">Click Here</NavLink>
                </p>
              </Form>
            )}
          </Formik>

          <ToastContainer />
        </div>
      </section>
    </>
  );
};

export default Login;
