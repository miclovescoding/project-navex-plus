//Import Main library, tool connecting react to HTML, tool handling page navigation
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

//import css sylesheet and pages on website
import "./index.css";
import DonatePage from "./routes/donate-page";
import MainPage from "./routes/main-page";
import Root from "./routes/root";

// app's navigation structure
let router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: "/donate",
        element: <DonatePage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

// Sets up page routing and launches app into browser