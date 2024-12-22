import { BrowserRouter, Routes } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./context/UserContext";
import NavBar from "./components/Navbar";

export const App = () => {
  return (
    <>
      <BrowserRouter>
        <UserProvider>
          <NavBar/>
          <main>
            <Routes>{AppRoutes}</Routes>
          </main>
        </UserProvider>
      </BrowserRouter>
    </>
  );
};

export default App;
