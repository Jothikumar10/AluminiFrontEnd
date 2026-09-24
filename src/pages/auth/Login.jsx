import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  BriefcaseBusiness,
  Users,
} from "lucide-react";

import api from "../../api/axios";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
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

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.data?.success) {
        /*
         * ---------------------------------------------------------
         * SAVE JWT TOKEN
         * ---------------------------------------------------------
         */

        if (response.data.token) {
          localStorage.setItem(
            "token",
            response.data.token
          );
        }

        /*
         * ---------------------------------------------------------
         * SAVE LOGGED-IN USER
         * ---------------------------------------------------------
         */

        if (response.data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
          );
        }

        /*
         * ---------------------------------------------------------
         * GET USER ROLE
         * ---------------------------------------------------------
         */

        const user = response.data.user;
        const role = user?.role;

        console.log("Logged-in user:", user);
        console.log("User role:", role);

        /*
         * ---------------------------------------------------------
         * SUCCESS MESSAGE
         * ---------------------------------------------------------
         */

        if (role === "alumni") {
          setSuccess(
            "Alumni login successful! Redirecting to your profile..."
          );
        } else if (role === "student") {
          setSuccess(
            "Student login successful! Redirecting to your profile..."
          );
        } else {
          setSuccess(
            "Login successful! Redirecting..."
          );
        }

        /*
         * ---------------------------------------------------------
         * ROLE-BASED REDIRECT
         * ---------------------------------------------------------
         *
         * Student  → /profile
         *
         * Alumni   → /alumni-profile/:userId
         *
         * Other    → /community
         */

        setTimeout(() => {
          if (role === "alumni" && user?._id) {
            navigate(
              `/alumni-profile/${user._id}`
            );
          } else if (role === "student") {
            navigate("/profile");
          } else {
            navigate("/community");
          }
        }, 700);
      } else {
        setError(
          response.data?.message ||
            "Login failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Login error:", error);

      const message =
        error.response?.data?.message ||
        "Unable to login. Please check your connection and try again.";

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

            {/* =========================================================
                LEFT SIDE
            ========================================================= */}

            <div className="hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
              <div>

                {/* Logo */}

                <div className="mb-10 flex items-center gap-3">
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

                {/* Heading */}

                <h2 className="max-w-md text-4xl font-bold leading-tight">
                  Welcome back to
                  <br />
                  AlumniConnect.
                </h2>

                <p className="mt-6 max-w-md leading-7 text-slate-300">
                  Connect with your college community, learn from
                  alumni, discover opportunities and grow your career.
                </p>
              </div>

              {/* Features */}

              <div className="space-y-4">
                <Feature
                  icon={<GraduationCap size={18} />}
                  text="Learn from experienced alumni"
                />

                <Feature
                  icon={<BriefcaseBusiness size={18} />}
                  text="Discover jobs and internships"
                />

                <Feature
                  icon={<Users size={18} />}
                  text="Build your professional network"
                />
              </div>
            </div>

            {/* =========================================================
                RIGHT SIDE
            ========================================================= */}

            <div className="p-6 sm:p-10 lg:p-12">
              <div className="mx-auto max-w-md">

                {/* Mobile Logo */}

                <div className="mb-8 flex items-center gap-3 lg:hidden">
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

                {/* Heading */}

                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900">
                    Welcome back
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Login to continue to your AlumniConnect account.
                  </p>
                </div>

                {/* Error */}

                {error && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle
                      size={19}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{error}</span>
                  </div>
                )}

                {/* Success */}

                {success && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    <CheckCircle2
                      size={19}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{success}</span>
                  </div>
                )}

                {/* Form */}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* Email */}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        autoComplete="email"
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />
                    </div>
                  </div>

                  {/* Password */}

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-slate-700"
                      >
                        Password
                      </label>
                    </div>

                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        autoComplete="current-password"
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
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}

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

                        Logging in...
                      </>
                    ) : (
                      <>
                        <LogIn size={18} />

                        Login
                      </>
                    )}
                  </button>
                </form>

                {/* Register */}

                <p className="mt-7 text-center text-sm text-slate-500">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-slate-900 hover:underline"
                  >
                    Create Student Account
                  </Link>
                </p>

                {/* Account Information */}

                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-center text-xs leading-5 text-slate-500">
                    Alumni and faculty accounts use their authorized
                    accounts created through the administration
                    process.
                  </p>
                </div>

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
| Feature Component
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

export default Login;