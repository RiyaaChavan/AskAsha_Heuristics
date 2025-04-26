// Import required dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Main chat endpoint
app.post('/chat', (req, res) => {
  const { message, userId } = req.body;
  
  // Log the incoming request
  console.log(`Received message from user ${userId}: ${message}`);
  
  let response;
  
  // Check message content and return appropriate response
  if (message.toLowerCase().includes('/job') || message.toLowerCase().includes('job')) {
    // Return a response with job search canvas
    response = {
      text: "I found some job listings that might interest you. Check them out in the panel.",
      canvasType: "job_search",
      canvasUtils: {
        job_link: "https://example.com/jobs",
        job_api: "15"
      }
    };
  } else {
    // Return a normal text response
    response = {
      text: `You said: "${message}". This is a normal response without any special canvas.`,
      canvasType: "none"
    };
  }
  
  // Add a short delay to simulate processing (optional)
  setTimeout(() => {
    res.json(response);
  }, 500);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});