import React, { useEffect, useState } from "react";
import {
  MapPin,
  Mail,
  GraduationCap,
  BriefcaseBusiness,
  Pencil,
  Globe,
  CalendarDays,
  Code2,
  Users,
  MessageCircle,
  UserPlus,
  Building2,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const AlumniProfile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Get Alumni Profile
  |--------------------------------------------------------------------------
  |
  | /profile
  |     -> Logged-in alumni
  |
  | /alumni-profile/:userId
  |     -> Another specific alumni
  |
  */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        let response;

        if (userId) {
          // Another alumni
          response = await api.get(`/users/${userId}`);
        } else {
          // Logged-in alumni
          response = await api.get("/users/me");
        }

        console.log("Alumni profile response:", response.data);

        const user =
          response.data?.user ||
          response.data?.data ||
          response.data;

        if (!user) {
          throw new Error("User profile data was not found.");
        }

        setAlumni(user);
      } catch (err) {
        console.error(
          "Get alumni profile error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load alumni profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2
            size={36}
            className="animate-spin text-indigo-600"
          />

          <p className="text-sm font-medium text-slate-600">
            Loading alumni profile...
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error || !alumni) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle size={25} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Unable to load profile
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error ||
              "Profile information is unavailable."}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize User Data
  |--------------------------------------------------------------------------
  */

  const name =
    alumni.name ||
    alumni.fullName ||
    "Alumni User";

  const jobRole =
    alumni.jobRole ||
    alumni.position ||
    alumni.roleTitle ||
    "Software Professional";

  const company =
    alumni.company ||
    alumni.currentCompany ||
    "Not specified";

  const location =
    alumni.location ||
    alumni.city ||
    "Location not specified";

  const email =
    alumni.email ||
    "Email not available";

  const profileImage =
    alumni.profileImage ||
    alumni.avatar ||
    alumni.profilePhoto ||
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80";

  const about =
    alumni.about ||
    alumni.bio ||
    alumni.summary ||
    "This alumni has not added an introduction yet.";

  const graduationYear =
    alumni.graduationYear ||
    alumni.yearOfGraduation ||
    "Not specified";

  const degree =
    alumni.degree ||
    alumni.education ||
    "B.E. Computer Science Engineering";

  const college =
    alumni.college ||
    alumni.institution ||
    "R P Sarathy Institute of Technology";

  const department =
    alumni.department ||
    alumni.branch ||
    "Computer Science Engineering";

  const skills = Array.isArray(alumni.skills)
    ? alumni.skills
    : [];

  const linkedin =
    alumni.linkedin ||
    alumni.linkedIn ||
    alumni.linkedinUrl ||
    "";

  const github =
    alumni.github ||
    alumni.gitHub ||
    alumni.githubUrl ||
    "";

  const portfolio =
    alumni.portfolio ||
    alumni.portfolioUrl ||
    alumni.website ||
    "";

  const experience =
    alumni.experience ||
    alumni.experienceYears ||
    "Not specified";

  /*
  |--------------------------------------------------------------------------
  | Check Own Profile
  |--------------------------------------------------------------------------
  */

  const loggedInUser =
    JSON.parse(localStorage.getItem("user") || "null");

  const isOwnProfile =
    !userId ||
    (loggedInUser?._id &&
      alumni?._id &&
      String(loggedInUser._id) === String(alumni._id));

  /*
  |--------------------------------------------------------------------------
  | Open Message
  |--------------------------------------------------------------------------
  */

  const handleMessage = () => {
    if (!alumni._id) {
      return;
    }

    if (
      loggedInUser?._id &&
      String(loggedInUser._id) === String(alumni._id)
    ) {
      return;
    }

    navigate(`/messages/${alumni._id}`);
  };

  /*
  |--------------------------------------------------------------------------
  | Edit Profile
  |--------------------------------------------------------------------------
  */

  const handleEditProfile = () => {
    navigate("/profile");
  };

  /*
  |--------------------------------------------------------------------------
  | Request Mentorship
  |--------------------------------------------------------------------------
  */

  const handleMentorship = () => {
    alert(
      "Mentorship request feature will be connected in the next step."
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =====================================================
            PROFILE HEADER
        ====================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Cover */}

          <div className="h-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 sm:h-52" />

          <div className="px-5 pb-6 sm:px-8">

            <div className="-mt-16 flex flex-col gap-5 sm:-mt-20 lg:flex-row lg:items-end lg:justify-between">

              {/* Profile Information */}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

                <img
                  src={profileImage}
                  alt={name}
                  className="h-32 w-32 rounded-2xl border-4 border-white object-cover shadow-lg sm:h-40 sm:w-40"
                  onError={(event) => {
                    event.currentTarget.src =
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80";
                  }}
                />

                <div className="pb-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                      {name}
                    </h1>

                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                      Alumni
                    </span>

                  </div>

                  <p className="mt-1 text-base font-medium text-slate-700">
                    {jobRole}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">

                    <span className="flex items-center gap-1.5">
                      <Building2 size={16} />
                      {company}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <MapPin size={16} />
                      {location}
                    </span>

                  </div>

                </div>

              </div>

              {/* Buttons */}

              <div className="flex flex-wrap gap-2">

                {isOwnProfile ? (
                  <button
                    type="button"
                    onClick={handleEditProfile}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Pencil size={17} />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleMessage}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                      <MessageCircle size={17} />
                      Message
                    </button>
                  </>
                )}

              </div>

            </div>

            {/* Quick Stats */}

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-6 sm:grid-cols-4">

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Experience
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {experience}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Graduation
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {graduationYear}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Mentorship
                </p>

                <p className="mt-1 text-lg font-bold text-emerald-600">
                  Available
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Referrals
                </p>

                <p className="mt-1 text-lg font-bold text-indigo-600">
                  Available
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ===================================================
              LEFT COLUMN
          ==================================================== */}

          <div className="space-y-6 lg:col-span-2">

            {/* About */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <h2 className="text-xl font-bold text-slate-900">
                About
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {about}
              </p>

            </section>

            {/* Experience */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600">
                  <BriefcaseBusiness size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Experience
                  </h2>

                  <p className="text-sm text-slate-500">
                    Professional career journey
                  </p>
                </div>

              </div>

              <div className="mt-6 border-l-2 border-indigo-100 pl-6">

                <div className="relative">

                  <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-4 border-white bg-indigo-600" />

                  <h3 className="font-bold text-slate-900">
                    {jobRole}
                  </h3>

                  <p className="mt-1 font-medium text-indigo-600">
                    {company}
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays size={15} />
                    Current Position
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Professional experience and career
                    information provided by the alumni.
                  </p>

                </div>

              </div>

            </section>

            {/* Education */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-purple-100 p-2.5 text-purple-600">
                  <GraduationCap size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Education
                  </h2>

                  <p className="text-sm text-slate-500">
                    Academic background
                  </p>
                </div>

              </div>

              <div className="mt-5 rounded-xl border border-slate-200 p-4">

                <h3 className="font-bold text-slate-900">
                  {degree}
                </h3>

                <p className="mt-2 text-sm font-medium text-indigo-600">
                  {college}
                </p>

                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">

                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={15} />
                    Graduated {graduationYear}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <GraduationCap size={15} />
                    {department}
                  </span>

                </div>

              </div>

            </section>

            {/* Skills */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
                  <Code2 size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Skills
                  </h2>

                  <p className="text-sm text-slate-500">
                    Technical expertise
                  </p>
                </div>

              </div>

              <div className="mt-5 flex flex-wrap gap-2">

                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No skills added yet.
                  </p>
                )}

              </div>

            </section>

          </div>

          {/* ===================================================
              RIGHT COLUMN
          ==================================================== */}

          <div className="space-y-6">

            {/* Contact */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                Contact Information
              </h2>

              <div className="mt-5 space-y-4">

                <div className="flex items-start gap-3">

                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    <Mail size={17} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs text-slate-500">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-slate-800">
                      {email}
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-3">

                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    <MapPin size={17} />
                  </div>

                  <div>

                    <p className="text-xs text-slate-500">
                      Location
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {location}
                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* Career Guidance */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600">
                  <Users size={21} />
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Career Guidance
                  </h2>

                  <p className="text-sm text-slate-500">
                    Help current students
                  </p>

                </div>

              </div>

              <div className="mt-5 space-y-3">

                <div className="rounded-xl bg-emerald-50 p-4">

                  <p className="text-sm font-semibold text-emerald-800">
                    Mentorship Available
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-700">
                    Available to guide students about
                    careers, interviews, skills, and
                    software development.
                  </p>

                </div>

                {!isOwnProfile && (
                  <button
                    type="button"
                    onClick={handleMentorship}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <UserPlus size={17} />
                    Request Mentorship
                  </button>
                )}

              </div>

            </section>

            {/* Social Links */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                Social Links
              </h2>

              <div className="mt-4 space-y-2">

                {/* LinkedIn */}

                {linkedin ? (
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-[10px] font-bold text-white">
                      in
                    </span>

                    LinkedIn
                  </a>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-slate-400">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-300 text-[10px] font-bold text-white">
                      in
                    </span>

                    LinkedIn not added
                  </div>
                )}

                {/* GitHub */}

                {github ? (
                  <a
                    href={github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white">
                      GH
                    </span>

                    GitHub
                  </a>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-slate-400">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-300 text-[9px] font-bold text-white">
                      GH
                    </span>

                    GitHub not added
                  </div>
                )}

                {/* Portfolio */}

                {portfolio ? (
                  <a
                    href={portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Globe
                      size={19}
                      className="text-indigo-600"
                    />

                    Portfolio
                  </a>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-slate-400">
                    <Globe
                      size={19}
                      className="text-slate-400"
                    />

                    Portfolio not added
                  </div>
                )}

              </div>

            </section>

            {/* Achievements */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-lg text-amber-600">
                  ★
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Achievements
                  </h2>

                  <p className="text-sm text-slate-500">
                    Career highlights
                  </p>

                </div>

              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {alumni.achievements ||
                  "No achievements have been added yet."}
              </p>

            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfile;