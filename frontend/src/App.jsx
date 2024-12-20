import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./context/UserContext";
import "./App.css";
import Header from "./components/Header";

export const App = () => {
  return (
    <>
      <BrowserRouter>
        <UserProvider>
          <Header />
          <main>
            <Routes>{AppRoutes}</Routes>
          </main>
        </UserProvider>
      </BrowserRouter>
    </>
  );
};

export default App;
