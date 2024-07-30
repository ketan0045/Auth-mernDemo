const userdb = require("../models/userSchema");

exports.getUserProfile = async (req, res) => {
  const { id } = req.params;
  try {
    let user = await userdb.findById(id);
    res.status(200).json({ message: "User fetch successfully", user: user });
  } catch (error) {
    res.status(500).json({ error: "Error fetch user" });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.params.id;
  const { name, email } = req.body;

  try {
    const updatedUser = await userdb.findByIdAndUpdate(
      userId,
      {
        $set: {
          fname: name, 
          email: email,
        },
      },
      {
        new: true, 
        runValidators: true, 
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the profile" });
  }
};
