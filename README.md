# Glow Beauty Clinic - Backend System

A complete backend system for the Glow Beauty Clinic website that handles appointment bookings and sends email notifications to the admin.

## Features

- **Appointment Booking API**: Handles form submissions from the website
- **Email Notifications**: Sends booking details to admin email (dhruvahir4259@gmail.com)
- **Client Confirmation**: Sends confirmation emails to clients
- **Form Validation**: Validates all required fields
- **CORS Support**: Allows cross-origin requests
- **Health Check Endpoint**: Monitor backend status

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Gmail account for sending emails

## Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `env.example` to `.env`
   - Update the email credentials:
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-password
   PORT=3000
   ```

## Gmail Setup for Email

To use Gmail for sending emails, you need to:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in your `.env` file

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### POST `/api/book-appointment`
Handles appointment booking submissions.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "service": "Facial Treatment",
  "date": "2025-01-15",
  "time": "10:00",
  "notes": "Additional notes here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment request submitted successfully. We will contact you shortly to confirm."
}
```

### GET `/api/health`
Health check endpoint to verify the server is running.

**Response:**
```json
{
  "success": true,
  "message": "Glow Beauty Clinic Backend is running",
  "timestamp": "2025-01-15T10:00:00.000Z"
}
```

## Email Notifications

### Admin Email
When a booking is submitted, an email is sent to `dhruvahir4259@gmail.com` with:
- Client information (name, email, phone)
- Appointment details (service, date, time)
- Additional notes (if provided)

### Client Confirmation Email
A confirmation email is sent to the client with:
- Appointment request details
- Contact information
- Next steps

## File Structure

```
cline/
├── app.html              # Main website file
├── server.js             # Express server
├── package.json          # Dependencies and scripts
├── env.example           # Environment variables template
└── README.md            # This file
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EMAIL_USER` | Gmail address for sending emails | `your-email@gmail.com` |
| `EMAIL_PASS` | Gmail app password | `your-app-password` |
| `PORT` | Server port | `3000` |

### Admin Email
The admin email address is hardcoded in `server.js`:
```javascript
const ADMIN_EMAIL = 'dhruvahir4259@gmail.com';
```

## Troubleshooting

### Email Not Sending
1. Check your Gmail credentials in `.env`
2. Ensure 2-Factor Authentication is enabled
3. Verify the app password is correct
4. Check Gmail's "Less secure app access" settings

### Server Not Starting
1. Check if port 3000 is available
2. Verify all dependencies are installed
3. Check the console for error messages

### Form Submission Issues
1. Ensure the server is running
2. Check browser console for network errors
3. Verify the API endpoint is accessible

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables for sensitive data
- Consider implementing rate limiting for production
- Add input sanitization for production use

## Production Deployment

For production deployment:

1. Set up a production environment
2. Use a proper email service (SendGrid, AWS SES, etc.)
3. Add SSL/TLS certificates
4. Implement proper logging
5. Set up monitoring and error tracking
6. Add rate limiting and security headers

## Support

For issues or questions, please check:
1. The console logs for error messages
2. The network tab in browser dev tools
3. The server logs for backend errors

## License

MIT License - feel free to use and modify as needed.

# Development mode (with auto-restart)
npm run dev

# Production mode
npm start

# Test the API
npm test 