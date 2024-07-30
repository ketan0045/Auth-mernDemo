import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../ContextProvider/Context";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { TextField } from "formik-material-ui";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Input from "@mui/material/Input";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const today = new Date();
today.setHours(0, 0, 0, 0);

const eventSchema = Yup.object().shape({
  eventTitle: Yup.string()
    .trim()
    .required("Event title is required.")
    .max(40, "Event title must be 40 characters or fewer."),
  eventDescription: Yup.string()
    .required("Event description is required.")
    .max(100, "Event description must be 100 characters or fewer."),
  startDate: Yup.date()
    .required("Start date is required.")
    .min(today, "Start date cannot be in the past."),
  endDate: Yup.date()
    .required("End date is required.")
    .min(
      Yup.ref("startDate"),
      "End date must be later than or equal to the start date."
    ),
});

const localizer = momentLocalizer(moment);

const Dashboard = () => {
  const navigate = useNavigate();

  const { setLoginData } = useContext(LoginContext);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailChips, setEmailChips] = useState([]);

  const data = localStorage.getItem("usersdatatoken");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:8009/events");
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsDataLoaded(true);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (!data) {
      navigate("/");
    }
  }, [data]);

  const getCurrentDateTime = () => moment().format("YYYY-MM-DDTHH:mm");
  const minDateTime = moment().format("YYYY-MM-DDTHH:mm");

  const handleSelectSlot = () => {
    // specif box date click at start time
    setShowModal(true);
    setSelectedEvent(null);
    setEmailChips([]);
    setEmailInput("");
    setIsEditMode(true);
  };

  const handleSelectedEvent = (event) => {
    //  event edit (event means all object)
    setShowModal(true);
    setSelectedEvent(event);
    setEmailChips(event.emails || []);
    setEmailInput("");
    setIsEditMode(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setIsEditMode(false);
  };

  const saveEvent = async (values, { setSubmitting, resetForm }) => {
    console.log(values, "values=====");
    const newEvent = {
      _id: selectedEvent ? selectedEvent._id : null,
      title: values.eventTitle,
      description: values.eventDescription,
      startDate: moment(values.startDate).toDate(),
      endDate: moment(values.endDate).toDate(),
      emails: emailChips,
    };
    console.log(newEvent, "newEvent=====");

    try {
      if (selectedEvent) {
        const response = await axios.put(
          `http://localhost:8009/events/${newEvent._id}`,
          newEvent
        );
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event._id === selectedEvent._id ? response.data : event
          )
        );
      } else {
        const response = await axios.post(
          "http://localhost:8009/events",
          newEvent
        );
        setEvents([...events, response.data]);
      }

      resetForm();
      setShowModal(false);
      toast.success("Event saved successfully!");
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("An event with the same date and time already exists.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEvent = async (deleteid) => {
    try {
      await axios.delete(`http://localhost:8009/events/${deleteid._id}`);
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== deleteid._id)
      );
      setShowModal(false);
      toast.success("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event.");
    }
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };

  const isValidEmail = (email) => {
    const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const excludedDomains = ["yopmail.com", "gmail.com"];
    if (!basicEmailRegex.test(email)) {
      return false;
    }
    const domain = email.split("@")[1];
    if (excludedDomains.includes(domain)) {
      return false;
    }
    return true;
  };

  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim();

    if (trimmedEmail) {
      // if (trimmedEmail && isValidEmail(trimmedEmail)) (remove near ff ,code jj){
      if (!emailChips.includes(trimmedEmail)) {
        setEmailChips([...emailChips, trimmedEmail]);
        setEmailInput("");
      } else {
        toast.warning("Email is already added.");
      }
    } else {
      toast.warning("Invalid email format.");
    }
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmailChips(emailChips.filter((email) => email !== emailToRemove));
  };

  const DashboardValid = async () => {
    const token = localStorage.getItem("usersdatatoken");

    try {
      const response = await axios.get("http://localhost:8009/validuser", {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      if (response.data.status === 401) {
        navigate("/");
        localStorage.clear();
      } else {
        setLoginData(response.data);
        navigate("/dashboard");
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        navigate("/");
        localStorage.clear();
      }
      console.error("Error validating dashboard:", error?.response);
    }
  };

  useEffect(() => {
    DashboardValid();
  }, []);

  if (!isDataLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
        &nbsp;Loading...
      </Box>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      ></div>
      <hr />
      <div style={{ height: "675px", margin: "15px 30px" }}>
        <Button
          variant="contained"
          style={{ marginLeft: "81.5%", marginBottom: "5px" }}
          onClick={handleSelectSlot}
        >
          Add Meeting
        </Button>
        <Calendar
          localizer={localizer}
          events={events.map((item) => ({
            ...item,
            start: new Date(item.startDate),
            end: new Date(item.endDate),
          }))}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectedEvent}
        />
        <Modal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedEvent(null);
            setIsEditMode(false);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              bgcolor: "background.paper",
              padding: 4,
              borderRadius: 2,
              width: 500,
            }}
          >
            {isEditMode ? (
              <Formik
                initialValues={{
                  eventTitle: selectedEvent ? selectedEvent.title : "",
                  eventDescription: selectedEvent
                    ? selectedEvent.description
                    : "",
                  startDate: selectedEvent
                    ? moment(selectedEvent.startDate).format("YYYY-MM-DDTHH:mm")
                    : getCurrentDateTime(),
                  endDate: selectedEvent
                    ? moment(selectedEvent.endDate).format("YYYY-MM-DDTHH:mm")
                    : "",
                }}
                validationSchema={eventSchema}
                onSubmit={saveEvent}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <Box mb={2}>
                      <Field
                        component={TextField}
                        type="text"
                        label="Event Title"
                        name="eventTitle"
                        fullWidth
                        onKeyDown={(event) => {
                          if (
                            event.key === " " &&
                            event.target.selectionStart === 0
                          ) {
                            event.preventDefault();
                          }
                        }}
                      />
                    </Box>

                    <Box mb={2}>
                      <Field
                        component={TextField}
                        type="text"
                        label="Event Description"
                        name="eventDescription"
                        fullWidth
                        multiline
                        rows={4}
                        onKeyDown={(event) => {
                          if (
                            event.key === " " &&
                            event.target.selectionStart === 0
                          ) {
                            event.preventDefault();
                          }
                        }}
                      />
                    </Box>

                    <Box mb={2}>
                      <Field
                        component={TextField}
                        type="datetime-local"
                        label="Start Date and Time"
                        name="startDate"
                        fullWidth
                        InputProps={{
                          inputProps: {
                            min: minDateTime,
                          },
                        }}
                      />
                    </Box>
                    <Box mb={2}>
                      <Field
                        component={TextField}
                        type="datetime-local"
                        label="End Date and Time"
                        name="endDate"
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          inputProps: {
                            min: minDateTime,
                          },
                        }}
                      />
                    </Box>

                    <Box mb={2}>
                      <div>
                        {emailChips.map((email, index) => (
                          <Chip
                            key={index}
                            label={email}
                            onDelete={() => handleRemoveEmail(email)}
                            sx={{ marginRight: 1 }}
                          />
                        ))}
                      </div>
                      <Input
                        placeholder="Add Email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddEmail();
                          }
                        }}
                        sx={{ marginTop: 1, width: "100%" }}
                      />
                      <Button
                        onClick={handleAddEmail}
                        variant="contained"
                        sx={{ marginTop: 1 }}
                      >
                        Add Email
                      </Button>
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                      {selectedEvent && (
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => deleteEvent(selectedEvent)}
                        >
                          Delete Event
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        onClick={closeModal}
                        style={{ marginLeft: "65%", backgroundColor: "red" }}
                      >
                        Close
                      </Button>
                    </Box>
                  </Form>
                )}
              </Formik>
            ) : (
              <>
                <h3>{selectedEvent?.title}</h3>
                <p>
                  <strong>Description:</strong> {selectedEvent?.description}
                </p>
                <p>
                  <strong>Start Date:</strong>
                  {moment(selectedEvent?.startDate).format(
                    "MMMM Do YYYY, h:mm a"
                  )}
                </p>
                <p>
                  <strong>End Date:</strong>{" "}
                  {moment(selectedEvent?.endDate).format(
                    "MMMM Do YYYY, h:mm a"
                  )}
                </p>
                <div>
                  {emailChips.map((email, index) => (
                    <Chip key={index} label={email} sx={{ marginRight: 1 }} />
                  ))}
                </div>
                <Box display="flex" justifyContent="space-between">
                  <Button variant="contained" onClick={toggleEditMode}>
                    Edit
                  </Button>
                  {selectedEvent && (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => deleteEvent(selectedEvent)}
                    >
                      Delete Event
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>
        <ToastContainer />
      </div>
    </>
  );
};

export default Dashboard;
