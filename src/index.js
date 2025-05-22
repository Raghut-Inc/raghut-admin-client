import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { HelmetProvider } from "react-helmet-async";
import { ConfigProvider } from "antd";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router";

const root = ReactDOM.createRoot(document.getElementById("root"));

const theme = {
  token: {
    fontFamily: 'KyoboHand, sans-serif',
  },
};

if (process.env.NODE_ENV === 'production') {
  console.log = () => { };
  console.warn = () => { };
  console.error = (...args) => {
    if (args[0]?.includes('Unhandled')) console.error(...args); // keep fatal
  };
}

root.render(
  // <React.StrictMode>
  <HelmetProvider>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <ConfigProvider theme={theme}>
          <App />
        </ConfigProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </HelmetProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
