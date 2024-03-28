// Import the necessary modules
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// You need to replace this with your actual config that contains 'jwtSecret'
const config = require("../config/default.json");

const auth = require("../middleware/auth");
const User = require("../models/User");

/**
 * @route   GET api/auth
 * @desc    Get user data by token (Protected route)
 * @access  Private
 */
router.get("/", auth, async (req, res) => {
  try {
    // Select user data without the password
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @route   POST api/auth/login
 * @desc    Authenticate user and get token (login)
 * @access  Public
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      // If user doesn't exist, send an error response
      return res.status(400).send("Invalid credentials");
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }

    // Create token payload
    const payload = {
      user: {
        id: user._id, // The user's ID from database
        email: user.email,
      },
    };
    console.log(payload);
    // Sign the token
    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: "3 days" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    res.status(500).send("Server error");
  }
});

/**
 * @route   POST api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).send("User already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new User({
      email,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();

    res.status(201).json({ message: "Successfully registered" });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

/**
 * @route   GET api/auth/me
 * @desc    Get current logged-in user profile
 * @access  Private
 */
router.get("/me", auth, async (req, res) => {
  try {
    // Find user by their ID
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Export the router
module.exports = router;
