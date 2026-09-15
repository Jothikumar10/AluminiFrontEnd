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
} from "lucide-react";

import api from "../../api/axios";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    graduationYear: "",
    college: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const {
      name,
      email,
      password,
      confirmPassword,
      department,
      graduationYear,
      college,
    } = formData;

    // Name validation
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    // Email validation
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    // Password validation
    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    // Confirm password
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // College validation
    if (!college.trim()) {
      setError("Please enter your college name.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,

        // Public registration is ONLY for students
        role: "student",

        department: department.trim(),

        graduationYear: graduationYear
          ? Number(graduationYear)
          : null,

        college: college.trim(),
      });

      if (response.data?.success) {
        // Save JWT token
        localStorage.setItem("token", response.data.token);

        // Save user information
        if (response.data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
          );
        }

        setSuccess("Student account created successfully!");

        // Redirect after successful registration
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

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="grid lg:grid-cols-2">

            {/* LEFT SIDE */}
            <div className="hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
              <div>
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

                <h2 className="max-w-md text-4xl font-bold leading-tight">
                  Start your career
                  <br />
                  journey with us.
                </h2>

                <p className="mt-6 max-w-md leading-7 text-slate-300">
                  Connect with alumni, discover career opportunities,
                  get guidance and build your professional network.
                </p>
              </div>

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

            {/* RIGHT SIDE */}
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

                {/* HEADING */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900">
                    Create Student Account
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Register as a student or fresher to join
                    AlumniConnect.
                  </p>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle
                      size={19}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{error}</span>
                  </div>
                )}

                {/* SUCCESS */}
                {success && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    <CheckCircle2
                      size={19}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{success}</span>
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* NAME */}
                  <InputField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    icon={<User size={18} />}
                    required
                  />

                  {/* EMAIL */}
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    icon={<Mail size={18} />}
                    required
                  />

                  {/* PASSWORD */}
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
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}
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
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* DEPARTMENT + YEAR */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InputField
                      label="Department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science"
                      icon={<School size={18} />}
                    />

                    <InputField
                      label="Graduation Year"
                      name="graduationYear"
                      type="number"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      placeholder="e.g. 2026"
                      icon={<GraduationCap size={18} />}
                    />
                  </div>

                  {/* COLLEGE */}
                  <InputField
                    label="College"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="Enter your college name"
                    icon={<School size={18} />}
                    required
                  />

                  {/* ACCOUNT TYPE */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      Account Type
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Student / Fresher
                    </p>
                  </div>

                  {/* SUBMIT */}
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
                        Create Student Account
                      </>
                    )}
                  </button>
                </form>

                {/* LOGIN */}
                <p className="mt-7 text-center text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-slate-900 hover:underline"
                  >
                    Login
                  </Link>
                </p>

                {/* STAFF NOTE */}
                <p className="mt-4 text-center text-xs text-slate-400">
                  Alumni and faculty accounts are created through
                  authorized administration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Input Field
|--------------------------------------------------------------------------
*/

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
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
          required={required}
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Feature
|--------------------------------------------------------------------------
*/

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