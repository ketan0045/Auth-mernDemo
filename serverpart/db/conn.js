const mongoose = require("mongoose");

const DB =
  "mongodb+srv://ketan:ketan0902@cluster0.o69bvjv.mongodb.net/authusers?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(DB, {
    // useUnifiedTopology: true,
    // useNewUrlParser: true
  })
  .then(() => console.log("DataBase Connected --"))
  .catch((errr) => {
    console.log(errr, "not connected in db (conn.js)");
  });



