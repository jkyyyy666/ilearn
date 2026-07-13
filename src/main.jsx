import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { WordProvider } from "./context/WordContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider>
        <WordProvider>
          <App />
        </WordProvider>
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>
);
