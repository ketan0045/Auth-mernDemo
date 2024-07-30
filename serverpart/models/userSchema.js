const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const keysecret = "qwertyuioplkjhgfdsazxcvbnmmnbvcx";

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  cpassword: {
    type: String,
    required: true,
    minlength: 6,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
    verifytoken:{
        type: String,
    }
});

// hash password

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.cpassword = await bcrypt.hash(this.cpassword, 12);

    // this.cpassword = undefined; 
  }
  next();
});

// token generate

userSchema.methods.generateAuthtoken = async function () {

  try {
    let token23 = jwt.sign({ _id: this._id }, keysecret, {
      expiresIn: "15d",
    });
    // console.log(token23, "token23token23token23");

    this.tokens = this.tokens.concat({ token: token23 });
    await this.save();
    return token23;
  } catch (error) {
    res.status(422).json(error);
  }
};

const userdb = mongoose.model("user", userSchema);

module.exports = userdb;




     

        
