import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import api from "../api/axios";

import Profile from "./Profile";
import AlumniProfile from "./AlumniProfile";

function MyProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/users/me");

        const currentUser =
          response.data?.user ||
          response.data?.data ||
          response.data;

        setUser(currentUser);
      } catch (error) {
        console.error(
          "Failed to load current user:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-slate-600">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role || "").toLowerCase();

  if (role === "alumni") {
    return <AlumniProfile />;
  }

  return <Profile />;
}

export default MyProfile;