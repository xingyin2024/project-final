# Final-project-TRAKTAMENTE folder structure

├── backend/ # Backend logic for APIs and database interactions
│ ├── .babelrc # Babel configuration for JavaScript transpiling
│ ├── package.json # Backend dependencies and scripts
│ ├── README.md # Backend documentation
│ ├── .gitignore # Ignore unnecessary files like node_modules, env, etc.
│ ├── server.js # Entry point for the backend application
│ ├── .env # Environment variables (e.g., MONGO_URI, API keys)
│ ├── controllers/ # Controllers handle business logic for API routes
│ │ ├── userController.js # Handles user authentication, profile updates, etc.
│ │ ├── tripController.js # Manages trip-related actions (create, update, fetch)
│ ├── middleware/ # Middleware for authentication, validation, and error handling
│ │ ├── auth.js # Middleware for verifying authentication tokens
│ │ ├── validation.js # Middleware for Input validation
│ │ ├── checkDbConnection.js # Middleware to check MongoDB connection
│ │ ├── errorHandler.js # Global error handling middleware
│ ├── models/ # MongoDB schemas and models
│ │ ├── userModel.js # Mongoose schema and model for users
│ │ ├── tripModel.js # Mongoose schema and model for trips
│ ├── routes/ # Defines backend API endpoints
│ │ ├── userRoutes.js # User-related API routes
│ │ ├── authRoutes.js # Authentication (login/register) API routes
│ │ ├── tripRoutes.js # Trip-related API routes
│ ├── utils/ # Utility functions for backend logic
│ │ ├── handleMongoError.js # Handles MongoDB-specific errors
│ │ ├── pagination.js # Helper function for paginating API results
│
├── frontend/ # Frontend logic and React components
│ ├── public/ # Public assets like images, favicon, etc.
│ │ ├── profile-pic.png # Default profile picture for users
│ │ ├── profile-pic-admin.png # Default profile picture for admin users
│ ├── src/ # Main React application source code
│ │ ├── assets/ # Static assets (JSON, images, etc.)
│ │ │ ├── fav-city.json # JSON file storing frequently used cities
│ │ │ ├── Loading.json # JSON for loading animation
│ │ │ ├── traktamente-en.json # JSON storing per diem/travel allowance data
│ │ │ ├── Updating.json # JSON handling update animations
│ │ ├── components/ # Reusable React UI components
│ │ │ ├── ActionButton.jsx # Generic action button component
│ │ │ ├── AlertMessage.jsx # Component for displaying alert messages
│ │ │ ├── ConfirmationPopup.jsx # Popup for confirming actions (e.g., delete trip)
│ │ │ ├── Navbar.jsx # Navbar/Sidebar navigation component
│ │ │ ├── NoTripsFound.jsx # Display message when no trips are found
│ │ │ ├── Pagination.jsx # Component for paginating trip lists
│ │ │ ├── ProfileForm.jsx # Form component for user profile updates
│ │ │ ├── SummaryCard.jsx # Card component displaying trip summaries
│ │ │ ├── TeamCard.jsx # Card displaying team members/admins
│ │ │ ├── TripCard.jsx # Card component displaying a single trip
│ │ │ ├── TripDayCalculator.jsx # Utility component for trip day calculations
│ │ │ ├── TripForm.jsx # Form for creating or editing trips
│ │ │ ├── TripFormButtons.jsx # Buttons for submitting/canceling trip forms
│ │ │ ├── TripFormHeader.jsx # Header for trip forms
│ │ ├── context/ # React Context for managing global state
│ │ │ ├── UserContext.jsx # Manages authentication, user data, and state
│ │ ├── hooks/ # Custom React hooks
│ │ │ ├── useTripForm.js # Hook for handling trip form logic
│ │ │ ├── useActionButtons.js # Hook managing action buttons
│ │ │ ├── useAlert.js # Hook managing alerts/popups
│ │ │ ├── useUniqueCountries.js # Hook for fetching unique country lists
│ │ ├── pages/ # React pages for different views
│ │ │ ├── Admin.jsx # Admin dashboard
│ │ │ ├── CreateTrip.jsx # Page for creating a new trip
│ │ │ ├── Dashboard.jsx # Main user dashboard displaying trips
│ │ │ ├── EditTrip.jsx # Page for editing an existing trip
│ │ │ ├── Home.jsx # Welcome page before logging in
│ │ │ ├── Login.jsx # User login page
│ │ │ ├── NotFound.jsx # 404 page redirecting to dashboard or login
│ │ │ ├── Profile.jsx # User profile page
│ │ │ ├── Register.jsx # User registration page
│ │ │ ├── TripDetail.jsx # Detailed trip information page
│ │ │ ├── TripOverView.jsx # Overview page for multiple trips
│ │ ├── routes/ # Routing and access control
│ │ │ ├── AppRoutes.jsx # Centralized route management
│ │ │ ├── ProtectedRoutes.jsx # Ensures access control based on role
│ │ ├── styles/ # CSS files for styling the app
│ │ │ ├── index.css # Global and shared CSS styles
│ │ │ ├── auth.css # Authentication-related styles (login/register)
│ │ │ ├── dashboard.css # Dashboard styles
│ │ │ ├── admin.css # Admin panel styles
│ │ │ ├── profile.css # Profile page styles
│ │ │ ├── trip.css # Trip-related styles (create/edit/detail)
│ │ ├── utils/ # Utility functions
│ │ │ ├── formatDateTime.js # Helper function for formatting dates
│ │ ├── App.jsx # Main React component
│ │ ├── main.jsx # Entry point for React app
│ ├── index.html # HTML template for the app
│ ├── package.json # Frontend dependencies and scripts
│ ├── README.md # Frontend documentation
│ ├── .gitignore # Ignore unnecessary frontend files
│ ├── vite.config.js # Vite configuration for development setup
│ ├── .env # Environment variables (e.g., API base URL)
│
├── docs/ # Developer documentation
│ ├── README.md # Folder structure and comments
│ ├──MVProadmap.md # Draft Roadmap generated by ChatGPT
│
├── README.md # Project-level documentation
├── .gitignore # Global ignore file for project
├── app.js # Wrapper for server setup if needed
├── package.json # Global dependencies and scripts
├── netlify.toml # Netlify configuration for deployment
├── Procfile # Heroku deployment configuration
