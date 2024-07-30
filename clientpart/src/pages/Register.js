import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "../mix.css"
import handleKeyDown from "../utils/validation";

const validationSchema = Yup.object({
  fname: Yup.string()
    .required("Name is required") 
    .test(
      "no-whitespace",
      "Name cannot be empty or contain only spaces",
      (value) => value.trim() !== ""
    )
    .max(25, "Name must be less than 25 characters"),

  email: Yup.string()
  .matches(
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,
    "Enter a valid email"
  )
  .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  cpassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
  //   password: Yup.string()
  //   .min(8, "Password must be at least 8 characters long")
  //   .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
  //   .matches(/[a-z]/, "Password must contain at least one lowercase letter")
  //   .matches(/\d/, "Password must contain at least one number")
  //   .matches(/[\W_]/, "Password must contain at least one special character")
  //   .required("Password is required"),
  // cpassword: Yup.string()
  //   .oneOf([Yup.ref("password")], "Passwords must match")
  //   .required("Confirm password is required"),
});

const Register = () => {
  const [passShow, setPassShow] = useState(false);
  const [cpassShow, setCPassShow] = useState(false);
  const data = localStorage.getItem("usersdatatoken");

  const navigate = useNavigate();

  const initialValues = {
    fname: "",
    email: "",
    password: "",
    cpassword: "",
  };

  const handleRegister = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axios.post(
        "http://localhost:8009/register",
        values
      );

      if (response.status === 201) {
        toast.success("Registration successful", {
          position: "top-center",
        });
        const delayPromise = await new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 1500);
        });
        if (delayPromise) {
          resetForm();
          navigate("/");
        }
      }
    } catch (error) {
      toast.error("Registration failed", {
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
            <h1>Sign Up</h1>
            <p style={{ textAlign: "center" }}>
              We're glad you're using Project Cloud to manage your tasks!
            </p>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleRegister}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="form_input">
                  <label htmlFor="fname">Name</label>
                  <Field
                    type="text"
                    name="fname"
                    placeholder="Enter your name"
                    onKeyDown={handleKeyDown}              
                  />
                  <ErrorMessage
                    name="fname"
                    component="div"
                    className="error"
                  />
                </div>

                <div className="form_input">
                  <label htmlFor="email">Email</label>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    onKeyDown={(event)=>  {
                        if (event.key === " " ) {
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
                      placeholder="Enter your password"
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

                <div className="form_input">
                  <label htmlFor="cpassword">Confirm Password</label>
                  <div className="two">
                    <Field
                      type={!cpassShow ? "password" : "text"}
                      name="cpassword"
                      placeholder="Confirm your password"
                      onKeyDown={handleKeyDown}
                    />
                    <div
                      className="showpass"
                      onClick={() => setCPassShow(!cpassShow)}  
                    >
                      <FontAwesomeIcon icon={cpassShow ? faEyeSlash : faEye} />
                    </div>
                  </div>
                  <ErrorMessage
                    name="cpassword"
                    component="div"
                    className="error"
                  />
                </div>

                <button className="btn" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Registering..." : "Sign Up"}
                </button>
                <p>
                  Already have an account? <NavLink to="/">Log In</NavLink>
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

export default Register;
