import { BrowserRouter, Routes } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./context/UserContext";
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
