const express = require("express");
const app = express();
const router = require("./routes/router");
const cors = require("cors");
const cookiParser = require("cookie-parser");
const port =  process.env.PORT || 8009;

require("./db/conn");

app.get("/", (req, res) => {
  res.status(201).json("server created ");
});

app.use(express.json());
app.use(cookiParser());
// app.use(cors());

// app.use(
//   "*",
//   cors({
//     origin: true,
//     credentials: true, 
//   })
// );
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, 
  })
);
app.use(router);

app.listen(port, () => {
  console.log(`server start at port no : ${port}`);
});
