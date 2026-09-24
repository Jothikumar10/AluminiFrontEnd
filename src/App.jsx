import { Routes, Route } from "react-router-dom";

import Navbar from "./components/navbar/Navbar";

import Home from "./pages/public/Home";
import Alumni from "./pages/public/Alumni";
import Jobs from "./pages/public/Jobs";
import Events from "./pages/public/Events";
import Community from "./pages/public/Community";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Notifications from "./pages/notifications/Notifications";

import MyProfile from "./profile/MyProfile";
import AlumniProfile from "./profile/AlumniProfile";
import OtherProfile from "./profile/OtherProfile";

import Messages from "./messages/Messages";
import Users from "./users/Users";

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Application Navbar */}
      <Navbar />

      <Routes>
        {/* =========================================================
            PUBLIC PAGES
        ========================================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/alumni"
          element={<Alumni />}
        />

        <Route
          path="/jobs"
          element={<Jobs />}
        />

        <Route
          path="/events"
          element={<Events />}
        />

        <Route
          path="/community"
          element={<Community />}
        />

        {/* =========================================================
            AUTHENTICATION
        ========================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =========================================================
            NOTIFICATIONS
        ========================================================= */}

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        {/* =========================================================
            USERS
        ========================================================= */}

        <Route
          path="/users"
          element={<Users />}
        />

        {/* =========================================================
            MY PROFILE

            Student -> Profile.jsx
            Alumni  -> AlumniProfile.jsx
        ========================================================= */}

        <Route
          path="/profile"
          element={<MyProfile />}
        />

        {/* =========================================================
            SPECIFIC ALUMNI PROFILE

            Example:
            /alumni-profile/68xxxxxxxxxxxxxxxx
        ========================================================= */}

        <Route
          path="/alumni-profile/:userId"
          element={<AlumniProfile />}
        />

        {/* =========================================================
            OTHER USER PROFILE

            Example:
            /profile/68xxxxxxxxxxxxxxxx
        ========================================================= */}

        <Route
          path="/profile/:userId"
          element={<OtherProfile />}
        />

        {/* =========================================================
            MESSAGES
        ========================================================= */}

        <Route
          path="/messages"
          element={<Messages />}
        />

        <Route
          path="/messages/:userId"
          element={<Messages />}
        />
      </Routes>
    </div>
  );
}

export default App;