const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
const User = require("../models/User");

exports.authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    console.log("used not authenticated");
    return res.status(401).json({ message: "Not authenticated" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("used is authenticated");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
exports.handleSignUp = async (req, res) => {
    try {
        const { email, password,name } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });
        console.log(name,"used logged in successfully");
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};

exports.handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password,user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }
    console.log("user credentials are correct");
    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15d"
      }
    );
    console.log("token generated");
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    }); 
    
    console.log("cookie send to browser");
    res.json({
      'message': "Login successful"
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};




