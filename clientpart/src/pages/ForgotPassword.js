import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const validationSchema = Yup.object({
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { id, token } = useParams();
  const [passShow, setPassShow] = useState(false);
  const [cpassShow, setCPassShow] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [message, setMessage] = useState('');

  const sendPassword = async (values, { setSubmitting, resetForm }) => {
    try {
      const res = await axios.post(
        `http://localhost:8009/${id}/${token}`,
        { password: values.password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.status === 201) {
        setMessage('Password successfully updated');
        toast.success('Password updated successfully!', {
          position: 'top-center',
        });

        const delayPromise = await new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 1500); 
        });

        if (delayPromise) {
          resetForm();
          navigate('/');
        }
      } else {
        toast.error('Token expired, generate a new link', {
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);

      if (error.response) {
        const status = error.response.status;
        if (status === 400 || status === 401) {
          toast.error('Token expired or invalid', {
            position: 'top-center',
          });
        } else {
          toast.error('An error occurred while updating the password', {
            position: 'top-center',
          });
        }
      } else if (error.request) {
        toast.error('No response from server', {
          position: 'top-center',
        });
      } else {
        toast.error(`Error: ${error.message}`, {
          position: 'top-center',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setDataReady(true); 
    }, 3000);
  }, []);

  return (
    <>
      {dataReady ? (
        <section>
          <div className="form_data">
            <div className="form_heading">
              <h1>Enter Your New Password</h1>
            </div>

            <Formik
              initialValues={{ password: '', confirmPassword: '' }}
              validationSchema={validationSchema}
              onSubmit={sendPassword}
            >
              {({ isSubmitting }) => (
                <Form>
                  {message && (
                    <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>
                  )}

                  <div className="form_input">
                    <label htmlFor="password">New Password</label>
                    <div className="two">
                      <Field
                        type={!passShow ? 'password' : 'text'}
                        name="password"
                        placeholder="Enter your new password"
                      />
                      <div
                        className="showpass"
                        onClick={() => setPassShow(!passShow)}
                      >
                        <FontAwesomeIcon icon={passShow ? faEyeSlash : faEye} />
                      </div>
                    </div>
                    <ErrorMessage name="password" component="div" className="error" />
                  </div>

                  <div className="form_input">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="two">
                      <Field
                        type={!cpassShow ? 'password' : 'text'}
                        name="confirmPassword"
                        placeholder="Re-enter your new password"
                      />
                      <div
                        className="showpass"
                        onClick={() => setCPassShow(!cpassShow)}
                      >
                        <FontAwesomeIcon icon={cpassShow ? faEyeSlash : faEye} />
                      </div>
                    </div>
                    <ErrorMessage name="confirmPassword" component="div" className="error" />
                  </div>

                  <button className="btn" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send'}
                  </button>
                </Form>
              )}
            </Formik>

            <ToastContainer />
          </div>
        </section>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          Loading... &nbsp;
          <CircularProgress />
        </Box>
      )}
    </>
  );
};

export default ForgotPassword;

