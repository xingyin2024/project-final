* Documentation for Future Development: 
Include a docs/ folder for storing developer documentation, such as API specs, architecture diagrams, and endpoint documentation. This will help new contributors.

# Final-project-TRAKTAMENTE folder structure
├── backend/                  # Backend logic for APIs and database interactions
│   ├── .babelrc             # Babel configuration for JavaScript transpiling
│   ├── package.json         # Backend dependencies and scripts
│   ├── README.md            # Backend documentation
│   ├── .gitignore           # Ignored files for Git
│   ├── server.js            # Entry point for the backend
│   ├── .env                 # Environment variables (e.g., MONGO_URI, JWT_SECRET)
│   ├── data/                # Static JSON data for seeding or testing
│   │   ├── users.json       # Mock user data
│   │   ├── trips.json       # Mock trip data
│   ├── middleware/          # Middleware for validation and authentication
│   │   ├── validation.js    # Validation rules using express-validator
│   │   ├── auth.js          # JWT authentication middleware
│   ├── models/              # Mongoose schemas for MongoDB
│   │   ├── userModel.js     # User schema
│   │   ├── tripModel.js     # Trip schema
│   ├── routes/              # API route definitions
│   │   ├── userRoutes.js    # Routes for user authentication and management
│   │   ├── tripRoutes.js    # Routes for trip reporting and management
│   ├── controllers/         # Route handlers with logic for API endpoints
│   │   ├── userController.js # Handlers for user-related routes
│   │   ├── tripController.js # Handlers for trip-related routes
│   ├── config/              # Configuration files
│   │   ├── database.js      # MongoDB connection logic
│
├── frontend/                 # Frontend logic and React components
│   ├── public/              # Public assets like images and favicon
│   │   ├── profile-pic.png  # Default profile picture
│   ├── src/                 # Main React application code
│   │   ├── assets/          # Design assets like images, icons, and fonts
│   │   │   ├── logo.svg     # App logo
│   │   ├── components/      # Reusable React components
│   │   │   ├── Button.jsx   # Button component
│   │   │   ├── Navbar.jsx   # Navbar/Sidebar component
│   │   ├── pages/           # Main pages for the app
│   │   │   ├── Welcome.jsx  # Welcome page
│   │   │   ├── Login.jsx    # Login page
│   │   │   ├── Register.jsx # Register page
│   │   │   ├── Dashboard.jsx # User dashboard
│   │   │   ├── TripReport.jsx # Trip reporting page
│   │   │   ├── Profile.jsx  # User profile page
│   │   ├── styles/          # CSS files for styling the app
│   │   │   ├── index.css    # Global and shared CSS styles
│   │   │   ├── auth.css     # Login/Register specific styles
│   │   │   ├── dashboard.css # Dashboard specific styles
│   │   ├── App.jsx          # Main React component
│   │   ├── main.jsx         # Entry point for React app
│   ├── index.html           # HTML template for the app
│   ├── package.json         # Frontend dependencies and scripts
│   ├── README.md            # Frontend documentation
│   ├── .gitignore           # Ignored files for Git
│   ├── vite.config.js       # Vite configuration file
│   ├── .env                 # Environment variables (e.g., an API base URL)
│
├── docs/                     # Developer documentation
│   ├── README.md            # Notes on project setup, APIs, and architecture
│
├── README.md                 # Project-level documentation
├── .gitignore                # Global ignored files for Git
├── app.js                    # Wrapper for server setup if needed
├── package.json              # Global dependencies and scripts
├── netlify.toml              # Netlify configuration for deployment
├── Procfile                  # Heroku deployment configuration



# Summary of Key Milestones:
1- Authentication (Backend and Frontend)
2- Dashboard with trip reporting and filtering
3- Admin functionality for trip approval
4- MongoDB integration for users and trips
5- Testing and Deployment