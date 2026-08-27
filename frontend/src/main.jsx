import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

const savedDarkMode = localStorage.getItem("festlog-dark-mode");
document.documentElement.dataset.theme = savedDarkMode === "on" ? "dark" : "light";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
