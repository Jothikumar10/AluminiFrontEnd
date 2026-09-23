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

import Profile from "./profile/Profile";
import OtherProfile from "./profile/OtherProfile";

import Users from "./users/Users";

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Application Navbar */}
      <Navbar />

      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/alumni" element={<Alumni />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/events" element={<Events />} />
        <Route path="/community" element={<Community />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={<Notifications />}
        />

        {/* Users */}
        <Route
          path="/users"
          element={<Users />}
        />

        {/* My Profile */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* Other User Profile */}
        <Route
          path="/profile/:userId"
          element={<OtherProfile />}
        />
      </Routes>
    </div>
  );
}

export default App;