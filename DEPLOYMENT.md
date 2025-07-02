# Deployment Guide - Emergency Responder App

## Database Connection Issues

If you're experiencing authentication API errors when deploying, follow these steps:

### 1. Environment Variables Setup

Set these environment variables in your deployment platform:

```bash
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=3306
NODE_ENV=production
```

**⚠️ SECURITY WARNING:** Never use the credentials shown in the old version of this file. They have been compromised and should be considered insecure.

### 2. Common Deployment Issues

#### Issue: Database Connection Timeout
**Symptoms:** Authentication API calls fail with connection errors
**Solution:** 
- Ensure the database server (34.95.212.100) is accessible from your deployment environment
- Check firewall settings on the database server
- Verify the database credentials are correct

#### Issue: CORS Errors
**Symptoms:** API calls fail with CORS errors
**Solution:**
- Add CORS headers to your API routes
- Configure your deployment platform's CORS settings

#### Issue: Environment Variables Not Loading
**Symptoms:** API uses default values instead of environment variables
**Solution:**
- Ensure environment variables are properly set in your deployment platform
- Restart the deployment after setting environment variables

### 3. Platform-Specific Setup

#### Vercel
1. Go to your project settings
2. Add environment variables in the "Environment Variables" section
3. Redeploy the project

#### Netlify
1. Go to Site settings > Environment variables
2. Add the database environment variables
3. Redeploy the site

#### Railway/Render
1. Go to your service settings
2. Add environment variables
3. Redeploy the service

### 4. Testing Database Connection

You can test the database connection by checking the console logs. The app will log:
- "Database connection successful" if connection works
- "Database connection test failed" if there are issues

### 5. Fallback Configuration

If the remote database is not accessible, you can:
1. Set up a local database
2. Update the environment variables to point to your local database
3. Or use a cloud database service (AWS RDS, Google Cloud SQL, etc.)

### 6. Troubleshooting

1. **Check deployment logs** for database connection errors
2. **Verify network connectivity** to the database server
3. **Test database credentials** manually
4. **Check firewall rules** on the database server
5. **Ensure the database server is running** and accessible

## Support

If you continue to experience issues, check:
1. Database server status
2. Network connectivity
3. Firewall configurations
4. Environment variable settings 