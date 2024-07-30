import React from "react";
import { ToastContainer, toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "react-toastify/dist/ReactToastify.css";
import "../mix.css";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";

const validationSchema = Yup.object({
  email: Yup.string()
    .matches(
      /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,
      "Enter a valid email"
    )
    .required("Email is required"),
});

const PasswordReset = () => {
  const navigate = useNavigate();

  const sendLink = async (email, { setSubmitting, resetForm }) => {
    try {
      const res = await axios.post(
        "http://localhost:8009/sendpasswordlink",
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 201) {
        resetForm();
        toast.success("Password reset link sent successfully to your email", {
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
      } else {
        toast.error("Invalid User", {
          position: "top-center",
        });
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 400 || status === 404) {
          toast.error("Invalid User", {
            position: "top-center",
          });
        } else {
          toast.error("An error occurred while sending the link", {
            position: "top-center",
          });
        }
      } else if (error.request) {
        toast.error("Server did not respond", {
          position: "top-center",
        });
      } else {
        toast.error("Request error: " + error.message, {
          position: "top-center",
        });
      }
    } finally {
      setSubmitting(false); 
    }
  };

  return (
    <>
      <section>
        <div className="form_data">
          <div className="form_heading">
            <h1>Enter Your Email</h1>
          </div>

          <Formik
            initialValues={{ email: "" }}
            validationSchema={validationSchema}
            onSubmit={(values, actions) => sendLink(values.email, actions)}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="form_input">
                  <label htmlFor="email">Email</label>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Enter Your Email Address"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="error"
                  />
                </div>

                <button className="btn" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send"}
                </button>
              </Form>
            )}
          </Formik>
          <p>
            <NavLink to="/">Home</NavLink>
          </p>
          <ToastContainer />
        </div>
      </section>
    </>
  );
};

export default PasswordReset;
