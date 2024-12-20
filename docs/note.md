# **Phase 1: Backend Setup (MVP Core)**

**Milestone Completion:** Backend API endpoints for authentication, user management, and trip management are operational and tested with Postman.

# Completed:
## **BACKEND**
- `/login`, `/register` [POST]
- `/users`, `/trips` [GET]
- middlewares of `authenticateUser` 

## **FRONTEND**


# MVP TBC:
## **BACKEND**
- ADD `/users`, `/trips` [POST]  [PUT/PATCH]  [DELETE]  
- ADD middlewares of `authenticateAdmin` in order to manage all users and trips based on `role`
- Reorganize server.js to make documents more structured and readable based on `folder structure` se `README.MD`
- Implement a centralized error handler (`errorHandler.js`)
## **FRONTEND**
- 

## Strech goal
- complete the validation for Case Rules for input both from back- & frontend (**email to lowercase**)
- set up validation rules for password (minlength, characters+number, etc.)