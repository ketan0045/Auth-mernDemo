const express = require("express");
const router = new express.Router();
const authenticate = require("../middleware/authenticate");
const {registerUser,loginUser,validUser,forgotpassword,changePassword,resetPassword} = require("../controller/authController");
const {getUserProfile, updateProfile} = require("../controller/userController");
const {addEvent,getEvent,getEventById,deleteEvent} = require("../controller/calenderController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/validuser", authenticate, validUser);
// send email Link For reset Password
router.post("/sendpasswordlink", forgotpassword);
// verify user for forgot password time
router.get("/forgotpassword/:id/:token", resetPassword);
// change password
router.post("/:id/:token", changePassword);
router.post("/events", addEvent);
router.get("/events", getEvent);
router.put("/events/:id", getEventById);
router.delete("/events/:id", deleteEvent);
router.get("/viewProfile/:id", getUserProfile);
router.put("/updateProfile/:id", authenticate, updateProfile);

module.exports = router; 
