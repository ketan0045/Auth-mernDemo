const userdb = require("../models/userSchema");
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const keysecret = "qwertyuioplkjhgfdsazxcvbnmmnbvcx";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ketan.k@tridhyatech.com",
    pass : "dqhe vlra zgsg fbps",
  },
});

exports.registerUser = async (req, res) => {

  const { fname, email, password, cpassword } = req.body;

  if (!fname || !email || !password || !cpassword) {
    res.status(422).json({ error: "fill all the details" });
  }

  try {
    const preuser = await userdb.findOne({ email: email });
    // findOne({ email(database valo): email(user valo) });
    // console.log(preuser, "preuser");

    if (preuser) {
      res.status(400).json({ error: "This Email is Already Exist" });
    } else if (password !== cpassword) {
      res
        .status(422)
        .json({ error: "Password and Confirm Password Not Match" });
    } else {
      const finalUser = new userdb({fname, email,password,cpassword});

      // here password hasing

      const storeData = await finalUser.save();

      console.log(storeData, "storeData");
      res.status(201).json({ status: 201, storeData });
    }
  } catch (error) {
    res.status(422).json(error);
    console.log("catch block error");
  }
};

exports.loginUser = async (req, res) => {
  // console.log(req.body,"login reqest body")

  const { email, password } = req.body;

  if (!email || !password) {
    res.status(422).json({ error: "fill all the details" });
  }

  try {
    const userValid = await userdb.findOne({ email: email });
    if (!userValid) {
      res.status(404).json({ error: "User not registered. Please sign up." });
    }

    if (userValid) {
      const isMatch = await bcrypt.compare(password, userValid.password);

      if (!isMatch) {
        res.status(422).json({ error: "invalid details" });
      } else {
        // token generate maate
        const token = await userValid.generateAuthtoken();
        // console.log(userValid,"userValid=====26",token, "tokentokentoken--router======26");

        //cookiegenerate mate
        res.cookie("usercookie", token, {
          expires: new Date(Date.now() + 9000000),
          // expires: new Date(Date.now() + 9000000), in case no and refresh then token clean
          httpOnly: true,
          // secure:true  when secure https then use 
        });

        const result = {
          userValid,
          token,
        };
        res.status(201).json({ status: 201, result });
      }
    }
  } catch (error) {
    res.status(401).json(error);
    console.log("catch block 11");
  }
};

exports.validUser = async (req, res) => {
  try {
    const ValidUserOne = await userdb.findOne({ _id: req.userId });
    res.status(201).json({ status: 201, ValidUserOne });
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
};

exports.forgotpassword = async (req, res) => {
  console.log(req.body);

  const { email } = req.body;

  if (!email) {
    res.status(401).json({ status: 401, message: "Enter Your Email" });
  }

  try {
    const userfind = await userdb.findOne({ email: email });

    // token generate for reset password
    const token = jwt.sign({ _id: userfind._id }, keysecret, {
      expiresIn: "1d",
    });

    const setusertoken = await userdb.findByIdAndUpdate(
      { _id: userfind._id },
      { verifytoken: token },
      { new: true }
    );
 
    if (setusertoken) {
      const mailOptions = {
        from: "ketan.k@tridhyatech.com",
        to: email,
        subject: "Password Reset Request",
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
                .email-content p {
                  margin: 0 0 10px 0;
                }
                .reset-link {
                  display: inline-block;
                  padding: 10px 20px;
                  color: white;
                  background-color: #007BFF;
                  text-decoration: none;
                  border-radius: 5px;
                  margin-top: 20px;
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
                <h1>Password Reset Request</h1>
              </div>
              <div class="email-content">
                <p>Hello,</p>
                <p>We received a request to reset the password for your account. If you didn't request a password reset, you can ignore this email.</p>
                <p>If you did request a password reset, please use the link below. This link is valid for 2 minutes.</p>
                <a class="reset-link" href="http://localhost:3000/forgotpassword/${userfind.id}/${setusertoken.verifytoken}">Reset Your Password</a>
              </div>
              <div class="email-footer">
                <p>If you have any questions or need further assistance, contact us at <a href="mailto:support@example.com">support@example.com</a>.</p>
                <p>Follow us on <a href="https://www.facebook.com">Facebook</a> and <a href="https://www.twitter.com">Twitter</a>.</p>
              </div>
            </body>
          </html>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("error", error);
          res.status(401).json({ status: 401, message: "email not send" });
        } else {
          console.log("Email sent", info.response);
          res
            .status(201)
            .json({ status: 201, message: "Email sent Succesfully" });
        }
      });
    }
  } catch (error) {
    res.status(401).json({ status: 401, message: "invalid user" });
  }
};

exports.resetPassword = async (req, res) => {
  const { id, token } = req.params;

  try {
    const validuser = await userdb.findOne({ _id: id, verifytoken: token });

    const verifyToken = jwt.verify(token, keysecret);

    if (validuser && verifyToken._id) {


      res.status(201).json({ status: 201, validuser });
    } else {
      res.status(401).json({ status: 401, message: "user not exist" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
};


exports.changePassword = async (req, res) => {
  const { id, token } = req.params;

  const { password } = req.body;


  try {
    // Verify the JWT token
    const verifyToken = jwt.verify(token, keysecret);

    // Find the user by ID and check if the verifytoken matches
    const validuser = await userdb.findOne({ _id: id, verifytoken: token });

    if (validuser && verifyToken._id) {
      // Hash the new password
      const newpassword = await bcrypt.hash(password, 12);

      // Update the user's password and invalidate the token
      const updatedUser = await userdb.findByIdAndUpdate(
        id,
        {
          password: newpassword,
          verifytoken: null, // Invalidate the token
        },
        { new: true } // Return the updated document
      );

      // Check if the update was successful
      if (updatedUser) {
        res.status(201).json({
          status: 201,
          message: 'Password changed successfully',
          user: updatedUser,
        });
      } else {
        res.status(500).json({
          status: 500,
          message: 'Failed to update password',
        });
      }
    } else {
      res.status(401).json({
        status: 401,
        message: 'Invalid token or user not found',
        // message: 'Invalid token or user not found', aaaa 
      });
    }
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      status: 500,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
