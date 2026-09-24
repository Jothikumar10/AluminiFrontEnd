import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  User,
  Mail,
  Lock,
  GraduationCap,
  School,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BriefcaseBusiness,
  MapPin,
  Code2,
  Globe,
} from "lucide-react";

import api from "../../api/axios";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",

    department: "",
    graduationYear: "",
    college: "",

    jobRole: "",
    company: "",
    location: "",
    skills: "",
    linkedin: "",
    github: "",
    portfolio: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------------------------------------------------------
  // HANDLE INPUT CHANGE
  // ---------------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ---------------------------------------------------------
  // HANDLE ROLE CHANGE
  // ---------------------------------------------------------

  const handleRoleChange = (role) => {
    setFormData((previous) => ({
      ...previous,
      role,
    }));

    setError("");
    setSuccess("");
  };

  // ---------------------------------------------------------
  // HANDLE REGISTER
  // ---------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const {
      name,
      email,
      password,
      confirmPassword,
      role,
      department,
      graduationYear,
      college,
      jobRole,
      company,
      location,
      skills,
      linkedin,
      github,
      portfolio,
    } = formData;

    // -------------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------------

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!college.trim()) {
      setError("Please enter your college name.");
      return;
    }

    if (!department.trim()) {
      setError("Please enter your department.");
      return;
    }

    if (!graduationYear) {
      setError("Please enter your graduation year.");
      return;
    }

    const currentYear = new Date().getFullYear();

    if (
      Number(graduationYear) < 1950 ||
      Number(graduationYear) > currentYear + 10
    ) {
      setError("Please enter a valid graduation year.");
      return;
    }

    // -------------------------------------------------------
    // ALUMNI VALIDATION
    // -------------------------------------------------------

    if (role === "alumni") {
      if (!jobRole.trim()) {
        setError("Please enter your current job role.");
        return;
      }

      if (!company.trim()) {
        setError("Please enter your company name.");
        return;
      }

      if (!location.trim()) {
        setError("Please enter your current location.");
        return;
      }

      if (!skills.trim()) {
        setError("Please enter at least one skill.");
        return;
      }
    }

    setLoading(true);

    try {
      // -----------------------------------------------------
      // CONVERT SKILLS TO ARRAY
      // -----------------------------------------------------

      const skillsArray = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      // -----------------------------------------------------
      // BASIC REQUEST DATA
      // -----------------------------------------------------

      const requestData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        department: department.trim(),
        graduationYear: Number(graduationYear),
        college: college.trim(),
      };

      // -----------------------------------------------------
      // ALUMNI INFORMATION
      // -----------------------------------------------------

      if (role === "alumni") {
        requestData.jobRole = jobRole.trim();
        requestData.company = company.trim();
        requestData.location = location.trim();
        requestData.skills = skillsArray;
        requestData.linkedin = linkedin.trim();
        requestData.github = github.trim();
        requestData.portfolio = portfolio.trim();
      }

      console.log("Registration request:", requestData);

      // -----------------------------------------------------
      // API REQUEST
      // -----------------------------------------------------

      const response = await api.post(
        "/auth/register",
        requestData
      );

      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      if (response.data?.success) {
        if (response.data.token) {
          localStorage.setItem(
            "token",
            response.data.token
          );
        }

        if (response.data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
          );
        }

        if (role === "alumni") {
          setSuccess(
            "Alumni account created successfully!"
          );
        } else {
          setSuccess(
            "Student account created successfully!"
          );
        }

        setTimeout(() => {
          navigate("/community");
        }, 800);
      } else {
        setError(
          response.data?.message ||
            "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);

      const message =
        error.response?.data?.message ||
        "Unable to create account. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isAlumni = formData.role === "alumni";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="grid lg:grid-cols-2">

            {/* =====================================================
                LEFT SIDE
            ====================================================== */}

            <div className="hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
              <div>
                {/* LOGO */}

                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-bold text-slate-900">
                    AC
                  </div>

                  <div>
                    <h1 className="text-xl font-bold">
                      AlumniConnect
                    </h1>

                    <p className="text-sm text-slate-400">
                      College Alumni Network
                    </p>
                  </div>
                </div>

                {/* HEADING */}

                <h2 className="max-w-md text-4xl font-bold leading-tight">
                  {isAlumni ? (
                    <>
                      Share your
                      <br />
                      experience.
                    </>
                  ) : (
                    <>
                      Start your career
                      <br />
                      journey with us.
                    </>
                  )}
                </h2>

                <p className="mt-6 max-w-md leading-7 text-slate-300">
                  Connect with alumni, discover career
                  opportunities, get guidance and build your
                  professional network.
                </p>
              </div>

              {/* FEATURES */}

              <div className="space-y-4">
                <Feature
                  icon={<GraduationCap size={18} />}
                  text="Connect with college alumni"
                />

                <Feature
                  icon={<School size={18} />}
                  text="Discover jobs and internships"
                />

                <Feature
                  icon={<UserPlus size={18} />}
                  text="Build your professional network"
                />
              </div>
            </div>

            {/* =====================================================
                RIGHT SIDE
            ====================================================== */}

            <div className="p-6 sm:p-10">
              <div className="mx-auto max-w-xl">

                {/* MOBILE LOGO */}

                <div className="mb-6 flex items-center gap-3 lg:hidden">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                    AC
                  </div>

                  <div>
                    <h1 className="font-bold text-slate-900">
                      AlumniConnect
                    </h1>

                    <p className="text-xs text-slate-500">
                      College Alumni Network
                    </p>
                  </div>
                </div>

                {/* =================================================
                    HEADING
                ================================================== */}

                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900">
                    {isAlumni
                      ? "Create Alumni Account"
                      : "Create Student Account"}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {isAlumni
                      ? "Register as an alumni and share your professional journey."
                      : "Register as a student or fresher to join AlumniConnect."}
                  </p>
                </div>

                {/* =================================================
                    ERROR
                ================================================== */}

                {error && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle
                      size={19}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{error}</span>
                  </div>
                )}

                {/* =================================================
                    SUCCESS
                ================================================== */}

                {success && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    <CheckCircle2
                      size={19}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{success}</span>
                  </div>
                )}

                {/* =================================================
                    FORM
                ================================================== */}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* =================================================
                      ACCOUNT TYPE
                  ================================================== */}

                  <div>
                    <label className="mb-3 block text-sm font-medium text-slate-700">
                      Account Type
                    </label>

                    <div className="grid grid-cols-2 gap-3">

                      {/* STUDENT */}

                      <button
                        type="button"
                        onClick={() =>
                          handleRoleChange("student")
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          formData.role === "student"
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
                        }`}
                      >
                        <GraduationCap
                          size={20}
                          className="mb-2"
                        />

                        <p className="text-sm font-semibold">
                          Student / Fresher
                        </p>

                        <p
                          className={`mt-1 text-xs ${
                            formData.role === "student"
                              ? "text-slate-300"
                              : "text-slate-500"
                          }`}
                        >
                          Looking for career opportunities
                        </p>
                      </button>

                      {/* ALUMNI */}

                      <button
                        type="button"
                        onClick={() =>
                          handleRoleChange("alumni")
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          formData.role === "alumni"
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
                        }`}
                      >
                        <UserPlus
                          size={20}
                          className="mb-2"
                        />

                        <p className="text-sm font-semibold">
                          Alumni
                        </p>

                        <p
                          className={`mt-1 text-xs ${
                            formData.role === "alumni"
                              ? "text-slate-300"
                              : "text-slate-500"
                          }`}
                        >
                          Share experience and mentor
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* =================================================
                      NAME
                  ================================================== */}

                  <InputField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    icon={<User size={18} />}
                    autoComplete="name"
                    required
                  />

                  {/* =================================================
                      EMAIL
                  ================================================== */}

                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    icon={<Mail size={18} />}
                    autoComplete="email"
                    required
                  />

                  {/* =================================================
                      PASSWORD
                  ================================================== */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Password
                    </label>

                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 6 characters"
                        autoComplete="new-password"
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-12 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (previous) => !previous
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* =================================================
                      CONFIRM PASSWORD
                  ================================================== */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Confirm Password
                    </label>

                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-12 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (previous) => !previous
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* =================================================
                      DEPARTMENT + GRADUATION YEAR
                  ================================================== */}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <InputField
                      label="Department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science"
                      icon={<School size={18} />}
                      required
                    />

                    <InputField
                      label="Graduation Year"
                      name="graduationYear"
                      type="number"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      placeholder="e.g. 2022"
                      icon={<GraduationCap size={18} />}
                      required
                    />
                  </div>

                  {/* =================================================
                      COLLEGE
                  ================================================== */}

                  <InputField
                    label="College"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="Enter your college name"
                    icon={<School size={18} />}
                    autoComplete="organization"
                    required
                  />

                  {/* =================================================
                      ALUMNI INFORMATION
                  ================================================== */}

                  {isAlumni && (
                    <div className="space-y-5 border-t border-slate-200 pt-5">

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Professional Information
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Add your current professional details.
                        </p>
                      </div>

                      {/* JOB ROLE */}

                      <InputField
                        label="Current Job Role"
                        name="jobRole"
                        value={formData.jobRole}
                        onChange={handleChange}
                        placeholder="e.g. Software Engineer"
                        icon={
                          <BriefcaseBusiness size={18} />
                        }
                        required
                      />

                      {/* COMPANY */}

                      <InputField
                        label="Company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="e.g. TCS"
                        icon={
                          <BriefcaseBusiness size={18} />
                        }
                        autoComplete="organization"
                        required
                      />

                      {/* LOCATION */}

                      <InputField
                        label="Current Location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Chennai"
                        icon={<MapPin size={18} />}
                        autoComplete="address-level2"
                        required
                      />

                      {/* SKILLS */}

                      <InputField
                        label="Skills"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="React.js, Node.js, MongoDB, Java"
                        icon={<Code2 size={18} />}
                        required
                      />

                      <p className="-mt-3 text-xs text-slate-400">
                        Separate multiple skills with commas.
                      </p>

                      {/* LINKEDIN */}

                      <InputField
                        label="LinkedIn Profile"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/your-profile"
                        icon={
                          <span className="text-sm font-bold">
                            in
                          </span>
                        }
                      />

                      {/* GITHUB */}

                      <InputField
                        label="GitHub Profile"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        placeholder="https://github.com/your-username"
                        icon={
                          <span className="text-sm font-bold">
                            GH
                          </span>
                        }
                      />

                      {/* PORTFOLIO */}

                      <InputField
                        label="Portfolio Website"
                        name="portfolio"
                        value={formData.portfolio}
                        onChange={handleChange}
                        placeholder="https://yourportfolio.com"
                        icon={<Globe size={18} />}
                      />
                    </div>
                  )}

                  {/* =================================================
                      ACCOUNT INFORMATION
                  ================================================== */}

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      Account Type
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {isAlumni
                        ? "Alumni"
                        : "Student / Fresher"}
                    </p>
                  </div>

                  {/* =================================================
                      SUBMIT
                  ================================================== */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Creating account...
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />

                        {isAlumni
                          ? "Create Alumni Account"
                          : "Create Student Account"}
                      </>
                    )}
                  </button>
                </form>

                {/* =================================================
                    LOGIN
                ================================================== */}

                <p className="mt-7 text-center text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-slate-900 hover:underline"
                  >
                    Login
                  </Link>
                </p>

                {/* =================================================
                    NOTE
                ================================================== */}

                <p className="mt-4 text-center text-xs text-slate-400">
                  Alumni registration requires the backend to
                  allow the <strong>alumni</strong> role.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================
// INPUT FIELD COMPONENT
// =============================================================

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  autoComplete,
  required = false,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
      </div>
    </div>
  );
};

// =============================================================
// FEATURE COMPONENT
// =============================================================

const Feature = ({ icon, text }) => {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
        {icon}
      </div>

      <span>{text}</span>
    </div>
  );
};

export default Register;