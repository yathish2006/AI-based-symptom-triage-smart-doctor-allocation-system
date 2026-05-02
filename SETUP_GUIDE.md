# MedAI - Setup & Deployment Guide

## Quick Start Guide

### 1. Backend Setup (Node.js + Express + MongoDB)

#### Step 1: Navigate to Backend
```bash
cd backend
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Configure Environment Variables
Create a `.env` file in the backend folder:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/symptom-triage
JWT_SECRET=your_super_secret_jwt_key_12345
JWT_EXPIRE=7d
NODE_ENV=development
```

#### Step 4: Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows (if installed as service)
# MongoDB should start automatically

# Or run mongod manually:
mongod
```

#### Step 5: Start Backend Server
```bash
# Development mode with auto-reload
npm run dev

# OR production mode
npm start
```

Backend will run on: `http://localhost:5000`

### 2. Frontend Setup (React)

#### Step 1: Navigate to Frontend
```bash
cd frontend
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Configure Environment Variables
Create a `.env` file in the frontend folder:
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

#### Step 4: Start Frontend Development Server
```bash
npm start
```

Frontend will run on: `http://localhost:3000`

## Testing the Application

### 1. Register as Patient
- Go to http://localhost:3000
- Click "Sign Up"
- Select "Patient" as role
- Fill in details and register
- You'll be redirected to Patient Dashboard

### 2. Test Symptom Analysis
- In Patient Dashboard, click "Symptom Check"
- Add symptoms (e.g., Fever, Headache)
- Click "Analyze Symptoms"
- AI will provide risk assessment and doctor allocation

### 3. Login as Different Roles
```
Patient Account:
Email: patient@example.com
Password: password123

Doctor Account (need admin setup):
Email: doctor@example.com
Password: password123

Staff Account:
Email: staff@example.com
Password: password123
```

## Database Setup

### MongoDB Local Installation

#### Windows
1. Download from https://www.mongodb.com/try/download/community
2. Run installer
3. MongoDB server runs on `localhost:27017`

#### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu)
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update MONGODB_URI in `.env`

## Project Features Overview

### Patient Features
```
✅ Symptom Analysis
   - AI-powered disease detection
   - Risk level assessment (LOW/MEDIUM/HIGH/CRITICAL)
   - Emergency detection

✅ Doctor Allocation
   - Automatic doctor assignment based on symptoms
   - Load balancing

✅ Consultation History
   - View past consultations
   - Track doctor notes & prescriptions
   - Rate doctors

✅ Medical Profile
   - Update allergies & medications
   - Medical history tracking
```

### Doctor Features
```
✅ Patient Management
   - View assigned patients
   - Patient history & details

✅ Consultation Management
   - View pending consultations
   - Add clinical notes
   - Write prescriptions
   - Mark as completed

✅ Performance Metrics
   - Rating tracking
   - Consultation statistics
   - Patient list management
```

### Staff Features
```
✅ Task Management
   - View assigned tasks
   - Update task status (pending/in-progress/completed)
   - Filter by priority

✅ Schedule Management
   - Schedule patient visits
   - Set task deadlines
   - Track overdue tasks

✅ Statistics
   - Completion rate
   - Task metrics
   - Timeline tracking
```

## Symptom Database

The AI system recognizes these common symptoms:
- Fever
- Cough
- Headache
- Body ache
- Sore throat
- Difficulty breathing
- Chest pain
- Diarrhea
- Nausea
- Fatigue

You can add custom symptoms during consultation.

## API Response Examples

### Symptom Analysis Response
```json
{
  "success": true,
  "consultation": {
    "_id": "65abc123...",
    "patientId": "...",
    "symptoms": [
      {
        "symptom": "Fever",
        "severity": "moderate",
        "duration": "2 days"
      }
    ],
    "aiAnalysis": {
      "potentialDiseases": [
        {
          "disease": "Flu",
          "probability": 75
        },
        {
          "disease": "COVID-19",
          "probability": 65
        }
      ],
      "riskLevel": "MEDIUM",
      "isEmergency": false,
      "recommendations": [
        "Stay hydrated",
        "Get adequate rest",
        "Monitor temperature"
      ]
    },
    "assignedDoctor": {
      "name": "Dr. Smith",
      "specialization": "General"
    }
  },
  "message": "Consultation created. Doctor assigned based on symptoms."
}
```

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running
```bash
# Start MongoDB
mongod

# Or check status
systemctl status mongod
```

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Change port in `.env` or kill process using port 5000

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Make sure backend is running and CORS is enabled
- Backend should be on `http://localhost:5000`
- Frontend should be on `http://localhost:3000`

### Login Issues
```
Invalid credentials error
```
**Solution:** 
- Make sure you registered successfully
- Check your email and password
- Database should have your user record

## Deployment

### Deploy Backend (Heroku / AWS / DigitalOcean)
1. Update MONGODB_URI to cloud database
2. Set environment variables on hosting platform
3. Deploy Node.js application
4. Backend URL will replace localhost:5000

### Deploy Frontend (Vercel / Netlify / GitHub Pages)
1. Update REACT_APP_API_BASE_URL to deployed backend URL
2. Build production bundle: `npm run build`
3. Deploy build folder to hosting
4. Frontend URL will replace localhost:3000

## Performance Optimization

### Backend
- Add caching for frequently accessed doctor lists
- Index MongoDB collections for faster queries
- Implement rate limiting for API endpoints
- Add pagination for large data sets

### Frontend
- Code splitting with React.lazy()
- Image optimization
- CSS minification
- Service workers for offline support

## Security Checklist

- ✅ Environment variables for sensitive data
- ✅ JWT token validation
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control
- ✅ Input validation
- ✅ CORS configuration
- ✅ HTTPS in production
- ✅ Rate limiting
- ✅ SQL injection prevention (using Mongoose)

## Support & Documentation

- MongoDB Docs: https://docs.mongodb.com/
- Express.js: https://expressjs.com/
- React: https://react.dev/
- Axios: https://axios-http.com/

## Contact & Contributions

For issues, feature requests, or contributions, please create an issue or pull request.

---

Happy coding! 🚀
