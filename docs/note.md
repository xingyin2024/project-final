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

## Admin page>
### Suggestions for API Improvements:

1. **Pagination and Filtering:**
   - Add support for pagination and filters to `/users` and `/trips` endpoints to handle large datasets efficiently.
   - Example: `/users?page=1&limit=10` or `/trips?status=submitted`.

2. **Role-Based Access Control:**
   - Ensure the `/users` endpoint is accessible only by admin users.
   - Implement middleware to check the user's role before returning sensitive data.

3. **Consistent Response Structure:**
   - Standardize API responses to include `success`, `data`, and `message` fields for consistency.
   - Example:
     ```json
     {
       "success": true,
       "data": [...],
       "message": "Users retrieved successfully"
     }
     ```

4. **Error Handling:**
   - Return clear error messages with appropriate HTTP status codes.
   - Example: `401 Unauthorized`, `403 Forbidden`, or `404 Not Found`.

5. **Data Relationships:**
   - Add support for fetching related data (e.g., trips linked to specific users).
   - Example: `/users/{userId}/trips`.

6. **Search Functionality:**
   - Include query parameters for searching users or trips by specific fields.
   - Example: `/users?name=John` or `/trips?location=New York`.

7. **Performance Optimization:**
   - Use indexed fields in your database (e.g., `userId` in `trips` collection) to improve query performance.
   - Optimize database queries for large-scale data fetching.

These improvements will make your API more robust, user-friendly, and scalable. Let me know if you'd like help implementing any of these suggestions!