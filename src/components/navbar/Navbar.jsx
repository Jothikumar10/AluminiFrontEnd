import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  X,
  LogIn,
  UserPlus,
  Users,
  BriefcaseBusiness,
  CalendarDays,
  MessageCircle,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import api from "../../api/axios";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const location = useLocation();

  const navLinks = [
    {
      name: "Alumni",
      path: "/alumni",
      icon: Users,
    },
    {
      name: "Jobs",
      path: "/jobs",
      icon: BriefcaseBusiness,
    },
    {
      name: "Events",
      path: "/events",
      icon: CalendarDays,
    },
  ];

  const navLinkClass = ({ isActive }) =>
    `group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-indigo-50 text-indigo-600"
        : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
    }`;

  // ================= GET UNREAD NOTIFICATION COUNT =================
  const getUnreadNotificationCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUnreadCount(0);
        return;
      }

      const response = await api.get(
        "/notifications/unread-count"
      );

      const count = response?.data?.data?.count;

      setUnreadCount(
        typeof count === "number" ? count : 0
      );
    } catch (error) {
      console.error(
        "Get unread notification count error:",
        error
      );

      setUnreadCount(0);
    }
  }, []);

  // ================= LOAD NOTIFICATION COUNT =================
  useEffect(() => {
    getUnreadNotificationCount();
  }, [getUnreadNotificationCount, location.pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ================= LOGO ================= */}
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-2.5"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-105">
              <GraduationCap className="h-5 w-5 text-white" />

              <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            <div className="hidden sm:block">
              <div className="text-lg font-bold tracking-tight text-slate-900">
                Alumni<span className="text-indigo-600">Connect</span>
              </div>

              <div className="-mt-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-slate-400">
                Connect • Learn • Grow
              </div>
            </div>
          </Link>

          {/* ================= DESKTOP SEARCH ================= */}
          <div className="hidden flex-1 justify-center px-4 lg:flex">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search alumni, jobs, skills..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          </div>

          {/* ================= DESKTOP NAVIGATION ================= */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={navLinkClass}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            {/* Community */}
            <NavLink
              to="/community"
              className={navLinkClass}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Community</span>
            </NavLink>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />

              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          </nav>

          {/* ================= DESKTOP AUTH ================= */}
          <div className="hidden items-center gap-2 md:flex">

            <Link
              to="/login"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>

            <Link
              to="/register"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
            >
              <UserPlus className="h-4 w-4" />
              Register
            </Link>
          </div>

          {/* ================= MOBILE ACTIONS ================= */}
          <div className="flex items-center gap-1 md:hidden">

            {/* Mobile Notifications */}
            <Link
              to="/notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />

              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1 flex h-2.5 min-w-2.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[7px] font-bold text-white">
                  {unreadCount > 9 ? "" : unreadCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((prev) => !prev)
              }
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 md:hidden ${
          mobileMenuOpen
            ? "max-h-[650px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 pb-5 pt-4 sm:px-6">

          {/* Mobile Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search alumni, jobs, skills..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {/* Mobile Navigation */}
          <div className="space-y-1">

            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClass}
            >
              <Sparkles className="h-4 w-4" />
              Home
            </NavLink>

            {navLinks.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClass}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              );
            })}

            <NavLink
              to="/community"
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClass}
            >
              <MessageCircle className="h-4 w-4" />
              Community
            </NavLink>

            {/* Mobile Notifications */}
            <NavLink
              to="/notifications"
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClass}
            >
              <div className="relative">
                <Bell className="h-4 w-4" />

                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[7px] font-bold text-white">
                    {unreadCount > 9 ? "" : unreadCount}
                  </span>
                )}
              </div>

              <span>Notifications</span>

              {unreadCount > 0 && (
                <span className="ml-auto rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          </div>

          {/* Mobile Auth */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">

            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>

            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <UserPlus className="h-4 w-4" />
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;