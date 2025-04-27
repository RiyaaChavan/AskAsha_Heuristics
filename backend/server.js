// server.js or api/index.js
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const dotenv = require('dotenv');
const { json } = require('stream/consumers');

dotenv.config();

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173' // Your frontend URL
}));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

// Update your MongoDB connection with error handling
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Handle connection error appropriately
  });


// Add a general connection error handler
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error after initial connection:', err);
});


// Create user schema and model
// Update the user schema to include skills
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  locationPreference: String,
  resumeUrl: String,
  gender: String,
  education: { type: String },
  professionalStage: { type: String },
  skills: [String], // Add this line to store skills as an array
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);


// Set up GridFS storage for file uploads
const storage = new GridFsStorage({
  url: MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});


const upload = multer({ storage });


// API Endpoints
app.post('/api/upload-resume', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
 
  // Return the file URL that can be used to access the file
  const fileUrl = `/api/files/${req.file.filename}`;
  res.json({ fileUrl });
});


// Update your backend server.js file to add more debugging:


app.post('/api/onboarding', async (req, res) => {
  try {
    console.log('Received user data:', req.body);
   
    // Check for required fields manually
    const requiredFields = ['name', 'email', 'phone', 'location'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }
   
    const userData = req.body;
   
    // Ensure consistent field names
    if (userData.resumeURL && !userData.resumeUrl) {
      userData.resumeUrl = userData.resumeURL;
      delete userData.resumeURL;
    }
   
    const newUser = new User(userData);
   
    // Validate before saving to catch schema errors
    const validationError = newUser.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: validationError.message
      });
    }
   
    await newUser.save();
   
    res.status(201).json({
      success: true,
      message: 'User data saved successfully',
      userId: newUser._id
    });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving user data',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


// Endpoint to serve files from GridFS
app.get('/api/files/:filename', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads'
    });

    const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
   
    downloadStream.on('error', function(err) {
      return res.status(404).json({ message: "File not found" });
    });
   
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error streaming file:', error);
    res.status(500).json({ message: 'Error retrieving file' });
  }
});

// GET a user's profile by their ID
app.get('/api/profile/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
