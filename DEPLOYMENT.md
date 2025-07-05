# 🚀 Deployment Guide - Glow Beauty Clinic

## Quick Deploy Options

### 1. **Vercel (Recommended - Free)**
**Fastest deployment with automatic HTTPS**

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `EMAIL_USER` and `EMAIL_PASS`

### 2. **Render (Free Tier)**
**Simple cloud deployment**

1. **Connect GitHub:**
   - Go to [render.com](https://render.com)
   - Connect your GitHub account
   - Import this repository

2. **Configure:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables in dashboard

### 3. **Heroku (Paid)**
**Traditional cloud platform**

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Deploy:**
   ```bash
   heroku create your-app-name
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

3. **Set Environment Variables:**
   ```bash
   heroku config:set EMAIL_USER=your-email@gmail.com
   heroku config:set EMAIL_PASS=your-app-password
   ```

### 4. **Railway (Free Tier)**
**Modern deployment platform**

1. **Connect Repository:**
   - Go to [railway.app](https://railway.app)
   - Connect GitHub
   - Deploy from repository

2. **Add Environment Variables:**
   - EMAIL_USER
   - EMAIL_PASS

## Environment Variables Required

Set these in your hosting platform's dashboard:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
PORT=3000 (or platform default)
```

## Gmail Setup for Production

1. **Enable 2-Factor Authentication**
2. **Generate App Password:**
   - Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
3. **Use the generated password** in EMAIL_PASS

## Post-Deployment

1. **Test the API:**
   ```
   https://your-domain.com/api/health
   ```

2. **Test Booking Form:**
   - Visit your deployed site
   - Fill out booking form
   - Check admin email (dhruvahir4259@gmail.com)

3. **Monitor Logs:**
   - Check hosting platform's log section
   - Monitor for any email sending errors

## Custom Domain (Optional)

1. **Vercel:** Settings → Domains → Add domain
2. **Render:** Settings → Custom Domains
3. **Heroku:** Settings → Domains → Add domain

## Troubleshooting

### Email Not Sending
- Check environment variables are set correctly
- Verify Gmail app password is correct
- Check hosting platform's log for errors

### Server Not Starting
- Ensure all dependencies are in package.json
- Check PORT environment variable
- Verify Node.js version compatibility

### CORS Issues
- The server includes CORS middleware
- If issues persist, check hosting platform's CORS settings

## Support

- **Vercel:** Excellent documentation and support
- **Render:** Good free tier, easy setup
- **Heroku:** Traditional but reliable
- **Railway:** Modern alternative to Heroku

Choose Vercel for the easiest deployment experience! 