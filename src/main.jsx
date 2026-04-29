import App from "./App";
import "./index.css";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ConfigProvider } from "./context/ConfigContext";
import AppBootstrap from "./bootstrap/AppBootstrap";
//import { useAuth } from "./context/AuthContext";
// const { user } = useAuth();

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ConfigProvider>
      <AuthProvider>
        <AppBootstrap >
          <App />
        </AppBootstrap>
      </AuthProvider>
    </ConfigProvider>
  </BrowserRouter>,
);
