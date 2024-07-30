const jwt = require("jsonwebtoken");
const userdb = require("../models/userSchema");
const keysecret = "qwertyuioplkjhgfdsazxcvbnmmnbvcx";

const authenticate = async (req, res, next) => {
  try {
    // console.log(req.token,"reqqqq.token"); 
    const token = req.headers.authorization;
    const verifytoken = jwt.verify(token,keysecret);

    const rootUser = await userdb.findOne({_id:verifytoken._id});

    if(!rootUser) {throw new Error("user not found")}

    req.token = token
    req.rootUser = rootUser
    req.userId = rootUser._id

    next();

  } catch (error) {
    console.log("114");
    res.status(401).json({status:401,message:"Unauthorized no token provide"})
  }
};

module.exports = authenticate; 



   









