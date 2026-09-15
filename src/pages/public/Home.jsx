import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  MessageCircle,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

function Home() {
  const features = [
    {
      icon: Users,
      title: "Connect with Alumni",
      description:
        "Discover graduates from your college based on company, role, skills, location, and graduation year.",
    },
    {
      icon: BriefcaseBusiness,
      title: "Find Opportunities",
      description:
        "Explore jobs and internships shared by alumni, recruiters, and your college community.",
    },
    {
      icon: MessageCircle,
      title: "Get Mentorship",
      description:
        "Connect with experienced alumni for career guidance, technical discussions, and interview preparation.",
    },
  ];

  const stats = [
    {
      value: "500+",
      label: "Alumni",
      icon: Users,
    },
    {
      value: "100+",
      label: "Opportunities",
      icon: BriefcaseBusiness,
    },
    {
      value: "50+",
      label: "Mentors",
      icon: GraduationCap,
    },
    {
      value: "25+",
      label: "Events",
      icon: CalendarDays,
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create your profile",
      description:
        "Build your professional profile with your education, skills, interests, projects, and career goals.",
    },
    {
      number: "02",
      title: "Discover your network",
      description:
        "Find alumni, mentors, opportunities, events, and communities that match your interests.",
    },
    {
      number: "03",
      title: "Grow your career",
      description:
        "Learn from real career journeys, apply for opportunities, and build meaningful professional relationships.",
    },
  ];

  return (
    <main className="overflow-hidden bg-white">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section className="relative isolate overflow-hidden bg-slate-950">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />

          <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[100px]" />

          <div className="absolute -right-40 top-40 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[100px]" />
        </div>

        {/* Grid */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">

          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">

            {/* Hero Content */}
            <div className="text-center lg:text-left">

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-indigo-200 backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Your college network, reimagined
              </div>

              <h1 className="mt-7 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                Connect with your
                <span className="block bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">
                  alumni. Build your future.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg lg:mx-0">
                AlumniConnect brings students, alumni, faculty, and career
                opportunities together in one professional community.
              </p>

              {/* CTA */}
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">

                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white shadow-xl shadow-indigo-900/30 transition hover:bg-indigo-500"
                >
                  Join AlumniConnect

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/alumni"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Explore Alumni
                </Link>

              </div>

              {/* Trust indicators */}
              <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-400 lg:justify-start">

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Verified alumni
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Career opportunities
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Mentorship
                </div>

              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">

              {/* Main card */}
              <div className="relative rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur-xl">

                <div className="rounded-2xl bg-white p-5 shadow-xl">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Career Network
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-slate-900">
                        Find your people
                      </h3>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>

                  </div>

                  {/* Search */}
                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <Search className="h-4 w-4 text-slate-400" />

                    <span className="text-sm text-slate-400">
                      Search alumni by skills...
                    </span>
                  </div>

                  {/* Profile cards */}
                  <div className="mt-5 space-y-3">

                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
                        AK
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          Arun Kumar
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          Software Engineer · Chennai
                        </p>
                      </div>

                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
                        Mentor
                      </span>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-600">
                        SP
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          Sneha Priya
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          Product Designer · Bengaluru
                        </p>
                      </div>

                      <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-600">
                        Alumni
                      </span>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 font-semibold text-amber-600">
                        RV
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          Rahul V
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          Java Developer · Hyderabad
                        </p>
                      </div>

                      <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-600">
                        Expert
                      </span>
                    </div>

                  </div>

                </div>

                {/* Floating notification */}
                <div className="absolute -right-3 top-10 hidden rounded-2xl border border-white/10 bg-white p-3 shadow-xl sm:block">
                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        New opportunity
                      </p>

                      <p className="text-[11px] text-slate-500">
                        Posted by an alumnus
                      </p>
                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          STATS
      ===================================================== */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 sm:divide-y-0">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="flex items-center gap-4 px-5 py-7 sm:justify-center"
              >
                <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 sm:flex">
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>

                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>

                  <p className="text-sm text-slate-500">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-indigo-600">
              Everything in one place
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              More than an alumni directory
            </h2>

            <p className="mt-4 text-slate-600">
              A complete career and professional networking platform built
              around your college community.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 transition group-hover:bg-indigo-600">
                    <Icon className="h-6 w-6 text-indigo-600 transition group-hover:text-white" />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600">
                    {feature.description}
                  </p>

                  <Link
                    to="/register"
                    className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600"
                  >
                    Learn more
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                Simple process
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Start building your career network today.
              </h2>

              <p className="mt-5 leading-7 text-slate-600">
                AlumniConnect makes it simple to turn your college network
                into meaningful career opportunities.
              </p>

              <Link
                to="/register"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
                    {step.number}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {step.title}
                    </h3>

                    <p className="mt-2 leading-6 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-indigo-600 px-6 py-14 text-center shadow-2xl shadow-indigo-200 sm:px-12">

          <div className="mx-auto max-w-2xl">

            <GraduationCap className="mx-auto h-10 w-10 text-indigo-200" />

            <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
              Your next opportunity could start with your alumni network.
            </h2>

            <p className="mt-4 leading-7 text-indigo-100">
              Join AlumniConnect and discover the people, knowledge, and
              opportunities that can help you move forward.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                to="/register"
                className="rounded-xl bg-white px-6 py-3.5 font-semibold text-indigo-600 transition hover:bg-indigo-50"
              >
                Create your account
              </Link>

              <Link
                to="/alumni"
                className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 font-semibold text-white transition hover:bg-white/15"
              >
                Explore alumni
              </Link>

            </div>

          </div>
        </div>
      </section>

    </main>
  );
}

export default Home;