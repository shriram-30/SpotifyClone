// idhu vandhu user oda authentication ah paathuku like crt ah user creation, login and register pathi paathuku 

import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

//user register panna inga varu

export const registerUser = async (req, res) => {
  try {
    // Frontend sends { name, email, password }
    const { name, email, password } = req.body;
    const username = name; // map to model field

    if (!username || !email || !password)
      return res.status(400).json({ message: 'Missing required fields' });

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ username, email, password });
    return res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      return res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    }
    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};