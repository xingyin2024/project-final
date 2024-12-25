import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./context/UserContext";
import NavBar from "./components/Navbar";

export const App = () => {
  return (
    <Router>
      <UserProvider>
        <NavBar />
        <main>
          <AppRoutes />
        </main>
      </UserProvider>
    </Router>    
  );
};

export default App;
