const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    emails: {
      type: [String],
      // validate: [arrayLimit, "Exceeds the limit of 5"],
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);

// function arrayLimit(val) {
//   return val.length <= 5;
// }

module.exports = mongoose.model("Event", EventSchema);
