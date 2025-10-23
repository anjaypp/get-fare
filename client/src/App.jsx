import React, { useEffect } from "react";
import { initCSRF } from "./utils/initCSRF";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Homepage from "./pages/Homepage/Homepage";
import "./App.css";
import SearchResults from "./pages/SearchResults";
import RevalidationPage from "./pages/RevalidationPage";
import BookingConfirmation from "./pages/BookingConfirmation";
import { Toaster } from "react-hot-toast";

function App() {

  useEffect(() => {
    initCSRF();
  }, []);

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Homepage />
            </Layout>
          }
        />

        <Route
          path="/results"
          element={
            <Layout>
              <SearchResults />
            </Layout>
          }
        />

        <Route
          path="/flight-review"
          element={
            <Layout>
              <RevalidationPage />
            </Layout>
          }
        />

        <Route
          path="/flight-booking"
          element={
            <Layout>
              <BookingConfirmation />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
