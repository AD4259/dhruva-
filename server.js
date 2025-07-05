import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting (simple in-memory store)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // Max 5 requests per window

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('.'));

// Input sanitization function
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation function
function isValidPhone(phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Rate limiting middleware
function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    const userData = requestCounts.get(ip);
    if (now > userData.resetTime) {
      userData.count = 1;
      userData.resetTime = now + RATE_LIMIT_WINDOW;
    } else {
      userData.count++;
    }
    
    if (userData.count > MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }
  }
  next();
}

// Email configuration with error handling
let transporter;
try {
  transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    secure: true,
    port: 465
  });
} catch (error) {
  console.error('Failed to create email transporter:', error);
}

// Admin email address
const ADMIN_EMAIL = 'dhruvahir4259@gmail.com';

// Booking endpoint with comprehensive validation
app.post('/api/book-appointment', rateLimit, async (req, res) => {
  try {
    // Validate transporter
    if (!transporter) {
      return res.status(500).json({
        success: false,
        message: 'Email service is not configured. Please contact support.'
      });
    }

    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: 'Email configuration is missing. Please contact support.'
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      service,
      date,
      time,
      notes
    } = req.body;

    // Sanitize all inputs
    const sanitizedData = {
      firstName: sanitizeInput(firstName),
      lastName: sanitizeInput(lastName),
      email: sanitizeInput(email).toLowerCase(),
      phone: sanitizeInput(phone),
      service: sanitizeInput(service),
      date: sanitizeInput(date),
      time: sanitizeInput(time),
      notes: sanitizeInput(notes)
    };

    // Comprehensive validation
    if (!sanitizedData.firstName || !sanitizedData.lastName || !sanitizedData.email || 
        !sanitizedData.phone || !sanitizedData.service || !sanitizedData.date || !sanitizedData.time) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Validate email format
    if (!isValidEmail(sanitizedData.email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Validate phone format
    if (!isValidPhone(sanitizedData.phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number'
      });
    }

    // Validate date (must be future date)
    const selectedDate = new Date(sanitizedData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Please select a future date for your appointment'
      });
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(sanitizedData.time)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid time'
      });
    }

    // Create email content with proper escaping
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f8b4d9; text-align: center;">New Appointment Booking</h2>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Client Information</h3>
          <p><strong>Name:</strong> ${sanitizedData.firstName} ${sanitizedData.lastName}</p>
          <p><strong>Email:</strong> ${sanitizedData.email}</p>
          <p><strong>Phone:</strong> ${sanitizedData.phone}</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Appointment Details</h3>
          <p><strong>Service:</strong> ${sanitizedData.service}</p>
          <p><strong>Date:</strong> ${sanitizedData.date}</p>
          <p><strong>Time:</strong> ${sanitizedData.time}</p>
          ${sanitizedData.notes ? `<p><strong>Additional Notes:</strong> ${sanitizedData.notes}</p>` : ''}
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">
            This booking was submitted from the Glow Beauty Clinic website.
          </p>
        </div>
      </div>
    `;

    // Email options for admin
    const mailOptions = {
      from: `"Glow Beauty Clinic" <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `New Appointment Booking - ${sanitizedData.firstName} ${sanitizedData.lastName}`,
      html: emailContent,
      replyTo: sanitizedData.email
    };

    // Send email to admin
    await transporter.sendMail(mailOptions);

    // Send confirmation email to client
    const clientEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f8b4d9; text-align: center;">Appointment Request Received</h2>
        
        <p>Dear ${sanitizedData.firstName} ${sanitizedData.lastName},</p>
        
        <p>Thank you for booking an appointment with Glow Beauty Clinic. We have received your request for the following service:</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Service:</strong> ${sanitizedData.service}</p>
          <p><strong>Date:</strong> ${sanitizedData.date}</p>
          <p><strong>Time:</strong> ${sanitizedData.time}</p>
        </div>
        
        <p>Our team will review your booking and contact you within 24 hours to confirm your appointment.</p>
        
        <p>If you have any questions, please don't hesitate to contact us at +1 (234) 567-890 or appointments@glowbeauty.com</p>
        
        <p>Best regards,<br>The Glow Beauty Clinic Team</p>
      </div>
    `;

    const clientMailOptions = {
      from: `"Glow Beauty Clinic" <${process.env.EMAIL_USER}>`,
      to: sanitizedData.email,
      subject: 'Appointment Request Confirmation - Glow Beauty Clinic',
      html: clientEmailContent
    };

    // Send confirmation email to client
    await transporter.sendMail(clientMailOptions);

    // Log successful booking
    console.log(`Booking received: ${sanitizedData.firstName} ${sanitizedData.lastName} - ${sanitizedData.service} on ${sanitizedData.date}`);

    res.json({
      success: true,
      message: 'Appointment request submitted successfully. We will contact you shortly to confirm.'
    });

  } catch (error) {
    console.error('Error processing booking:', error);
    
    // Don't expose internal errors to client
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request. Please try again later.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const health = {
    success: true,
    message: 'Glow Beauty Clinic Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
  };
  
  res.json(health);
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/app.html');
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📧 Admin email: ${ADMIN_EMAIL}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
}); 