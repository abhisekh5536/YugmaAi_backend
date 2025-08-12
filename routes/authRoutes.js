import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

// Register
router.post("/register", async(req, res) => {
    const{username, email, password} = req.body;
    const hashed = await bcrypt.hash(password,10);
    const user = await User.create({
        username,
        email,
        password:hashed
    });
    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET,{expiresIn:"7d"});
    res.json({token});
})

//login
router.post("/login", async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(404).json({message: "User not found"});

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({message:"Wrong password"});

    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET,{expiresIn:"7d"})
    res.status(200).json({token});

});

router.get("/me", protect, async (req, res) => {
  try {
    // req.user contains the ID from JWT
    const user = await User.findById(req.user).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;