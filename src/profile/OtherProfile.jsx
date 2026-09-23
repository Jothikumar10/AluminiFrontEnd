import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  GraduationCap,
  Mail,
  MessageCircle,
  UserPlus,
  UserCheck,
  Share2,
  MoreHorizontal,
  Check,
  X,
  Clock,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const OtherProfile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Connection states
  const [connectionStatus, setConnectionStatus] =
    useState("none");

  const [connectionDirection, setConnectionDirection] =
    useState(null);

  const [connectionId, setConnectionId] = useState(null);

  const [connectionLoading, setConnectionLoading] =
    useState(false);

  // Follow states
  const [isFollowing, setIsFollowing] = useState(false);

  const [followLoading, setFollowLoading] =
    useState(false);

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  /*
  |--------------------------------------------------------------------------
  | Get Current User ID
  |--------------------------------------------------------------------------
  */

  const getCurrentUserId = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      const currentUser = JSON.parse(storedUser);

      return currentUser?._id || currentUser?.id || null;
    } catch (error) {
      console.error(
        "Failed to read current user:",
        error
      );

      return null;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch Profile
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError("");

        if (!userId) {
          setError("User ID is missing.");
          return;
        }

        const response = await api.get(`/users/${userId}`);

        if (response.data?.success) {
          setProfile(response.data.user);
        } else {
          setError("Unable to load user profile.");
        }
      } catch (err) {
        console.error("Get user profile error:", err);

        if (err.response?.status === 404) {
          setError("User not found.");
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to load user profile."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  /*
  |--------------------------------------------------------------------------
  | Fetch Connection Status
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchConnectionStatus = async () => {
      try {
        if (!userId) {
          return;
        }

        const currentUserId = getCurrentUserId();

        if (!currentUserId) {
          return;
        }

        if (
          currentUserId.toString() ===
          userId.toString()
        ) {
          setConnectionStatus("self");
          return;
        }

        const response = await api.get(
          `/connections/status/${userId}`
        );

        if (response.data?.success) {
          setConnectionStatus(
            response.data.status || "none"
          );

          setConnectionDirection(
            response.data.direction || null
          );

          setConnectionId(
            response.data.connection?._id || null
          );
        }
      } catch (error) {
        console.error(
          "Get connection status error:",
          error
        );
      }
    };

    fetchConnectionStatus();
  }, [userId]);

  /*
  |--------------------------------------------------------------------------
  | Fetch Follow Status
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        if (!userId) {
          return;
        }

        const currentUserId = getCurrentUserId();

        if (!currentUserId) {
          return;
        }

        if (
          currentUserId.toString() ===
          userId.toString()
        ) {
          setIsFollowing(false);
          return;
        }

        const response = await api.get(
          `/follows/status/${userId}`
        );

        if (response.data?.success) {
          setIsFollowing(
            response.data.following === true
          );
        }
      } catch (error) {
        console.error(
          "Get follow status error:",
          error
        );
      }
    };

    fetchFollowStatus();
  }, [userId]);

  /*
  |--------------------------------------------------------------------------
  | Follow User
  |--------------------------------------------------------------------------
  */

  const handleFollow = async () => {
    try {
      if (!userId || followLoading) {
        return;
      }

      setFollowLoading(true);

      const response = await api.post(
        `/follows/${userId}`
      );

      if (response.data?.success) {
        setIsFollowing(true);

        setProfile((previousProfile) => {
          if (!previousProfile) {
            return previousProfile;
          }

          const currentFollowers =
            Number(
              previousProfile.followersCount ??
                previousProfile.followers ??
                0
            );

          return {
            ...previousProfile,
            followersCount:
              currentFollowers + 1,
          };
        });
      }
    } catch (error) {
      console.error(
        "Follow user error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to follow user."
      );
    } finally {
      setFollowLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Unfollow User
  |--------------------------------------------------------------------------
  */

  const handleUnfollow = async () => {
    try {
      if (!userId || followLoading) {
        return;
      }

      setFollowLoading(true);

      const response = await api.delete(
        `/follows/${userId}`
      );

      if (response.data?.success) {
        setIsFollowing(false);

        setProfile((previousProfile) => {
          if (!previousProfile) {
            return previousProfile;
          }

          const currentFollowers =
            Number(
              previousProfile.followersCount ??
                previousProfile.followers ??
                0
            );

          return {
            ...previousProfile,
            followersCount:
              Math.max(currentFollowers - 1, 0),
          };
        });
      }
    } catch (error) {
      console.error(
        "Unfollow user error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to unfollow user."
      );
    } finally {
      setFollowLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Send Connection Request
  |--------------------------------------------------------------------------
  */

  const handleConnect = async () => {
    try {
      if (!userId) {
        return;
      }

      setConnectionLoading(true);

      const response = await api.post(
        `/connections/request/${userId}`
      );

      if (response.data?.success) {
        setConnectionStatus("pending");
        setConnectionDirection("sent");

        setConnectionId(
          response.data.connection?._id || null
        );
      }
    } catch (error) {
      console.error(
        "Send connection request error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to send connection request."
      );
    } finally {
      setConnectionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Cancel Connection Request
  |--------------------------------------------------------------------------
  */

  const handleCancelRequest = async () => {
    try {
      if (!connectionId) {
        return;
      }

      setConnectionLoading(true);

      const response = await api.delete(
        `/connections/${connectionId}`
      );

      if (response.data?.success) {
        setConnectionStatus("none");
        setConnectionDirection(null);
        setConnectionId(null);
      }
    } catch (error) {
      console.error(
        "Cancel connection request error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to cancel connection request."
      );
    } finally {
      setConnectionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Accept Connection Request
  |--------------------------------------------------------------------------
  */

  const handleAcceptRequest = async () => {
    try {
      if (!connectionId) {
        return;
      }

      setConnectionLoading(true);

      const response = await api.put(
        `/connections/${connectionId}/accept`
      );

      if (response.data?.success) {
        setConnectionStatus("accepted");
        setConnectionDirection("received");
      }
    } catch (error) {
      console.error(
        "Accept connection request error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to accept connection request."
      );
    } finally {
      setConnectionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Reject Connection Request
  |--------------------------------------------------------------------------
  */

  const handleRejectRequest = async () => {
    try {
      if (!connectionId) {
        return;
      }

      setConnectionLoading(true);

      const response = await api.put(
        `/connections/${connectionId}/reject`
      );

      if (response.data?.success) {
        setConnectionStatus("rejected");
        setConnectionDirection("received");
      }
    } catch (error) {
      console.error(
        "Reject connection request error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to reject connection request."
      );
    } finally {
      setConnectionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-40 border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition hover:bg-gray-100"
            >
              <ArrowLeft size={20} />

              <span className="hidden sm:block">
                Back
              </span>
            </button>

            <h1 className="text-lg font-bold text-gray-900">
              Profile
            </h1>

            <div className="w-10" />
          </div>
        </div>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="h-40 animate-pulse bg-gray-200 sm:h-52" />

            <div className="px-5 pb-6 sm:px-8">
              <div className="-mt-16 flex items-end sm:-mt-20">
                <div className="h-32 w-32 animate-pulse rounded-full border-4 border-white bg-gray-300 shadow-md sm:h-40 sm:w-40" />
              </div>

              <div className="mt-5 space-y-3">
                <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
                <div className="h-5 w-64 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-80 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="h-40 animate-pulse rounded-2xl bg-white shadow-sm" />
              <div className="h-40 animate-pulse rounded-2xl bg-white shadow-sm" />
            </div>

            <div className="space-y-6">
              <div className="h-32 animate-pulse rounded-2xl bg-white shadow-sm" />
              <div className="h-32 animate-pulse rounded-2xl bg-white shadow-sm" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-40 border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition hover:bg-gray-100"
            >
              <ArrowLeft size={20} />

              <span className="hidden sm:block">
                Back
              </span>
            </button>

            <h1 className="text-lg font-bold text-gray-900">
              Profile
            </h1>

            <div className="w-10" />
          </div>
        </div>

        <main className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
              <MoreHorizontal size={28} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Unable to load profile
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error ||
                "User profile could not be found."}
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Profile Data
  |--------------------------------------------------------------------------
  */

  const profileName = profile.name || "User";

  const profileRole =
    profile.role ||
    (profile.company ? "Alumni" : "User");

  const profileJobRole =
    profile.jobRole || "Professional";

  const profileCompany =
    profile.company || "Not specified";

  const profileDepartment =
    profile.department || "Not specified";

  const profileGraduationYear =
    profile.graduationYear || "Not specified";

  const profileLocation =
    profile.location || "Not specified";

  const profileBio =
    profile.bio ||
    "This user has not added a bio yet.";

  const profileSkills = Array.isArray(profile.skills)
    ? profile.skills
    : [];

  /*
  |--------------------------------------------------------------------------
  | Share Profile
  |--------------------------------------------------------------------------
  */

  const handleShare = async () => {
    const profileUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profileName} - AlumniConnect`,
          text: `View ${profileName}'s profile on AlumniConnect.`,
          url: profileUrl,
        });
      } else {
        await navigator.clipboard.writeText(
          profileUrl
        );

        alert("Profile link copied.");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Share error:", error);
      }
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Connection Button
  |--------------------------------------------------------------------------
  */

  const renderConnectionButton = () => {
    if (connectionStatus === "self") {
      return null;
    }

    if (connectionStatus === "accepted") {
      return (
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 rounded-xl border border-green-300 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700"
        >
          <Check size={18} />
          Connected
        </button>
      );
    }

    if (
      connectionStatus === "pending" &&
      connectionDirection === "sent"
    ) {
      return (
        <button
          type="button"
          onClick={handleCancelRequest}
          disabled={connectionLoading}
          className="flex items-center justify-center gap-2 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-2.5 text-sm font-semibold text-yellow-700 transition hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Clock size={18} />

          {connectionLoading
            ? "Cancelling..."
            : "Pending"}
        </button>
      );
    }

    if (
      connectionStatus === "pending" &&
      connectionDirection === "received"
    ) {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleAcceptRequest}
            disabled={connectionLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check size={18} />

            {connectionLoading
              ? "Processing..."
              : "Accept"}
          </button>

          <button
            type="button"
            onClick={handleRejectRequest}
            disabled={connectionLoading}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={18} />
            Reject
          </button>
        </div>
      );
    }

    if (connectionStatus === "rejected") {
      return (
        <button
          type="button"
          onClick={handleConnect}
          disabled={connectionLoading}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserPlus size={18} />

          {connectionLoading
            ? "Sending..."
            : "Connect"}
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handleConnect}
        disabled={connectionLoading}
        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <UserPlus size={18} />

        {connectionLoading
          ? "Sending..."
          : "Connect"}
      </button>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Follow Button
  |--------------------------------------------------------------------------
  */

  const renderFollowButton = () => {
    if (connectionStatus === "self") {
      return null;
    }

    if (isFollowing) {
      return (
        <button
          type="button"
          onClick={handleUnfollow}
          disabled={followLoading}
          className="flex items-center justify-center gap-2 rounded-xl border border-green-300 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserCheck size={18} />

          {followLoading
            ? "Unfollowing..."
            : "Following"}
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handleFollow}
        disabled={followLoading}
        className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <UserPlus size={18} />

        {followLoading
          ? "Following..."
          : "Follow"}
      </button>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Followers Count
  |--------------------------------------------------------------------------
  */

  const followersCount =
    profile.followersCount ??
    profile.followers ??
    0;

  const followingCount =
    profile.followingCount ??
    profile.following ??
    0;

  const postsCount =
    profile.postsCount ??
    profile.posts ??
    0;

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition hover:bg-gray-100"
          >
            <ArrowLeft size={20} />

            <span className="hidden sm:block">
              Back
            </span>
          </button>

          <h1 className="text-lg font-bold text-gray-900">
            Profile
          </h1>

          <button
            type="button"
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
          >
            <MoreHorizontal size={22} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Cover */}
          <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 sm:h-52">
            {profile.coverImage && (
              <img
                src={profile.coverImage}
                alt="Cover"
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* Profile Information */}
          <div className="px-5 pb-6 sm:px-8">
            {/* Profile Image */}
            <div className="-mt-16 flex items-end justify-between sm:-mt-20">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-200 text-3xl font-bold text-gray-600 shadow-md sm:h-40 sm:w-40 sm:text-4xl">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profileName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(profileName)
                )}
              </div>

              <button
                type="button"
                className="mb-2 rounded-full border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition hover:bg-gray-50"
              >
                <MoreHorizontal size={22} />
              </button>
            </div>

            {/* Name and Basic Details */}
            <div className="mt-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                      {profileName}
                    </h2>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {profileRole}
                    </span>
                  </div>

                  <p className="mt-2 text-base text-gray-600">
                    {profileJobRole}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} />
                      <span>{profileCompany}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <GraduationCap size={16} />
                      <span>
                        {profileDepartment} ·{" "}
                        {profileGraduationYear}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{profileLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {renderConnectionButton()}

                  {renderFollowButton()}

                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                  >
                    <MessageCircle size={18} />
                    Message
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    <Share2 size={18} />
                    Share
                  </button>
                </div>
              </div>

              {/* Followers */}
              <div className="mt-6 flex flex-wrap gap-6 border-t border-gray-100 pt-5">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {postsCount}
                  </p>

                  <p className="text-sm text-gray-500">
                    Posts
                  </p>
                </div>

                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {followersCount}
                  </p>

                  <p className="text-sm text-gray-500">
                    Followers
                  </p>
                </div>

                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {followingCount}
                  </p>

                  <p className="text-sm text-gray-500">
                    Following
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* About */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">
                About
              </h3>

              <p className="mt-4 leading-7 text-gray-600">
                {profileBio}
              </p>
            </section>

            {/* Skills */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">
                Skills
              </h3>

              {profileSkills.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profileSkills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  No skills added yet.
                </p>
              )}
            </section>

            {/* Posts */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Posts
                </h3>

                <button
                  type="button"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View all
                </button>
              </div>

              <div className="mt-5 rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-bold text-blue-700">
                    {profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt={profileName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(profileName)
                    )}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      {profileName}
                    </p>

                    <p className="text-xs text-gray-500">
                      {profileRole} · {profileJobRole}
                    </p>
                  </div>
                </div>

                <p className="mt-4 leading-7 text-gray-700">
                  Building projects, learning new
                  technologies, and helping students with
                  their career journey.
                </p>

                <div className="mt-4 flex items-center gap-6 border-t border-gray-100 pt-4 text-sm text-gray-500">
                  <button
                    type="button"
                    className="hover:text-blue-600"
                  >
                    Like
                  </button>

                  <button
                    type="button"
                    className="hover:text-blue-600"
                  >
                    Comment
                  </button>

                  <button
                    type="button"
                    className="hover:text-blue-600"
                  >
                    Share
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Content */}
          <div className="space-y-6">
            {/* Contact */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">
                Contact
              </h3>

              <div className="mt-5">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <Mail size={18} />
                  </div>

                  <span>
                    Available after connection
                  </span>
                </div>
              </div>
            </section>

            {/* Education */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">
                Education
              </h3>

              <div className="mt-5 flex gap-3">
                <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                  <GraduationCap size={20} />
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    {profileDepartment}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Graduation Year:{" "}
                    {profileGraduationYear}
                  </p>

                  {profile.college && (
                    <p className="mt-1 text-sm text-gray-500">
                      {profile.college}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OtherProfile;