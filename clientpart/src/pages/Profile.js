import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { LoginContext } from "../ContextProvider/Context";
import { Button } from "react-bootstrap";
import handleKeyDown from "../utils/validation";

const Profile = () => {
  const { logindata } = useContext(LoginContext);
  const navigate = useNavigate(); 
  const [userData, setUserData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchUserData = async () => {
    if (!logindata?.ValidUserOne?._id) {
      // toast.error("User data is missing");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8009/viewProfile/${logindata?.ValidUserOne?._id}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": logindata?.ValidUserOne?.tokens[0]?.token || "",
          },
        }
      );

      if (response.status === 200 && response.data?.user) {
        setUserData(response.data.user);
      } else {
        toast.error("Failed to fetch profile data");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("An error occurred while fetching profile data");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [logindata]);

  const validationSchema = Yup.object({
    email: Yup.string().email("Enter a valid email").required("Email is required"),
    name: Yup.string().required("Name is required"),
  });

  const handleEditToggle = () => {
    setIsEditMode((prev) => !prev);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!logindata?.ValidUserOne?._id) {
      // toast.error("User data is missing");
      setSubmitting(false);
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8009/updateProfile/${logindata?.ValidUserOne?._id}`,
        values,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": logindata?.ValidUserOne?.tokens[0]?.token || "",
          },
        }
      );

      if (response.status === 200 && response.data?.user) {
        setUserData(response.data.user);
        toast.success("Profile updated successfully");
        setIsEditMode(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating the profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <section>
      <div className="form_data">
        <Button
          variant="primary"
          onClick={() => navigate(-1)} 
          className="mb-3"
          // style={{ marginLeft: "-354px" }}
        >
          Back
        </Button>

        <Button
          variant="primary"
          onClick={handleEditToggle}
          className="mb-3"
          // style={{ marginLeft: "60%" }} 
        >
          {isEditMode ? "Cancel" : "Edit Profile"}
        </Button>

        <Formik
          initialValues={{
            email: userData.email || "",
            name: userData.fname || "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="form_input">
                <label htmlFor="email">Email</label>
                <Field
                  type="email"
                  name="email"
                  placeholder="Enter Your Email Address"
                  disabled
                />
                <ErrorMessage name="email" component="div" className="error" />
              </div>
              <div className="form_input">
                <label htmlFor="name">Name</label>
                <Field
                  type="text"
                  name="name"
                  placeholder="Enter Your Name"
                  disabled={!isEditMode}
                  onKeyDown={handleKeyDown}
                />
                <ErrorMessage name="name" component="div" className="error" />
              </div>

              {isEditMode && (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Save"}
                </Button>
              )}
            </Form>
          )}
        </Formik>

        <ToastContainer />
      </div>
    </section>
  );
};

export default Profile;
