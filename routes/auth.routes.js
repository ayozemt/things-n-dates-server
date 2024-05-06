const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");

// ℹ️ Handles password encryption
const jwt = require("jsonwebtoken");

// Require the User model in order to interact with the database
const User = require("../models/User.model");

// Require necessary (isAuthenticated) middleware in order to control access to specific routes
const { isAuthenticated } = require("../middleware/jwt.middleware.js");

// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 10;

// POST /auth/signup  - Creates a new user in the database
router.post("/signup", (req, res, next) => {
  const { email, password, name } = req.body;

  // Check if email or password or name are provided as empty strings
  if (email === "" || password === "" || name === "") {
    res.status(400).json({ message: "Provide email, password and name" });
    return;
  }

  // This regular expression check that the email is of a valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  // This regular expression checks password for special characters and minimum length
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  // Check the users collection if a user with the same email already exists
  User.findOne({ email })
    .then((foundUser) => {
      // If the user with the same email already exists, send an error response
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      // If email is unique, proceed to hash the password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Create the new user in the database
      // We return a pending promise, which allows us to chain another `then`
      return User.create({ email, password: hashedPassword, name });
    })
    .then((createdUser) => {
      // Deconstruct the newly created user object to omit the password
      // We should never expose passwords publicly
      const { email, name, _id } = createdUser;

      // Create a new object that doesn't expose the password
      const user = { email, name, _id };

      // Send a json response containing the user object
      res.status(201).json({ user: user });
    })
    .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
});

// POST  /auth/login - Verifies email and password and returns a JWT
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string
  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // Check the users collection if a user with the same email exists
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: "User not found." });
        return;
      }

      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { _id, email, name } = foundUser;

        // Create an object that will be set as the token payload
        const payload = { _id, email, name };

        // Create a JSON Web Token and sign it
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        // Send the token as the response
        res.status(200).json({ authToken: authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
});

// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and is made available on `req.payload`
  // console.log(`req.payload`, req.payload);

  // Send back the token payload object containing the user data
  res.status(200).json(req.payload);
});

// POST /auth/reset-password/request - Request password reset
router.post("/reset-password/request", (req, res, next) => {
  const { email } = req.body;

  // Find the user by email
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Generate a password reset token
      const token = jwt.sign(
        { userId: user._id },
        process.env.RESET_PASSWORD_SECRET,
        { expiresIn: "1h" }
      );

      // Create a nodemailer transporter
      const transporter = nodemailer.createTransport({
        // Add your email service configuration here
        service: "outlook",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Compose the email message
      const mailOptions = {
        from: `"things-n-dates" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset",
        html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your things-n-dates account.</p>
               <p>Please click on the following link, or paste this into your browser to complete the process:</p>
               <p><a href="${process.env.ORIGIN}/reset-password/${token}">${process.env.ORIGIN}/reset-password/${token}</a></p>
               <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res
            .status(500)
            .json({ message: "Error sending reset password email." });
        } else {
          console.log("Email sent: " + info.response);
          res.status(200).json({
            message: "Email sent with instructions to reset your password.",
          });
        }
      });
    })
    .catch((err) => next(err));
});

// POST /auth/reset-password/:token - Reset password
router.post("/reset-password/:token", (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  // Verify if the token is valid
  jwt.verify(token, process.env.RESET_PASSWORD_SECRET, (err, decodedToken) => {
    if (err) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const { userId } = decodedToken;

    // Find the user by ID
    User.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        // Encrypt the new password
        const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Update user's password
        user.password = hashedPassword;
        return user.save();
      })
      .then(() => {
        res.status(200).json({ message: "Password reset successfully." });
      })
      .catch((err) => next(err));
  });
});

module.exports = router;
