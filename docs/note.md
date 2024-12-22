# **Phase 1: Backend Setup (MVP Core)**

**Milestone Completion:** Backend API endpoints for authentication, user management, and trip management are operational and tested with Postman.

# Completed:
## **BACKEND**
- `/login`, `/register` [POST]
- `/users`, `/trips` [GET] [POST] [PATCH] 
- middlewares of `authenticateUser` 
- ADD middlewares of `authenticateAdmin` in order to manage all users and trips based on `role`
- Reorganize server.js to make documents more structured and readable based on `folder structure` se `README.MD`
- Implement a centralized error handler (`errorHandler.js`)

## **FRONTEND**


# MVP TBC:
## **BACKEND**
- ADD `/users`, `/trips`  [DELETE]  

## **FRONTEND**
- 

## Strech goal
- complete the validation for Case Rules for input both from back- & frontend (**email to lowercase**)
- set up validation rules for password (minlength, characters+number, etc.)

---

### **Guidance:**
1. **Authentication Integration:**
   - Ensure the `/login` and `/register` endpoints from the backend are connected to the `Login.jsx` and `Register.jsx` components.
   - Manage user sessions using the `UserContext` to store tokens and roles.

2. **Route Protection:**
   - Implement role-based routing logic in `AppRoutes.jsx` to redirect unauthorized users to `/login` or `/dashboard`.

3. **Dashboard Design:**
   - Focus on the `Dashboard.jsx` to display trips dynamically using data fetched from the backend.
   - Include cards for "Recent Trips" and actions like "Create New Trip."

4. **Form Handling:**
   - Develop forms in `CreateTrip.jsx` and `EditTrip.jsx` to handle trip creation and updates.
   - Integrate validation for input fields and utilize backend endpoints.

5. **Styling:**
   - Use existing CSS structure to ensure visual consistency across pages.
   - Align the design with the style guide provided earlier.

---

### **Updated Roadmap:**
1. **Frontend-Backend Integration (Current Priority):**
   - Implement API calls for authentication (`/register`, `/login`) in `Register.jsx` and `Login.jsx`.
   - Store user tokens and manage roles using `UserContext`.

2. **Core Functionality Implementation:**
   - **Dashboard:** Fetch and display trips based on the logged-in user’s role.
   - **Create/Edit Trips:** Build forms for creating and editing trips, ensuring they match backend requirements.
   - **Profile:** Allow users to view and update their profile information.

3. **Admin Functionality:**
   - Build the `Admin.jsx` page to manage all trips and users.
   - Include actions like approving trips and updating user roles.

4. **UI/UX Enhancements:**
   - Add loading states, error messages, and success notifications.
   - Implement role-based navigation in `Navbar.jsx`.

5. **Final Touches:**
   - Test all routes and endpoints thoroughly using mock data and edge cases.
   - Optimize for responsiveness and accessibility.

6. **Stretch Goal (Optional):**
   - Implement day/night mode based on the design guide.

---

With these next steps, you'll steadily progress toward completing your MVP. Let me know which part you'd like to tackle next, and I can assist further!