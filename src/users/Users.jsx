import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Eye,
  Users as UsersIcon,
  RefreshCw,
} from "lucide-react";

import api from "../api/axios";

const Users = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");

      console.log("Users response:", response.data);

      if (response.data?.success) {
        const userList = response.data.users || [];

        setUsers(userList);
        setFilteredUsers(userList);
      } else {
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error("Get users error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter((user) => {
      const name = user.name || "";
      const email = user.email || "";
      const jobRole = user.jobRole || "";
      const company = user.company || "";
      const department = user.department || "";
      const location = user.location || "";

      return (
        name.toLowerCase().includes(searchText) ||
        email.toLowerCase().includes(searchText) ||
        jobRole.toLowerCase().includes(searchText) ||
        company.toLowerCase().includes(searchText) ||
        department.toLowerCase().includes(searchText) ||
        location.toLowerCase().includes(searchText)
      );
    });

    setFilteredUsers(filtered);
  }, [search, users]);

  const handleViewProfile = (userId) => {
    if (!userId) return;

    let currentUserId = "";

    try {
      const currentUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      currentUserId =
        currentUser?._id ||
        currentUser?.id ||
        currentUser?.userId ||
        "";
    } catch {
      currentUserId = "";
    }

    if (
      String(userId) ===
      String(currentUserId)
    ) {
      navigate("/profile");
      return;
    }

    navigate(`/profile/${userId}`);
  };

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const getProfileImage = (user) => {
    if (!user?.profileImage) {
      return null;
    }

    if (user.profileImage.startsWith("http")) {
      return user.profileImage;
    }

    return user.profileImage;
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <UsersIcon size={22} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    People
                  </h1>

                  <p className="mt-1 text-sm text-gray-500">
                    Discover students, alumni and professionals
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={getUsers}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />

              Refresh
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, role, company, department or location..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {search
                ? `${filteredUsers.length} user${
                    filteredUsers.length !== 1 ? "s" : ""
                  } found`
                : `${users.length} user${
                    users.length !== 1 ? "s" : ""
                  }`}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="h-24 animate-pulse bg-gray-200" />

                <div className="p-5">
                  <div className="-mt-12 mb-4 flex justify-center">
                    <div className="h-20 w-20 animate-pulse rounded-full border-4 border-white bg-gray-300" />
                  </div>

                  <div className="mx-auto h-5 w-32 animate-pulse rounded bg-gray-200" />

                  <div className="mx-auto mt-2 h-4 w-24 animate-pulse rounded bg-gray-200" />

                  <div className="mt-5 h-10 animate-pulse rounded-xl bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          /* Empty */
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <User size={28} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No users found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              {search
                ? "Try searching with a different name, role, company or department."
                : "There are no users available yet."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* Users */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredUsers.map((user) => {
              const profileImage = getProfileImage(user);

              return (
                <div
                  key={user._id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Cover */}
                  <div className="relative h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                    {user.coverImage && (
                      <img
                        src={user.coverImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  {/* Profile */}
                  <div className="px-5 pb-5">
                    <div className="-mt-10 flex justify-center">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={user.name || "User"}
                          className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-xl font-bold text-white shadow-md">
                          {getInitials(user.name)}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-center">
                      <h2 className="truncate text-lg font-bold text-gray-900">
                        {user.name || "Unnamed User"}
                      </h2>

                      {user.jobRole ? (
                        <p className="mt-1 truncate text-sm font-medium text-blue-600">
                          {user.jobRole}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-gray-400">
                          No job role added
                        </p>
                      )}
                    </div>

                    {/* Details */}
                    <div className="mt-5 space-y-2.5">
                      {user.company && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Briefcase
                            size={16}
                            className="shrink-0 text-gray-400"
                          />

                          <span className="truncate">
                            {user.company}
                          </span>
                        </div>
                      )}

                      {user.department && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <GraduationCap
                            size={16}
                            className="shrink-0 text-gray-400"
                          />

                          <span className="truncate">
                            {user.department}
                          </span>
                        </div>
                      )}

                      {user.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin
                            size={16}
                            className="shrink-0 text-gray-400"
                          />

                          <span className="truncate">
                            {user.location}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* View Profile */}
                    <button
                      type="button"
                      onClick={() =>
                        handleViewProfile(user._id)
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Eye size={17} />
                      View Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;