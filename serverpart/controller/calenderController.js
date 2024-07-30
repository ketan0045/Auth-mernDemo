const nodemailer = require("nodemailer");
const Event = require("../models/eventSchema");
const moment = require("moment");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ketan.k@tridhyatech.com",
    pass : "dqhe vlra zgsg fbps",
  },
});

exports.addEvent = async (req, res) => {
  try {
    const { title, startDate, endDate, description, emails } = req.body;

    // Check for events with overlapping dates and times
    const conflictingEvent = await Event.findOne({
      $or: [
        { startDate: { $gte: startDate, $lt: endDate } },
        { endDate: { $gt: startDate, $lte: endDate } },
        {
          $and: [
            { startDate: { $lte: startDate } },
            { endDate: { $gte: endDate } },
          ],
        },
      ],
    });


    if (conflictingEvent) {
      return res.status(400).json({
        error: `An event with the same date and time already exists: ${conflictingEvent.title}`,
      });
    }

    const newEvent = new Event({
      title,
      startDate,
      endDate,
      description,
      emails,
    });

    await newEvent.save();

    // Format start and end dates using moment.js
    const formattedStartDate = moment(startDate).format("MMMM Do YYYY, h:mm a");
    const formattedEndDate = moment(endDate).format("MMMM Do YYYY, h:mm a");

    const mailOptions = {
      from: "ketan.k@tridhyatech.com",
      subject: "Invitation: Upcoming Event",
      html: `
        <html>
          <head>
            <style>
              .email-header {
                background-color: #f3f3f3;
                text-align: center;
                padding: 20px;
              }
              .email-content {
                padding: 20px;
                font-family: Arial, sans-serif;
                color: #333;
              }
              .email-footer {
                text-align: center;
                color: #999;
                padding: 10px;
                font-size: 12px;
              }
              .email-footer a {
                color: #0066cc;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="email-header">
              <h1>You're Invited!</h1>
            </div>
            <div class="email-content">
              <h2>${title}</h2>
              <p><strong>Description:</strong> ${description}</p>
              <p>
                <strong>Start Date:</strong> ${formattedStartDate}<br>
                <strong>End Date:</strong> ${formattedEndDate}
              </p>
              <p><strong>Details:</strong> We look forward to seeing you at the event. Please mark your calendar!</p>
            </div>
            <div class="email-footer">
              <p>For any questions, contact us at <a href="mailto:support@example.com">support@example.com</a>.</p>
              <p>Follow us on <a href="https://www.facebook.com">Facebook</a> and <a href="https://www.twitter.com">Twitter</a>.</p>
            </div>
          </body>
        </html>
      `,
    };

    if (emails) {
      emails.forEach((email) => {
        mailOptions.to = email;
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error("Error sending email:", err);
          } else {
            console.log("Email sent:", info.response);
          }
        });
      });
    }

    res.status(201).json(newEvent); // Successfully created the event
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(400).json({ error: error.message }); // Return error message
  }
};


exports.getEvent = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Error fetching events" });
  }
};


exports.getEventById = async (req, res) => {
  const { id } = req.params;
  const { title, startDate, endDate, description, emails } = req.body;


  try {
    // Get the existing event to compare the old and new email lists
    const existingEvent = await Event.findById(id);


    if (!existingEvent) {
      return res.status(404).json({ error: "Event not found." });
    }

    // Find the new email addresses by comparing the old and new lists
    const existingEmails = existingEvent.emails || [];
    const newEmails = emails.filter(
      (email) => !existingEmails.includes(email)
    );
  

    // Update the event with the new data
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { title, startDate, endDate, description, emails },
      { new: true }
    );

    // Send email to the newly added addresses
    const formattedStartDate = moment(startDate).format("MMMM Do YYYY, h:mm a");
    const formattedEndDate = moment(endDate).format("MMMM Do YYYY, h:mm a");

    const mailOptions = {
      from: "ketan.k@tridhyatech.com",
      subject: "Updated Event Invitation",
      html: `
        <html>
          <head>
            <style>
              .email-header {
                background-color: #f3f3f3;
                text-align: center;
                padding: 20px;
              }
              .email-content {
                padding: 20px;
                font-family: Arial, sans-serif;
                color: #333;
              }
              .email-footer {
                text-align: center;
                color: #999;
                padding: 10px;
                font-size: 12px;
              }
              .email-footer a {
                color: #0066cc;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="email-header">
              <h1>You're Invited!</h1>
            </div>
            <div class="email-content">
              <h2>${title}</h2>
              <p><strong>Description:</strong> ${description}</p>
              <p>
                <strong>Start Date:</strong> ${formattedStartDate}<br>
                <strong>End Date:</strong> ${formattedEndDate}
              </p>
              <p>
                <strong>Details:</strong> This is an updated invitation to the event.
              </p>
            </div>
            <div class="email-footer">
              <p>For any questions, contact us at <a href="mailto:support@example.com">support@example.com</a>.</p>
              <p>Follow us on <a href="https://www.facebook.com">Facebook</a> and <a href="https://www.twitter.com">Twitter</a>.</p>
            </div>
          </body>
        </html>
      `,
    };

    // Send email only to new addresses
    if (newEmails.length > 0) {
      newEmails.forEach((email) => {
        mailOptions.to = email;
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error("Error sending email:", err);
          } else {
            console.log("Email sent:", info.response);
          }
        });
      });
    }

    res.status(200).json(updatedEvent); // Return the updated event
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(400).json({ error: error.message }); // Handle errors gracefully
  }
};


exports.deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    await Event.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting event" });
  }
};














