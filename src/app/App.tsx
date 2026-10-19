import { useState, useEffect, useRef } from "react";
import logoImg from "../imports/image.png";
import {
  Menu,
  Sparkles,
  Zap,
  MessageSquare,
  Shield,
  Mail,
  Instagram,
  Twitter,
  X,
  CheckCircle,
  MapPin,
  Calendar,
  Bell,
  Star,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Clock,
  Users,
  ArrowRight,
  Upload,
  Building2,
  Copy,
  Check,
  Rocket,
  Newspaper,
  ExternalLink,
} from "lucide-react";
import { postForm, postJson } from "./api";

type Page =
  | "home"
  | "about"
  | "crewbhook"
  | "careers"
  | "partner"
  | "job-detail"
  | "roadmap"
  | "press"
  | "privacy";

type Job = {
  id: string;
  title: string;
  type: string;
  duration: string;
  location: string;
  department: string;
  tagColor: "teal" | "orange";
  badge: string;
  applyColor: "teal" | "orange";
  about: string;
  responsibilities: string[];
  skills: string[];
  niceToHave: string[];
  benefits: { icon: string; title: string; desc: string }[];
};

const JOBS: Job[] = [];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [waitlistSubmitted, setWaitlistSubmitted] =
    useState(false);
  const [contactSubmitted, setContactSubmitted] =
    useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(
    null,
  );
  const [applicationSubmitted, setApplicationSubmitted] =
    useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [activeJobId, setActiveJobId] = useState<string>("");
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [partnerSlider, setPartnerSlider] = useState(20);
  const [referralCopied, setReferralCopied] = useState(false);
  const [featureVotes, setFeatureVotes] = useState<Record<string, boolean>>({});
  const [wishlistSubmitted, setWishlistSubmitted] = useState(false);
  const [wishlistIdea, setWishlistIdea] = useState("");
  const [cookieDismissed, setCookieDismissed] = useState(false);
  const [waitlistError, setWaitlistError] = useState("");
  const [waitlistPending, setWaitlistPending] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactPending, setContactPending] = useState(false);
  const [applicationError, setApplicationError] = useState("");
  const [applicationPending, setApplicationPending] = useState(false);
  const [partnerError, setPartnerError] = useState("");
  const [partnerPending, setPartnerPending] = useState(false);
  const [ideaError, setIdeaError] = useState("");
  const [ideaPending, setIdeaPending] = useState(false);

  const sectionTarget = useRef<string | null>(null);

  const navigateTo = (page: Page, section?: string) => {
    sectionTarget.current = section ?? null;
    setMobileMenuOpen(false);
    if (page === currentPage) {
      if (section) {
        document.getElementById(section)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      sectionTarget.current = null;
      return;
    }
    setCurrentPage(page);
  };

  useEffect(() => {
    const section = sectionTarget.current;
    sectionTarget.current = null;
    if (section) {
      const frame = requestAnimationFrame(() => {
        document.getElementById(section)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Animate waitlist counter on mount
  useEffect(() => {
    const target = 8247;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setWaitlistCount(target);
        clearInterval(timer);
      } else {
        setWaitlistCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const handleWaitlistSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") || "");
    setWaitlistError("");
    setWaitlistPending(true);
    try {
      await postJson("/api/waitlist", { email });
      setWaitlistSubmitted(true);
    } catch (err) {
      setWaitlistError(err instanceof Error ? err.message : "Could not join the waitlist");
    } finally {
      setWaitlistPending(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setContactError("");
    setContactPending(true);
    try {
      await postJson("/api/contact", {
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        message: String(data.get("message") || ""),
      });
      setContactSubmitted(true);
    } catch (err) {
      setContactError(err instanceof Error ? err.message : "Could not send the message");
    } finally {
      setContactPending(false);
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const job = JOBS.find((item) => item.id === activeJobId);
    if (!job) return;
    const data = new FormData(e.currentTarget);
    data.set("roleId", job.id);
    data.set("roleTitle", job.title);
    setApplicationError("");
    setApplicationPending(true);
    try {
      await postForm("/api/applications", data);
      setApplicationSubmitted(true);
    } catch (err) {
      setApplicationError(err instanceof Error ? err.message : "Could not send the application");
    } finally {
      setApplicationPending(false);
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setPartnerError("");
    setPartnerPending(true);
    try {
      await postJson("/api/partners", {
        fullName: String(data.get("fullName") || ""),
        phone: String(data.get("phone") || ""),
        experience: String(data.get("experience") || ""),
        location: String(data.get("location") || ""),
      });
      setPartnerSubmitted(true);
    } catch (err) {
      setPartnerError(err instanceof Error ? err.message : "Could not send the application");
    } finally {
      setPartnerPending(false);
    }
  };

  const handleIdeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishlistIdea.trim()) return;
    setIdeaError("");
    setIdeaPending(true);
    try {
      await postJson("/api/ideas", { body: wishlistIdea.trim() });
      setWishlistSubmitted(true);
    } catch (err) {
      setIdeaError(err instanceof Error ? err.message : "Could not save that idea");
    } finally {
      setIdeaPending(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-100/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-12">
          <button
            onClick={() => navigateTo("home")}
            className="group flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-900 p-2.5 shadow-lg shadow-slate-900/30 transition-transform duration-300 group-hover:scale-105">
              <img
                src={logoImg}
                alt="Tour Bhook"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-slate-900 text-left">
                Tour{" "}
                <span className="bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                  Bhook
                </span>
              </span>
              <span className="text-[10px] text-slate-500 -mt-1">
                A Pramahar Technologies Product
              </span>
            </div>
          </button>

          <div className="hidden space-x-8 text-sm font-medium text-slate-500 md:flex">
            <button
              onClick={() => navigateTo("home")}
              className={`transition-colors hover:text-slate-900 ${currentPage === "home" ? "font-semibold text-slate-900" : ""}`}
            >
              Home
            </button>
            <button
              onClick={() => navigateTo("about")}
              className={`transition-colors hover:text-slate-900 ${currentPage === "about" ? "font-semibold text-slate-900" : ""}`}
            >
              About us
            </button>

            <button
              onClick={() => navigateTo("crewbhook")}
              className={`transition-colors hover:text-slate-900 ${currentPage === "crewbhook" || currentPage === "careers" || currentPage === "job-detail" ? "font-semibold text-slate-900" : ""}`}
            >
              crewBhook
            </button>
            <button
              onClick={() => navigateTo("partner")}
              className={`transition-colors hover:text-slate-900 ${currentPage === "partner" ? "font-semibold text-slate-900" : ""}`}
            >
              Partner
            </button>
            <button
              onClick={() => navigateTo("home", "contact")}
              className="transition-colors hover:text-slate-900"
            >
              Contact
            </button>
            <button
              onClick={() => navigateTo("home", "waitlist")}
              className="rounded-full bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-2 font-semibold text-white shadow-lg shadow-teal-500/20 transition-all hover:shadow-xl hover:shadow-teal-500/30"
            >
              Join Waitlist
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-900"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-6 shadow-lg">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => navigateTo("home")}
                className={`text-left font-medium ${currentPage === "home" ? "text-teal-600" : "text-slate-600"}`}
              >
                Home
              </button>
              <button
                onClick={() => navigateTo("about")}
                className={`text-left font-medium ${currentPage === "about" ? "text-teal-600" : "text-slate-600"}`}
              >
                About us
              </button>
              <button
                onClick={() => navigateTo("home", "services")}
                className="text-left font-medium text-slate-600"
              >
                Our services
              </button>
              <button
                onClick={() => navigateTo("crewbhook")}
                className={`text-left font-medium ${currentPage === "crewbhook" || currentPage === "careers" || currentPage === "job-detail" ? "text-teal-600" : "text-slate-600"}`}
              >
                crewBhook
              </button>
              <button
                onClick={() => navigateTo("home", "contact")}
                className="text-left font-medium text-slate-600"
              >
                Contact
              </button>
              <button
                onClick={() => navigateTo("partner")}
                className={`text-left font-medium ${currentPage === "partner" ? "text-teal-600" : "text-slate-600"}`}
              >
                Partner
              </button>
              <button
                onClick={() => navigateTo("home", "waitlist")}
                className="rounded-full bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-2 font-semibold text-white shadow-lg"
              >
                Join Waitlist
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {/* Home Page */}
        {currentPage === "home" && (
          <div className="animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="mx-auto mb-12 max-w-7xl px-4 pt-4 md:mb-20 md:px-8 md:pt-6">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl md:h-[700px] md:rounded-[2.5rem]">
                <img
                  src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2838&auto=format&fit=crop"
                  alt="Bali Temple"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/75 md:bg-gradient-to-r md:from-black/70 md:via-black/40 md:to-transparent"></div>
                <div className="relative flex flex-col justify-center px-5 py-8 text-white sm:px-8 md:absolute md:inset-0 md:max-w-3xl md:px-16 md:py-0">
                  <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                    <Sparkles className="h-3 w-3 text-teal-300" />{" "}
                    AI-Optimized Travel
                  </div>
                  <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl md:mb-6 md:text-7xl">
                    Tour Bhook: The Smart Way to{" "}
                    <span className="bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">
                      Explore the World
                    </span>
                  </h1>
                  <p className="mb-6 max-w-2xl text-base text-gray-100 sm:text-lg md:mb-10 md:text-xl">
                    Minimize planning time and maximize
                    discovery. We use intelligent routing to
                    build your perfect journey.
                  </p>

                  {/* App Store Buttons */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <a
                      href="https://play.google.com/store"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex w-full items-center gap-3 rounded-2xl bg-black px-5 py-3 transition-all hover:bg-gray-900 sm:w-auto sm:px-6 sm:py-3.5 sm:hover:scale-105"
                    >
                      <svg
                        className="h-8 w-8"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92z"
                          fill="#32BBFF"
                        />
                        <path
                          d="M14.5 12.707l3.842 3.842-10.55 6.067a.992.992 0 01-.483.127l7.191-7.19v-.846z"
                          fill="#32BBFF"
                        />
                        <path
                          d="M18.342 16.549l3.385-1.947a1 1 0 000-1.747l-3.385-1.948L14.5 14.75l3.842 1.799z"
                          fill="#32BBFF"
                        />
                        <path
                          d="M14.5 9.293L3.309 1.687a.992.992 0 01.483-.127l10.55 6.067 4.191 4.193-4.033-2.527z"
                          fill="#32BBFF"
                        />
                      </svg>
                      <div className="text-left">
                        <div className="text-[10px] font-medium uppercase tracking-wide text-gray-300">
                          Get it on
                        </div>
                        <div className="text-lg font-bold text-white">
                          Google Play
                        </div>
                      </div>
                    </a>

                    <a
                      href="https://apps.apple.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex w-full items-center gap-3 rounded-2xl bg-black px-5 py-3 transition-all hover:bg-gray-900 sm:w-auto sm:px-6 sm:py-3.5 sm:hover:scale-105"
                    >
                      <svg
                        className="h-8 w-8"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                      </svg>
                      <div className="text-left">
                        <div className="text-[10px] font-medium uppercase tracking-wide text-gray-300">
                          Download on the
                        </div>
                        <div className="text-lg font-bold text-white">
                          App Store
                        </div>
                      </div>
                    </a>
                  </div>

                  {/* Waitlist Counter */}
                  <div className="mt-6">
                    <div className="flex w-full items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md sm:w-fit sm:px-5">
                      <div className="flex h-12 min-w-12 items-center justify-center rounded-full bg-teal-500/20 px-2">
                        <span className="text-sm font-bold text-white">
                          {(waitlistCount / 1000).toFixed(1)}k+
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-white">
                          Early Adopters
                        </div>
                        <div className="text-xs text-gray-300">
                          Already on waitlist
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mx-auto mb-24 max-w-4xl px-6 text-center">
              <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-600">
                The Tour Bhook Promise
              </div>
              <h2 className="mb-12 text-4xl font-bold text-slate-900 md:text-5xl">
                Travel Smarter, Not Harder
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 p-8 shadow-lg">
                  <div className="mb-2 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-6xl font-bold text-transparent">
                    ~30%
                  </div>
                  <div className="text-slate-600 font-medium">
                    Travel Time Saved
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 p-8 shadow-lg">
                  <div className="mb-2 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-6xl font-bold text-transparent">
                    Zero
                  </div>
                  <div className="text-slate-600 font-medium">
                    Information Noise
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-8 shadow-lg">
                  <div className="mb-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-6xl font-bold text-transparent">
                    100%
                  </div>
                  <div className="text-slate-600 font-medium">
                    Personalized for You
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="mx-auto max-w-7xl px-6 py-20">
              <div className="mb-16 text-center">
                <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-600">
                  Simple Process
                </div>
                <h2 className="text-4xl font-bold text-slate-900 md:text-5xl">
                  How Tour Bhook Works
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
                  From planning to exploring in just a few taps
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                {/* Step 1 */}
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-xl shadow-teal-500/30">
                    <MapPin className="h-8 w-8" />
                  </div>
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-600">
                    1
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">
                    Choose Destination
                  </h3>
                  <p className="text-slate-500">
                    Select where you want to go and your
                    interests
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-xl shadow-violet-500/30">
                    <Zap className="h-8 w-8" />
                  </div>
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">
                    2
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">
                    AI Plans Your Route
                  </h3>
                  <p className="text-slate-500">
                    Our AI optimizes the best path to save you
                    time
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/30">
                    <Calendar className="h-8 w-8" />
                  </div>
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                    3
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">
                    Review Itinerary
                  </h3>
                  <p className="text-slate-500">
                    Get curated recommendations with AI
                    summaries
                  </p>
                </div>

                {/* Step 4 */}
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/30">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600">
                    4
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">
                    Start Exploring
                  </h3>
                  <p className="text-slate-500">
                    Follow your optimized route and enjoy the
                    journey
                  </p>
                </div>
              </div>
            </div>

            {/* Phone Mockups Section */}
            <div className="bg-gradient-to-b from-slate-50 to-white py-20">
              <div className="mx-auto max-w-7xl px-6">
                <div className="mb-12 text-center">
                  <h2 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">
                    Experience the Future of Travel Planning
                  </h2>
                  <p className="mx-auto max-w-2xl text-lg text-slate-500">
                    Intuitive design meets powerful AI to create
                    the perfect travel companion
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-8">
                  {/* Phone Mockup 1 */}
                  <div className="group relative">
                    <div className="absolute -inset-1 rounded-[3rem] bg-gradient-to-r from-teal-500 to-emerald-500 opacity-75 blur-xl transition duration-1000 group-hover:opacity-100"></div>
                    <div className="relative h-[520px] w-full max-w-[280px] overflow-hidden rounded-[3rem] border-8 border-slate-900 bg-white shadow-2xl sm:h-[600px]">
                      <div className="flex h-full flex-col bg-gradient-to-b from-teal-50 to-white p-6">
                        <div className="mb-6 text-center">
                          <h3 className="text-2xl font-bold text-slate-900">
                            Discover Bali
                          </h3>
                          <p className="text-sm text-slate-500">
                            AI-Optimized Route
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-2xl bg-white p-4 shadow-lg">
                            <div className="mb-2 flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-teal-600" />
                              <span className="font-semibold text-slate-900">
                                Tanah Lot Temple
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              Ancient sea temple with stunning
                              sunset views
                            </p>
                            <div className="mt-2 flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className="h-3 w-3 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                              <span className="ml-1 text-xs text-slate-500">
                                4.8
                              </span>
                            </div>
                          </div>
                          <div className="rounded-2xl bg-white p-4 shadow-lg">
                            <div className="mb-2 flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-violet-600" />
                              <span className="font-semibold text-slate-900">
                                Ubud Monkey Forest
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              Sacred sanctuary with playful
                              monkeys
                            </p>
                            <div className="mt-2 flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className="h-3 w-3 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                              <span className="ml-1 text-xs text-slate-500">
                                4.7
                              </span>
                            </div>
                          </div>
                          <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 p-4 text-white shadow-lg">
                            <div className="mb-2 flex items-center gap-2">
                              <Zap className="h-5 w-5" />
                              <span className="font-semibold">
                                Optimized Route
                              </span>
                            </div>
                            <p className="text-xs text-teal-100">
                              Save 2.5 hours with our AI routing
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone Mockup 2 */}
                  <div className="group relative">
                    <div className="absolute -inset-1 rounded-[3rem] bg-gradient-to-r from-violet-500 to-purple-500 opacity-75 blur-xl transition duration-1000 group-hover:opacity-100"></div>
                    <div className="relative h-[520px] w-full max-w-[280px] overflow-hidden rounded-[3rem] border-8 border-slate-900 bg-white shadow-2xl sm:h-[600px]">
                      <div className="flex h-full flex-col bg-gradient-to-b from-violet-50 to-white p-6">
                        <div className="mb-6 text-center">
                          <h3 className="text-2xl font-bold text-slate-900">
                            Your Itinerary
                          </h3>
                          <p className="text-sm text-slate-500">
                            Day 1 of 5
                          </p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-md">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-xs font-bold text-teal-600">
                              9AM
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900">
                                Breakfast at Cafe Organic
                              </div>
                              <p className="text-xs text-slate-500">
                                30 min
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-md">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-600">
                              11AM
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900">
                                Tanah Lot Temple
                              </div>
                              <p className="text-xs text-slate-500">
                                2 hours
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-md">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-xs font-bold text-orange-600">
                              2PM
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900">
                                Lunch at Warung Local
                              </div>
                              <p className="text-xs text-slate-500">
                                1 hour
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 p-4 text-center text-white shadow-lg">
                            <Bell className="mx-auto mb-2 h-6 w-6" />
                            <p className="text-xs font-semibold">
                              Reminders Active
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div
              id="services"
              className="scroll-mt-24 bg-gradient-to-b from-white to-slate-50 py-20"
            >
              <div className="mx-auto max-w-7xl px-6">
                <div className="mb-16 text-center">
                  <h2 className="text-4xl font-bold text-slate-900 md:text-5xl">
                    Intelligent Travel Planning
                  </h2>
                  <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
                    We've solved the biggest travel
                    headaches—inefficient routes and unreliable
                    info.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                  <div className="group flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-2">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600 shadow-xl shadow-teal-500/10 transition-all group-hover:shadow-2xl group-hover:shadow-teal-500/20">
                      <Zap className="h-10 w-10" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-slate-900">
                      Smart Route Optimization
                    </h3>
                    <p className="px-4 leading-relaxed text-slate-500">
                      Our engine calculates the most
                      time-efficient path for your trip, saving
                      you hours.
                    </p>
                  </div>
                  <div className="group flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-2">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-50 to-violet-100 text-violet-600 shadow-xl shadow-violet-500/10 transition-all group-hover:shadow-2xl group-hover:shadow-violet-500/20">
                      <MessageSquare className="h-10 w-10" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-slate-900">
                      Instant Review Summaries
                    </h3>
                    <p className="px-4 leading-relaxed text-slate-500">
                      We provide a single, concise AI summary of
                      what matters most about every location.
                    </p>
                  </div>
                  <div className="group flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-2">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 shadow-xl shadow-emerald-500/10 transition-all group-hover:shadow-2xl group-hover:shadow-emerald-500/20">
                      <Shield className="h-10 w-10" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-slate-900">
                      Trusted Content Only
                    </h3>
                    <p className="px-4 leading-relaxed text-slate-500">
                      Our strict zero-tolerance moderation
                      ensures you only see authentic
                      recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mx-auto max-w-4xl px-6 py-20">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg text-slate-500">
                  Everything you need to know about Tour Bhook
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    question: "Is Tour Bhook free to use?",
                    answer:
                      "Tour Bhook will offer both free and premium tiers. The free version includes basic route optimization and destination guides. Premium features include advanced AI planning, offline maps, and priority support. We'll announce pricing details closer to launch.",
                  },
                  {
                    question: "When will Tour Bhook launch?",
                    answer:
                      "We're currently in closed beta and working hard to perfect the experience. Waitlist members will get early access starting Q3 2026. Join the waitlist to be first in line when we launch!",
                  },
                  {
                    question: "What destinations do you cover?",
                    answer:
                      "We're launching with comprehensive coverage of Southeast Asia, including Bali, Thailand, Vietnam, and Singapore. We'll expand to Europe, North America, and other regions based on user demand. Each destination includes curated recommendations and AI-optimized routing.",
                  },
                  {
                    question:
                      "How does the AI route optimization work?",
                    answer:
                      "Our AI analyzes millions of data points including travel times, opening hours, crowd patterns, and user preferences to create the most efficient route. We factor in real-time traffic, weather, and seasonal trends to save you hours of travel time.",
                  },
                  {
                    question: "Can I use Tour Bhook offline?",
                    answer:
                      "Yes! Premium users can download maps and itineraries for offline access. Your planned routes, saved places, and AI summaries will be available even without internet connection.",
                  },
                  {
                    question:
                      "How do you ensure review authenticity?",
                    answer:
                      "We use advanced AI moderation combined with community reporting to maintain quality. Only verified travelers can leave reviews, and our zero-tolerance policy removes fake or sponsored content immediately.",
                  },
                ].map((faq, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
                  >
                    <button
                      onClick={() =>
                        setExpandedFaq(
                          expandedFaq === index ? null : index,
                        )
                      }
                      className="flex w-full items-center justify-between p-6 text-left"
                    >
                      <h3 className="text-lg font-semibold text-slate-900">
                        {faq.question}
                      </h3>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-teal-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                        <p className="text-slate-600">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-slate-50 py-20 overflow-hidden">
              <style>{`
                @keyframes marquee-scroll {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .marquee-track { animation: marquee-scroll 40s linear infinite; }
                .marquee-track:hover { animation-play-state: paused; }
              `}</style>
              <div className="mx-auto max-w-5xl px-6">
                <div className="mb-12 text-center">
                  <div className="mb-3 text-xs font-bold uppercase tracking-widest text-teal-600">Early Voices</div>
                  <h2 className="text-4xl font-bold text-slate-900">What our waitlist is saying</h2>
                </div>
              </div>
              <div className="overflow-hidden">
                {(() => {
                  const testimonials = [
                    { quote: "I've been waiting for something like this. Planning Bali took me three weeks last time. I genuinely can't wait for this to launch.", name: "Ayesha R.", location: "Mumbai", avatar: "AR", color: "bg-teal-100 text-teal-700" },
                    { quote: "The idea of one app that actually works offline is what sold me. I've been burned too many times by no signal at the wrong moment.", name: "Karan M.", location: "Bangalore", avatar: "KM", color: "bg-violet-100 text-violet-700" },
                    { quote: "Group travel is a nightmare to organise. If Tour Bhook can fix that, I'm signing up everyone I know.", name: "Priya S.", location: "Delhi", avatar: "PS", color: "bg-amber-100 text-amber-700" },
                    { quote: "Every travel app I've used feels like it was built for someone else. This one actually gets how Indians travel.", name: "Rohan V.", location: "Pune", avatar: "RV", color: "bg-rose-100 text-rose-700" },
                    { quote: "The AI itinerary idea alone is worth it. I spend more time planning than actually travelling. Please launch fast.", name: "Sneha T.", location: "Chennai", avatar: "ST", color: "bg-teal-100 text-teal-700" },
                    { quote: "Went to Vietnam last year and the chaos of figuring out buses and timings was exhausting. Tour Bhook sounds like the answer.", name: "Arjun N.", location: "Hyderabad", avatar: "AN", color: "bg-indigo-100 text-indigo-700" },
                    { quote: "I travel solo and safety information is always hard to find. If the app covers that too, I'm a lifetime user.", name: "Meera K.", location: "Ahmedabad", avatar: "MK", color: "bg-emerald-100 text-emerald-700" },
                    { quote: "My friends and I can never agree on anything when planning. A voting feature for stops would literally save friendships.", name: "Dev P.", location: "Kolkata", avatar: "DP", color: "bg-orange-100 text-orange-700" },
                    { quote: "The local food discovery feature is what got me. Every travel app just recommends the same tourist traps.", name: "Nisha B.", location: "Jaipur", avatar: "NB", color: "bg-pink-100 text-pink-700" },
                    { quote: "I've referred four people already. Whatever I can do to make this launch faster, I'll do it.", name: "Vikram S.", location: "Surat", avatar: "VS", color: "bg-cyan-100 text-cyan-700" },
                  ];
                  return (
                    <div className="marquee-track flex gap-6 w-max">
                      {[...testimonials, ...testimonials].map((t, i) => (
                        <div key={i} className="w-80 flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                          <div className="mb-4 flex gap-0.5">
                            {[...Array(5)].map((_, si) => <Star key={si} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                          </div>
                          <p className="mb-5 text-sm leading-relaxed text-slate-600">"{t.quote}"</p>
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${t.color}`}>{t.avatar}</div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                              <div className="text-xs text-slate-400">{t.location} · Waitlist member</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Waitlist Form */}
            <div
              id="waitlist"
              className="scroll-mt-24 mx-auto flex max-w-7xl justify-center px-4 py-16 sm:px-6 sm:py-20"
            >
              <div className="w-full max-w-4xl rounded-[2rem] border border-slate-100 bg-white p-8 shadow-2xl md:p-12">
                <div className="text-center">
                  <h2 className="mb-4 text-4xl font-bold">
                    Join the Waitlist
                  </h2>
                  <p className="mb-8 text-lg text-slate-500">
                    Be the first to experience the future of
                    travel.
                  </p>

                  {waitlistSubmitted ? (
                    <div className="py-4">
                      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
                        <CheckCircle className="h-8 w-8 text-teal-600" />
                      </div>
                      <p className="mb-1 text-2xl font-bold text-slate-900">You're on the list!</p>
                      <p className="mb-8 text-slate-500">We'll reach out as soon as we launch. Share with friends to move up the queue.</p>
                      <div className="mx-auto max-w-md rounded-2xl border border-teal-100 bg-teal-50 p-6 text-left">
                        <p className="mb-3 text-sm font-semibold text-teal-800">📣 Share with friends → move up the waitlist</p>
                        <div className="mb-3 flex items-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-sm text-slate-600">
                          <span className="flex-1 truncate">tourbhook.com/?ref=early</span>
                          <button
                            onClick={() => { navigator.clipboard.writeText("https://tourbhook.com/?ref=early"); setReferralCopied(true); setTimeout(() => setReferralCopied(false), 2000); }}
                            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-teal-700"
                          >
                            {referralCopied ? <><Check className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy</>}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <a href={`https://wa.me/?text=${encodeURIComponent("I just joined the Tour Bhook waitlist — the AI travel planner that saves hours of planning. Join here: https://tourbhook.com/?ref=early")}`} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-xl bg-green-500 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-green-600">WhatsApp</a>
                          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Just joined the @TourBhook waitlist — AI-powered travel planning that actually makes sense 🌍 Join here: https://tourbhook.com/?ref=early")}`} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-xl bg-slate-900 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-700">Twitter / X</a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleWaitlistSubmit}
                      className="mx-auto max-w-lg space-y-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row">
                        <input
                          type="email"
                          name="email"
                          placeholder="Email address"
                          className="flex-grow rounded-xl border border-slate-200 bg-gray-50 px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          required
                        />
                        <button
                          type="submit"
                          disabled={waitlistPending}
                          className="whitespace-nowrap rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 px-8 py-4 font-bold text-white shadow-lg shadow-teal-500/20 transition-all hover:shadow-xl hover:shadow-teal-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {waitlistPending ? "Joining..." : "Join Now"}
                        </button>
                      </div>
                      {waitlistError ? (
                        <p className="text-sm text-red-600">{waitlistError}</p>
                      ) : null}
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* App Store Pre-registration */}
            <div className="bg-slate-900 px-6 py-20">
              <div className="mx-auto max-w-3xl text-center">
                <div className="mb-4 text-xs font-bold uppercase tracking-widest text-teal-400">Coming Soon</div>
                <h2 className="mb-4 text-4xl font-bold text-white">Available on iOS & Android</h2>
                <p className="mb-10 text-slate-400">The app is in final development. Pre-register on your platform to get notified the moment it drops — and jump the queue.</p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <a href="#" onClick={(e) => e.preventDefault()} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-white backdrop-blur transition hover:bg-white/20 sm:w-auto">
                    <svg className="h-7 w-7 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs text-slate-400">Pre-register on</div>
                      <div className="font-bold">App Store</div>
                    </div>
                  </a>
                  <a href="#" onClick={(e) => e.preventDefault()} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-white backdrop-blur transition hover:bg-white/20 sm:w-auto">
                    <svg className="h-7 w-7 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.18 23.76c.3.17.65.19.98.07l12.06-6.97-2.55-2.55-10.49 9.45zm-1.81-20.5c-.1.27-.15.56-.15.87v19.74c0 .31.05.6.15.87l.09.08 11.05-11.04v-.27L1.46 3.18l-.09.08zM21.37 10.44l-2.62-1.51-2.88 2.88 2.88 2.88 2.64-1.53c.76-.44.76-1.27-.02-1.72zm-18.19 12.5l10.49-9.45-2.55-2.55-7.94 12z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs text-slate-400">Pre-register on</div>
                      <div className="font-bold">Google Play</div>
                    </div>
                  </a>
                </div>
                <p className="mt-6 text-xs text-slate-500">Links will go live when store listings are approved. Join the waitlist above to get notified first.</p>
              </div>
            </div>

            {/* Contact Section */}
            <section
              id="contact"
              className="scroll-mt-24 border-t border-slate-100 bg-white py-20"
            >
              <div className="mx-auto max-w-7xl px-6">
                <div className="flex flex-col gap-16 md:flex-row">
                  <div className="text-center md:w-5/12 md:text-left">
                    <h2 className="mb-6 text-4xl font-bold text-slate-900">
                      Get in touch
                    </h2>
                    <p className="mb-8 text-lg text-slate-500">
                      Have questions? We'd love to hear from
                      you.
                    </p>
                    <div className="flex items-center justify-center gap-4 md:justify-start">
                      <Mail className="text-teal-600" />
                      <span className="text-slate-700">
                        hello.tourbhook@gmail.com
                      </span>
                    </div>
                  </div>
                  <div className="md:w-7/12">
                    <div className="rounded-2xl border border-slate-100 bg-gray-50 p-8">
                      {contactSubmitted ? (
                        <div className="py-12 text-center">
                          <h3 className="mb-2 text-2xl font-bold">
                            Message Sent!
                          </h3>
                          <p className="text-slate-500">
                            We'll get back to you shortly.
                          </p>
                        </div>
                      ) : (
                        <form
                          onSubmit={handleContactSubmit}
                          className="space-y-6"
                        >
                          <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                          />
                          <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                          />
                          <textarea
                            name="message"
                            placeholder="Message"
                            rows={4}
                            className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                          />
                          <button
                            type="submit"
                            disabled={contactPending}
                            className="w-full rounded-lg bg-slate-900 py-3 font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {contactPending ? "Sending..." : "Send Message"}
                          </button>
                          {contactError ? (
                            <p className="text-sm text-red-600">{contactError}</p>
                          ) : null}
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* About Page */}
        {currentPage === "about" && (
          <div className="animate-in fade-in duration-500">
            {/* Hero */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 px-6 py-28 text-white">
              <div className="mx-auto max-w-3xl text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-teal-300">
                  <Building2 className="h-3.5 w-3.5" /> Our Story
                </div>
                <h1 className="mb-6 text-5xl font-bold md:text-6xl">We got lost so you don't have to.</h1>
                <p className="text-lg text-slate-300">Tour Bhook started from a personal frustration — too many tabs, too many apps, and a holiday that felt like a project plan.</p>
              </div>
            </div>

            <div className="mx-auto max-w-4xl px-6 py-20">
              {/* Founding story */}
              <div className="mb-20 grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
                <div>
                  <div className="mb-3 text-xs font-bold uppercase tracking-widest text-teal-600">The Problem We Lived</div>
                  <h2 className="mb-5 text-3xl font-bold text-slate-900">Planning a trip shouldn't be a full-time job.</h2>
                  <p className="mb-4 leading-relaxed text-slate-600">We were a group of engineers and product designers at Pramahar Technologies who loved to travel. Every trip meant the same routine — hours on Google, WhatsApp groups full of links no one could agree on, screenshots scattered across five different apps, and a 40-tab browser that would crash right before you needed it most.</p>
                  <p className="leading-relaxed text-slate-600">We built Tour Bhook because we couldn't find the tool we wanted. One app. One itinerary. AI that actually understands how you travel.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { emoji: "🗺️", label: "One app", sub: "No more tab chaos" },
                    { emoji: "🤖", label: "AI-powered", sub: "Built for real trips" },
                    { emoji: "📍", label: "On the ground", sub: "Works offline too" },
                    { emoji: "🌏", label: "Built in India", sub: "For the world" },
                  ].map((item, i) => (
                    <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
                      <div className="mb-2 text-3xl">{item.emoji}</div>
                      <div className="font-semibold text-slate-900">{item.label}</div>
                      <div className="text-xs text-slate-500">{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pramahar section */}
              <div className="mb-20 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-12">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">The Company Behind It</div>
                <h2 className="mb-4 text-2xl font-bold text-slate-900">Pramahar Technologies</h2>
                <p className="mb-6 leading-relaxed text-slate-600">Pramahar Technologies is the product studio that builds Tour Bhook. We are a small, remote-first team distributed across India, united by a belief that technology should make lived experiences better — not replace them. Tour Bhook is our first consumer product, and we are building it in public with our community every step of the way.</p>
                <div className="flex flex-wrap gap-6 border-t border-slate-100 pt-6 text-sm text-slate-500">
                  <span><strong className="text-slate-900">Founded</strong> — 2026</span>
                  <span><strong className="text-slate-900">HQ</strong> — India</span>
                  <span><strong className="text-slate-900">Team</strong> — Remote-first</span>
                  <span><strong className="text-slate-900">Focus</strong> — Consumer Travel Tech</span>
                </div>
              </div>

              {/* Values */}
              <div>
                <h2 className="mb-8 text-2xl font-bold text-slate-900">What we believe</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    { title: "Authenticity over algorithm", desc: "We surface places people actually love — not just places that paid to be there." },
                    { title: "Efficiency with soul", desc: "Fast planning doesn't mean generic planning. We save you time without stripping the adventure." },
                    { title: "Trust through transparency", desc: "We tell you where our data comes from, what the AI is doing, and why we made the call we made." },
                  ].map((v, i) => (
                    <div key={i} className="rounded-2xl border border-teal-100 bg-teal-50 p-6">
                      <div className="mb-2 font-bold text-teal-900">{v.title}</div>
                      <p className="text-sm leading-relaxed text-teal-700">{v.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* crewBhook HR Info Page */}
        {currentPage === "crewbhook" && (
          <div className="animate-in fade-in duration-500">
            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900 px-6 py-28 text-white">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-violet-400 blur-3xl"></div>
                <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-indigo-400 blur-3xl"></div>
              </div>
              <div className="relative mx-auto max-w-4xl text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-300">
                  <Users className="h-3.5 w-3.5" /> Pramahar
                  Technologies
                </div>
                <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
                  crew
                  <span className="bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
                    Bhook
                  </span>
                </h1>
                <p className="mx-auto mb-4 max-w-2xl text-xl font-medium text-white/90">
                  We are the crew behind Pramahar Technologies.
                </p>
                <p className="mx-auto max-w-2xl text-lg text-slate-300">
                  Meaningful work. Incredible people. And a
                  ridiculous amount of fun tying it all
                  together.
                </p>
                <button
                  onClick={() => {
                    navigateTo("careers");
                    window.scrollTo(0, 0);
                  }}
                  className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold text-slate-900 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                >
                  Careers{" "}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* How We Hire */}
            <div className="bg-white px-6 py-24">
              <div className="mx-auto max-w-5xl">
                <div className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-violet-500">
                  How We Hire
                </div>
                <h2 className="mb-4 text-center text-4xl font-bold text-slate-900 md:text-5xl">
                  Perhaps the most unique
                  <br />
                  hiring process in the world.
                </h2>
                <p className="mx-auto mb-16 max-w-xl text-center text-slate-500">
                  We don't just hire skills. We hire people.
                </p>

                <div className="relative">
                  {/* Connector line */}
                  <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-gradient-to-b from-violet-200 via-indigo-200 to-slate-100 md:block"></div>

                  <div className="space-y-12">
                    {[
                      {
                        step: "01",
                        color: "bg-violet-100 text-violet-700",
                        dot: "bg-violet-500",
                        title: "People, Not Their Resume",
                        body: "Everyone answers 20 questions — that have nothing to do with their work. We want to know you as a person first. Your quirks, your curiosity, your perspective on the world. The resume comes much later.",
                      },
                      {
                        step: "02",
                        color: "bg-indigo-100 text-indigo-700",
                        dot: "bg-indigo-500",
                        title: "EQ > IQ",
                        body: "Everyone then takes 2 EQ assessments — to understand their attachment style and emotional regulation. We've found that how you handle pressure and how you relate to others predicts success far better than any technical test.",
                      },
                      {
                        step: "03",
                        color: "bg-blue-100 text-blue-700",
                        dot: "bg-blue-500",
                        title:
                          "What You Will Do > What You Have Done",
                        body: "Everyone goes through a practical skill test based on what they'll actually do in their role — not generic puzzles or trick questions. We want to see your real thinking, not your exam performance.",
                      },
                      {
                        step: "04",
                        color: "bg-slate-100 text-slate-700",
                        dot: "bg-slate-500",
                        title: "Finally, the Interview",
                        body: "This is when we see your resume for the first time. By now, we already know you as a person, understand how you think, and have seen your work. The interview is just the conversation that ties it all together.",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="relative flex gap-8 md:pl-24"
                      >
                        <div
                          className={`absolute left-5 top-5 hidden h-6 w-6 -translate-x-1/2 rounded-full border-4 border-white shadow md:flex items-center justify-center ${item.dot}`}
                        ></div>
                        <div className="flex-1 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                          <div className="mb-4 flex items-center gap-3">
                            <span
                              className={`rounded-xl px-3 py-1 text-xs font-bold ${item.color}`}
                            >
                              Step {item.step}
                            </span>
                          </div>
                          <h3 className="mb-3 text-xl font-bold text-slate-900">
                            {item.title}
                          </h3>
                          <p className="leading-relaxed text-slate-500">
                            {item.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* How We Work */}
            <div className="bg-gradient-to-b from-slate-50 to-white px-6 py-24">
              <div className="mx-auto max-w-5xl">
                <div className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-violet-500">
                  How We Work
                </div>
                <h2 className="mb-3 text-center text-4xl font-bold text-slate-900 md:text-5xl">
                  The most inspiring work setup
                  <br />
                  you will ever find.
                </h2>
                <p className="mx-auto mb-16 max-w-xl text-center text-slate-500">
                  No office. No timings. No meetings. Just great
                  work.
                </p>

                <div className="space-y-6">
                  {/* Card 1 */}
                  <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm md:p-10">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-3xl">🌍</span>
                      <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
                        Fully Remote · Fully Async
                      </span>
                    </div>
                    <h3 className="mb-4 text-2xl font-bold text-slate-900">
                      No office, no work timings.
                    </h3>
                    <p className="mb-4 leading-relaxed text-slate-500">
                      The entire team works from home — or
                      wherever we wish to work from. And we work
                      fully async, which means there are no set
                      working hours. And no meetings.
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        "Want to work in the morning — sure.",
                        "In the evening — sure.",
                        "Don't feel like working today — sure.",
                        "Finish all work and take the rest of the week off — sure.",
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-800"
                        >
                          <CheckCircle className="h-4 w-4 flex-shrink-0 text-violet-500" />{" "}
                          {item}
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-slate-400">
                      We are tracked on our output and outcome,
                      not on the hours we put in.
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm md:p-10">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-3xl">✈️</span>
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                        No Meetings · Only Offsites
                      </span>
                    </div>
                    <h3 className="mb-4 text-2xl font-bold text-slate-900">
                      Team bonding &gt; Team meetings.
                    </h3>
                    <p className="leading-relaxed text-slate-500">
                      Since we are fully remote and do not have
                      any meetings, we do a lot of offsites.
                      Tour Bhook has an offsite every 4 months,
                      for 4–5 days. We travel to amazing places,
                      stay at fancy resorts, eat and drink
                      awesome, and have a lot of conversations.
                      The rest of the team meets as often as we
                      can, mostly during the convocation of
                      Pramahar Technologies programs.
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm md:p-10">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-3xl">💰</span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        Bonus Every Quarter
                      </span>
                    </div>
                    <h3 className="mb-4 text-2xl font-bold text-slate-900">
                      Profit sharing = hard cash.
                    </h3>
                    <p className="mb-4 leading-relaxed text-slate-500">
                      There are no ESOPs in the company.
                      Instead, 10% of every quarter's profits
                      are shared within the team. Which means
                      our incentives are aligned to do the best
                      work we can. If we do it, the company
                      makes profits and we make money. A lot of
                      money.
                    </p>
                    <p className="leading-relaxed text-slate-500">
                      The bonus is a function of how timely we
                      do our work and how well we do it. Even
                      our partners have a choice of higher
                      stipend/retainer with little bonus, or
                      lower stipend/retainer with higher bonus.
                      We are in control.
                    </p>
                  </div>

                  {/* Card 4 */}
                  <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm md:p-10">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-3xl">🔓</span>
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                        No Exclusivity
                      </span>
                    </div>
                    <h3 className="mb-4 text-2xl font-bold text-slate-900">
                      Everyone has multiple gigs.
                    </h3>
                    <p className="mb-4 leading-relaxed text-slate-500">
                      There is no concept of exclusivity in this
                      company. We can work as many jobs as we
                      want and work with anyone we want. Even
                      so-called competitors. In fact, Pramahar
                      forces it.
                    </p>
                    <p className="leading-relaxed text-slate-500">
                      This way we learn from the best, apply
                      what we know, and continue to grow. What
                      we earn at Pramahar is often a small part
                      of our overall learning.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Our Culture */}
            <div className="bg-gradient-to-br from-violet-950 to-indigo-900 px-6 py-24 text-white">
              <div className="mx-auto max-w-5xl">
                <div className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-violet-300">
                  Our Culture
                </div>
                <h2 className="mb-16 text-center text-4xl font-bold md:text-5xl">
                  What we actually live by.
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {[
                    {
                      icon: "🤝",
                      title: "Trust First",
                      body: "We trust everyone from Day 1. You don't have to earn it. You have it. Which is why we pay salaries in advance!",
                    },
                    {
                      icon: "🏆",
                      title: "We Want You To Win",
                      body: "We give responsibility, give you the tools, and get out of your way. Autonomy here isn't granted — it's assumed.",
                    },
                    {
                      icon: "🌱",
                      title: "Growth Above All",
                      body: "Everyone holds themselves to high standards — not out of pressure, but out of love for growth.",
                    },
                    {
                      icon: "♾️",
                      title: "Think in Decades",
                      body: "Short-term wins don't excite us; long-term impact does. We build patiently, learn constantly, and play the infinite game together.",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10"
                    >
                      <div className="mb-4 text-3xl">
                        {item.icon}
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-white">
                        {item.title}
                      </h3>
                      <p className="leading-relaxed text-slate-300">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hiring Philosophy + Who We're Looking For */}
            <div className="bg-white px-6 py-24">
              <div className="mx-auto max-w-5xl">
                {/* Philosophy */}
                <div className="mb-20">
                  <div className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-violet-500">
                    Our Hiring Philosophy
                  </div>
                  <h2 className="mb-6 text-center text-4xl font-bold text-slate-900 md:text-5xl">
                    We hire very rarely.
                  </h2>
                  <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-slate-500">
                    But when we do, we are looking for curious,
                    driven humans who own their craft, love
                    working remote and async, and want to build
                    meaningful work together.
                  </p>
                </div>

                {/* Who we're looking for */}
                <div>
                  <div className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-violet-500">
                    Who We're Looking For
                  </div>
                  <h2 className="mb-12 text-center text-4xl font-bold text-slate-900">
                    Three things we can't teach.
                  </h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {[
                      {
                        icon: "🔍",
                        title: "Curiosity",
                        body: 'People who ask "why" until it makes sense. Curiosity is where clarity, creativity, and better decisions begin.',
                      },
                      {
                        icon: "🎯",
                        title: "High Bar for Themselves",
                        body: "The ones who expect excellence not because someone asked them to, but because they can't do average.",
                      },
                      {
                        icon: "♾️",
                        title: "Long-Term Thinking",
                        body: "We want builders, not sprinters — those who play the infinite game and grow through compounding effort.",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="rounded-3xl border border-violet-100 bg-gradient-to-b from-violet-50 to-white p-8 text-center shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-3xl">
                          {item.icon}
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-slate-900">
                          {item.title}
                        </h3>
                        <p className="leading-relaxed text-slate-500">
                          {item.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* What We Offer */}
            <div className="bg-slate-50 px-6 py-24">
              <div className="mx-auto max-w-5xl">
                <div className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-violet-500">
                  What We Offer
                </div>
                <h2 className="mb-16 text-center text-4xl font-bold text-slate-900 md:text-5xl">
                  Real benefits.
                  <br />
                  No fluff.
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {[
                    {
                      icon: "💵",
                      title: "Market Salary",
                      body: "Everyone in the team is paid as per salary benchmarking we do every year for all roles. We pay the median of what the industry offers, based on the role and level.",
                    },
                    {
                      icon: "🎁",
                      title: "Awesome Perks",
                      body: "₹50K per year wellness pack. We create your Mutual Funds account with a monthly SIP of ₹2K (team) or ₹5K (partners). Partners may also choose premium subscriptions, book allowance, and internet reimbursement.",
                    },
                    {
                      icon: "🌸",
                      title: "Women's Menstrual Policy",
                      body: "We give 2 days of paid menstrual leave per month for the women of the crewBhook team, with no questions asked.",
                    },
                    {
                      icon: "📊",
                      title: "Quarterly Bonus",
                      body: "10% of Tour Bhook's profits every quarter form the bonus pool for the team, distributed based on quality and timeliness. Partners can opt into a performance bonus structure of their choice.",
                    },
                    {
                      icon: "🔓",
                      title: "100% Trust & Transparency",
                      body: "Work for anyone else. Everyone's salary is known publicly. Salaries get paid in advance. It is crazy, we know! :))",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md ${i === 4 ? "md:col-span-2" : ""}`}
                    >
                      <div className="mb-4 text-3xl">
                        {item.icon}
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="leading-relaxed text-slate-500">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Life at Pramahar */}
            <div className="bg-white px-6 py-24">
              <div className="mx-auto max-w-5xl">
                <div className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-violet-500">Life at Pramahar</div>
                <h2 className="mb-4 text-center text-4xl font-bold text-slate-900 md:text-5xl">Work hard.<br />Travel harder.</h2>
                <p className="mx-auto mb-16 max-w-xl text-center text-slate-500">We're a remote team that actually meets — at beaches, mountains, and cities around the world.</p>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { emoji: "🏖️", label: "Goa Offsite", sub: "March 2026" },
                    { emoji: "🏔️", label: "Manali Retreat", sub: "December 2025" },
                    { emoji: "🌴", label: "Bali Sprint", sub: "August 2025" },
                    { emoji: "🏙️", label: "Bangalore Meetup", sub: "June 2025" },
                  ].map((item, i) => (
                    <div key={i} className={`group relative overflow-hidden rounded-3xl ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                      <div className={`flex w-full items-center justify-center bg-gradient-to-br ${
                        i === 0 ? "from-violet-100 to-indigo-100 h-64" :
                        i === 1 ? "from-teal-50 to-emerald-100 h-28" :
                        i === 2 ? "from-orange-50 to-amber-100 h-28" :
                        "from-slate-100 to-slate-50 h-28"
                      } transition-all group-hover:brightness-95`}>
                        <span className={i === 0 ? "text-7xl" : "text-4xl"}>{item.emoji}</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <div className="text-sm font-semibold text-white">{item.label}</div>
                        <div className="text-xs text-white/70">{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                  {[
                    { stat: "3×", label: "Offsites per year", desc: "Every 4 months, for 4–5 days" },
                    { stat: "0", label: "Mandatory meetings", desc: "Async-first, always" },
                    { stat: "∞", label: "Where you can work from", desc: "No office, no boundaries" },
                  ].map((item, i) => (
                    <div key={i} className="rounded-2xl border border-violet-100 bg-violet-50 p-6 text-center">
                      <div className="mb-1 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-4xl font-bold text-transparent">{item.stat}</div>
                      <div className="font-semibold text-slate-900">{item.label}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Join the Crew CTA */}
            <div className="bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900 px-6 py-24 text-center text-white">
              <div className="mx-auto max-w-3xl">
                <div className="mb-4 text-4xl">✦</div>
                <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                  Join the Crew
                </h2>
                <p className="mb-10 text-lg text-slate-300">
                  Creators, editors, strategists, dreamers — if
                  you've got the spark, we've got the crew.
                </p>
                <button
                  onClick={() => {
                    navigateTo("careers");
                    window.scrollTo(0, 0);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-4 font-bold text-slate-900 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                >
                  Careers{" "}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Careers / Open Roles Page */}
        {currentPage === "careers" && (
          <div className="animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <div className="border-b border-slate-100 bg-white px-6 py-3">
              <div className="mx-auto flex max-w-5xl items-center gap-2 text-sm text-slate-400">
                <button
                  onClick={() => navigateTo("crewbhook")}
                  className="hover:text-slate-700"
                >
                  crewBhook
                </button>
                <span>/</span>
                <span className="text-slate-700 font-medium">
                  Open Roles
                </span>
              </div>
            </div>

            {/* Hero */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 px-6 py-24 text-center text-white">
              <div className="mx-auto max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-300">
                  <Building2 className="h-3.5 w-3.5" /> Not
                  hiring right now
                </div>
                <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
                  Build the Future of{" "}
                  <span className="bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">
                    Travel with Us
                  </span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-slate-300">
                  We are not hiring right now. New roles will
                  appear here when we open them.
                </p>
              </div>
            </div>

            {/* Open Roles */}
            <div className="mx-auto max-w-5xl px-6 py-20">
              <div className="mb-12 text-center">
                <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-600">
                  Open Positions
                </div>
                <h2 className="text-4xl font-bold text-slate-900">
                  No open roles
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-slate-500">
                  We are not hiring right now. Roles will show
                  up here when we start again.
                </p>
              </div>

              <div className="space-y-6">
                {JOBS.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => {
                      setActiveJobId(job.id);
                      setApplicationSubmitted(false);
                      setCurrentPage("job-detail");
                      window.scrollTo(0, 0);
                    }}
                    className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-teal-200 hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${job.tagColor === "teal" ? "bg-teal-50 text-teal-700" : "bg-orange-50 text-orange-700"}`}
                          >
                            {job.badge}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            Remote
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${job.department === "Engineering" ? "bg-violet-50 text-violet-700" : "bg-emerald-50 text-emerald-700"}`}
                          >
                            {job.department}
                          </span>
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-slate-900">
                          {job.title}
                        </h3>
                        <p className="mb-4 text-slate-500 leading-relaxed line-clamp-2">
                          {job.about.split("\n\n")[0]}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Briefcase
                              className={`h-4 w-4 ${job.tagColor === "teal" ? "text-teal-500" : "text-orange-500"}`}
                            />{" "}
                            {job.badge}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock
                              className={`h-4 w-4 ${job.tagColor === "teal" ? "text-teal-500" : "text-orange-500"}`}
                            />{" "}
                            {job.duration}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users
                              className={`h-4 w-4 ${job.tagColor === "teal" ? "text-teal-500" : "text-orange-500"}`}
                            />{" "}
                            Small Team
                          </span>
                        </div>
                      </div>
                      <div
                        className={`flex shrink-0 items-center gap-2 rounded-2xl px-6 py-3 font-semibold text-white transition-all ${job.tagColor === "teal" ? "bg-slate-900 group-hover:bg-teal-600" : "bg-slate-900 group-hover:bg-orange-500"}`}
                      >
                        View Role{" "}
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50 to-white py-16 text-center">
              <p className="text-slate-500">
                Applications are closed until a role is listed
                here.
              </p>
            </div>
          </div>
        )}

        {/* Job Detail Page */}
        {currentPage === "job-detail" &&
          (() => {
            const job = JOBS.find((j) => j.id === activeJobId);
            if (!job) return null;
            const isTeal = job.tagColor === "teal";
            const accent = isTeal ? "teal" : "orange";
            const accentBg = isTeal
              ? "bg-teal-600"
              : "bg-orange-500";
            const accentText = isTeal
              ? "text-teal-600"
              : "text-orange-500";
            const accentBorder = isTeal
              ? "border-teal-200"
              : "border-orange-200";
            const accentLight = isTeal
              ? "bg-teal-50"
              : "bg-orange-50";
            const accentRing = isTeal
              ? "focus:ring-teal-500"
              : "focus:ring-orange-400";
            const gradientHero = isTeal
              ? "from-slate-900 via-slate-800 to-teal-900"
              : "from-slate-900 via-slate-800 to-orange-900";
            const gradientBtn = isTeal
              ? "from-teal-600 to-teal-500 shadow-teal-500/20"
              : "from-orange-500 to-orange-400 shadow-orange-400/20";

            return (
              <div className="animate-in fade-in duration-500">
                {/* Breadcrumb */}
                <div className="border-b border-slate-100 bg-white px-6 py-3">
                  <div className="mx-auto flex max-w-5xl items-center gap-2 text-sm text-slate-400">
                    <button
                      onClick={() => navigateTo("crewbhook")}
                      className="hover:text-slate-700"
                    >
                      crewBhook
                    </button>
                    <span>/</span>
                    <button
                      onClick={() => navigateTo("careers")}
                      className="hover:text-slate-700"
                    >
                      Open Roles
                    </button>
                    <span>/</span>
                    <span className="text-slate-700 font-medium">
                      {job.title}
                    </span>
                  </div>
                </div>

                {/* Hero */}
                <div
                  className={`bg-gradient-to-br ${gradientHero} px-6 py-20 text-white`}
                >
                  <div className="mx-auto max-w-5xl">
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md`}
                      >
                        {job.badge}
                      </span>
                      <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                        {job.location}
                      </span>
                      <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                        {job.department}
                      </span>
                    </div>
                    <h1 className="mb-4 text-4xl font-bold md:text-5xl">
                      {job.title}
                    </h1>
                    <p className="text-lg text-slate-300">
                      {job.duration} · {job.location}
                    </p>
                    <button
                      onClick={() =>
                        document
                          .getElementById("job-apply-form")
                          ?.scrollIntoView({
                            behavior: "smooth",
                          })
                      }
                      className={`mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r ${gradientBtn} px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-105`}
                    >
                      Apply for this Role{" "}
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mx-auto max-w-5xl px-6 py-16">
                  <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    {/* Left — main content */}
                    <div className="lg:col-span-2 space-y-12">
                      {/* About the Role */}
                      <section>
                        <h2 className="mb-4 text-2xl font-bold text-slate-900">
                          About the Role
                        </h2>
                        <div className="space-y-4">
                          {job.about
                            .split("\n\n")
                            .map((para, i) => (
                              <p
                                key={i}
                                className="leading-relaxed text-slate-600"
                              >
                                {para}
                              </p>
                            ))}
                        </div>
                      </section>

                      {/* Responsibilities */}
                      <section>
                        <h2 className="mb-4 text-2xl font-bold text-slate-900">
                          What You'll Do
                        </h2>
                        <ul className="space-y-3">
                          {job.responsibilities.map((r, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-3"
                            >
                              <div
                                className={`mt-1 h-5 w-5 flex-shrink-0 rounded-full ${accentLight} flex items-center justify-center`}
                              >
                                <CheckCircle
                                  className={`h-3.5 w-3.5 ${accentText}`}
                                />
                              </div>
                              <span className="text-slate-600">
                                {r}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </section>

                      {/* Required Skills */}
                      <section>
                        <h2 className="mb-4 text-2xl font-bold text-slate-900">
                          Skills We're Looking For
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((s, i) => (
                            <span
                              key={i}
                              className={`rounded-xl border ${accentBorder} ${accentLight} px-4 py-2 text-sm font-medium ${accentText}`}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </section>

                      {/* Nice to Have */}
                      <section>
                        <h2 className="mb-4 text-2xl font-bold text-slate-900">
                          Nice to Have
                        </h2>
                        <ul className="space-y-2">
                          {job.niceToHave.map((n, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2 text-slate-500"
                            >
                              <span
                                className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${accentBg}`}
                              ></span>
                              {n}
                            </li>
                          ))}
                        </ul>
                      </section>

                      {/* Benefits */}
                      <section>
                        <h2 className="mb-6 text-2xl font-bold text-slate-900">
                          What You Get
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {job.benefits.map((b, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                            >
                              <span className="text-2xl">
                                {b.icon}
                              </span>
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {b.title}
                                </div>
                                <div className="text-sm text-slate-500">
                                  {b.desc}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    {/* Right — sticky sidebar */}
                    <div className="lg:col-span-1">
                      <div
                        className={`sticky top-24 rounded-3xl border ${accentBorder} ${accentLight} p-6`}
                      >
                        <h3 className="mb-4 font-bold text-slate-900">
                          Quick Overview
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">
                              Role
                            </span>
                            <span className="font-medium text-slate-800">
                              {job.badge}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">
                              Department
                            </span>
                            <span className="font-medium text-slate-800">
                              {job.department}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">
                              Location
                            </span>
                            <span className="font-medium text-slate-800">
                              {job.location}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">
                              Duration
                            </span>
                            <span className="font-medium text-slate-800">
                              {job.duration.split(" · ")[0]}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            document
                              .getElementById("job-apply-form")
                              ?.scrollIntoView({
                                behavior: "smooth",
                              })
                          }
                          className={`mt-6 w-full rounded-2xl bg-gradient-to-r ${gradientBtn} py-3 font-bold text-white shadow-lg transition-all hover:scale-105`}
                        >
                          Apply Now
                        </button>
                        <button
                          onClick={() => navigateTo("careers")}
                          className="mt-3 w-full rounded-2xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:border-slate-300"
                        >
                          ← Open Roles
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Application Form */}
                  <div
                    id="job-apply-form"
                    className="mt-20 border-t border-slate-100 pt-16"
                  >
                    <div className="mb-10">
                      <div
                        className={`mb-2 text-sm font-semibold uppercase tracking-wide ${accentText}`}
                      >
                        Apply
                      </div>
                      <h2 className="text-4xl font-bold text-slate-900">
                        Send Your Application
                      </h2>
                      <p className="mt-2 text-slate-500">
                        We review every application and get back
                        within 3 business days.
                      </p>
                    </div>

                    {applicationSubmitted ? (
                      <div className="rounded-3xl border border-teal-100 bg-white p-12 text-center shadow-xl">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
                          <CheckCircle className="h-8 w-8 text-teal-600" />
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-slate-900">
                          Application Received!
                        </h3>
                        <p className="mb-6 text-slate-500">
                          Thanks for applying for{" "}
                          <strong>{job.title}</strong>. We'll be
                          in touch within 3 business days.
                        </p>
                        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                          <button
                            onClick={() =>
                              setApplicationSubmitted(false)
                            }
                            className="rounded-xl border border-slate-200 px-6 py-2 text-sm font-medium text-slate-600 hover:border-teal-300 hover:text-teal-600"
                          >
                            Apply again
                          </button>
                          <button
                            onClick={() =>
                              navigateTo("careers")
                            }
                            className="rounded-xl border border-slate-200 px-6 py-2 text-sm font-medium text-slate-600 hover:border-teal-300 hover:text-teal-600"
                          >
                            View open roles
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleApplicationSubmit}
                        className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl md:p-10"
                      >
                        <div className="mb-1 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3 text-sm text-slate-600">
                          Applying for:{" "}
                          <strong className="text-slate-900">
                            {job.title}
                          </strong>
                        </div>

                        <div className="mt-6 mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              name="fullName"
                              placeholder="Your full name"
                              required
                              className={`w-full rounded-xl border border-slate-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 ${accentRing}`}
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Email *
                            </label>
                            <input
                              type="email"
                              name="email"
                              placeholder="you@email.com"
                              required
                              className={`w-full rounded-xl border border-slate-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 ${accentRing}`}
                            />
                          </div>
                        </div>

                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              placeholder="+91 98765 43210"
                              className={`w-full rounded-xl border border-slate-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 ${accentRing}`}
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              LinkedIn / Portfolio URL
                            </label>
                            <input
                              type="url"
                              name="linkedinUrl"
                              placeholder="https://linkedin.com/in/you"
                              className={`w-full rounded-xl border border-slate-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 ${accentRing}`}
                            />
                          </div>
                        </div>

                        <div className="mb-6">
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Years of Experience
                          </label>
                          <select
                            name="experience"
                            required
                            className={`w-full rounded-xl border border-slate-200 bg-gray-50 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 ${accentRing}`}
                          >
                            <option value="">
                              Select experience level
                            </option>
                            <option>Fresher / Student</option>
                            <option>0–1 years</option>
                            <option>1–3 years</option>
                            <option>3–5 years</option>
                            <option>5+ years</option>
                          </select>
                        </div>

                        <div className="mb-6">
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Resume / CV *
                          </label>
                          <label
                            className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-gray-50 px-4 py-8 text-center transition hover:${accentBorder} hover:${accentLight}`}
                          >
                            <Upload className="h-6 w-6 text-slate-400" />
                            <span className="text-sm font-medium text-slate-600">
                              Click to upload PDF or DOC
                            </span>
                            <span className="text-xs text-slate-400">
                              Max 5MB
                            </span>
                            <input
                              type="file"
                              name="resume"
                              accept=".pdf,.doc,.docx"
                              className="hidden"
                              required
                            />
                          </label>
                        </div>

                        <div className="mb-6">
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            GitHub / Work Samples
                          </label>
                          <input
                            type="url"
                            name="githubUrl"
                            placeholder="https://github.com/you"
                            className={`w-full rounded-xl border border-slate-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 ${accentRing}`}
                          />
                        </div>

                        <div className="mb-8">
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Why do you want to join Tour Bhook?
                            *
                          </label>
                          <textarea
                            name="whyJoin"
                            rows={4}
                            placeholder="Tell us about yourself and why this role excites you..."
                            required
                            className={`w-full rounded-xl border border-slate-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 ${accentRing}`}
                          />
                        </div>

                        {applicationError ? (
                          <p className="mb-4 text-sm text-red-600">{applicationError}</p>
                        ) : null}
                        <button
                          type="submit"
                          disabled={applicationPending}
                          className={`w-full rounded-2xl bg-gradient-to-r ${gradientBtn} py-4 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {applicationPending ? "Sending..." : "Submit Application"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        {/* Partner Page */}
        {currentPage === "partner" && (
          <div className="animate-in fade-in duration-500">

            {/* S1: Hero */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 px-6 py-20 text-white">
              <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-300">
                    <span className="h-2 w-2 rounded-full bg-green-400"></span> Hiring open for the upcoming travel season
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                    Turn Your Passion for Travel Into a{" "}
                    <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                      Stable, High-Yield Career.
                    </span>
                  </h1>
                  <p className="mb-8 text-lg leading-relaxed text-slate-300">
                    Join TourBhook as an Elite Relationship Manager. Get a guaranteed monthly base allowance, earn uncapped recurring subscription commissions, and manage your clients effortlessly using our dedicated Partner App.
                  </p>
                  <button
                    onClick={() => document.getElementById("partner-form")?.scrollIntoView({ behavior: "smooth" })}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 font-bold text-white shadow-xl shadow-amber-500/30 transition-all hover:scale-105"
                  >
                    Complete Your Application <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
                {/* Right visual */}
                <div className="relative hidden lg:block">
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-2xl"></div>
                  <div className="relative space-y-4 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-green-300">✓</div>
                      <div>
                        <div className="text-xs text-slate-400">Status</div>
                        <div className="font-semibold text-white">Earnings: Processed</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">👤</div>
                      <div>
                        <div className="text-xs text-slate-400">Portfolio</div>
                        <div className="font-semibold text-white">New Client Assigned</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">📍</div>
                      <div>
                        <div className="text-xs text-slate-400">Active Trip</div>
                        <div className="font-semibold text-white">Bali — Day 2 of 5 · On Track</div>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-center">
                      <div className="text-xs font-medium text-amber-100">This Month</div>
                      <div className="text-2xl font-bold text-white">Commission Credited 🎉</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* S2: Proof & Scale Banner */}
            <div className="border-b border-slate-100 bg-white px-6 py-12">
              <div className="mx-auto max-w-5xl">
                <div className="grid grid-cols-2 divide-x divide-slate-100 md:grid-cols-4">
                  {[
                    { stat: "15,000+", label: "Happy Travelers" },
                    { stat: "1,000+", label: "Certified RMs / Partners" },
                    { stat: "80K+", label: "Travel Community Members" },
                    { stat: "2,000+", label: "Successful Trips Curated" },
                  ].map((item, i) => (
                    <div key={i} className="px-6 py-4 text-center first:pl-0 last:pr-0">
                      <div className="mb-1 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-4xl font-bold text-transparent">{item.stat}</div>
                      <div className="text-sm text-slate-500">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* S3: Advantage Grid */}
            <div className="bg-gradient-to-b from-slate-50 to-white px-6 py-24">
              <div className="mx-auto max-w-5xl">
                <div className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-amber-600">Why Partner with Us</div>
                <h2 className="mb-16 text-center text-4xl font-bold text-slate-900 md:text-5xl">The TourBhook Advantage</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {[
                    {
                      icon: "💼",
                      title: "Guaranteed Base Allowance",
                      body: "Get a predictable financial safety net deposited directly into your account every single month — just for maintaining your active traveler portfolio.",
                    },
                    {
                      icon: "📈",
                      title: "Recurring Commissions",
                      body: "Earn a continuous revenue share for up to 12 months. Every single time your referred customer pays their subscription, you get a percentage credited to your wallet.",
                    },
                    {
                      icon: "📱",
                      title: "Dedicated Partner App",
                      body: "No messy paperwork or scattered chats. Track client itineraries, monitor live transit statuses, and resolve issues via your exclusive built-in operational cockpit.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="group rounded-3xl border border-amber-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-3xl transition-all group-hover:bg-amber-100">{item.icon}</div>
                      <h3 className="mb-3 text-xl font-bold text-slate-900">{item.title}</h3>
                      <p className="leading-relaxed text-slate-500">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* S4: Earning Calculator */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 px-6 py-24">
              <div className="mx-auto max-w-5xl">
                <div className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-amber-600">Earning Calculator</div>
                <h2 className="mb-16 text-center text-4xl font-bold text-slate-900 md:text-5xl">How Much Can You Earn?</h2>
                <div className="grid grid-cols-1 items-center gap-12 rounded-3xl border border-amber-200 bg-white p-8 shadow-xl md:grid-cols-2 md:p-12">
                  <div>
                    <label className="mb-3 block font-semibold text-slate-800">
                      How many active premium subscribers can you manage?
                    </label>
                    <div className="mb-2 flex justify-between text-sm text-slate-400">
                      <span>5 users</span><span>50 users</span>
                    </div>
                    <input
                      type="range"
                      min={5} max={50} step={1}
                      value={partnerSlider}
                      onChange={(e) => setPartnerSlider(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <div className="mt-4 text-center text-5xl font-bold text-amber-600">{partnerSlider}</div>
                    <div className="text-center text-sm text-slate-400">active subscribers</div>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-8 text-white shadow-lg">
                    <div className="mb-6 text-lg font-semibold">Your Estimated Monthly Payout</div>
                    <div className="mb-6 space-y-3 rounded-xl bg-white/10 p-5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-amber-100">Guaranteed Base Pay</span>
                        <span className="font-bold">Fixed Monthly</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-100">{partnerSlider} subscribers × commission</span>
                        <span className="font-bold">+ Variable</span>
                      </div>
                      <div className="border-t border-white/20 pt-3 flex justify-between text-base font-bold">
                        <span>Total Monthly Earnings</span>
                        <span className="text-xl">Base + ₹{(partnerSlider * 200).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <p className="text-center text-xs text-amber-100">Commission grows every month for up to 12 months per subscriber.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* S5: Roles & Responsibilities */}
            <div className="bg-white px-6 py-24">
              <div className="mx-auto max-w-5xl">
                <div className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-amber-600">Your Role</div>
                <h2 className="mb-4 text-center text-4xl font-bold text-slate-900 md:text-5xl">Your Duties Are Easier<br />Than You Think!</h2>
                <p className="mx-auto mb-16 max-w-xl text-center text-slate-500">We'll help you every step of the way.</p>
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                  <ul className="space-y-5">
                    {[
                      {
                        title: "End-to-End Navigation",
                        body: "Guide your assigned travelers from the moment they step out of their house until they return safely.",
                      },
                      {
                        title: "Slick Curation",
                        body: "Build custom, hyper-local itineraries tailored to their unique travel style using TourBhook's curation engine.",
                      },
                      {
                        title: "Live Ground Support",
                        body: "Be their ultimate savior when things go wrong — whether coordinating with a hotel that lost a reservation, tracking delayed buses, or handling emergency check-ins and check-outs.",
                      },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                          <CheckCircle className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <div className="mb-1 font-bold text-slate-900">{item.title}</div>
                          <p className="text-slate-500 leading-relaxed">{item.body}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center">
                    <blockquote className="rounded-3xl border-l-4 border-amber-400 bg-amber-50 p-8">
                      <div className="mb-3 text-2xl">📋</div>
                      <div className="mb-3 font-bold text-amber-800">The RM Mandate</div>
                      <p className="text-amber-900 leading-relaxed">
                        You become the dedicated travel custodian for your users. From restaurant reservations and sightseeing tips to handling unexpected flight or train delays, you ensure their journey is entirely seamless.
                      </p>
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>

            {/* S6: Eligibility */}
            <div className="bg-slate-50 px-6 py-24">
              <div className="mx-auto max-w-5xl">
                <div className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-amber-600">Eligibility</div>
                <h2 className="mb-16 text-center text-4xl font-bold text-slate-900 md:text-5xl">Who We Are Looking For</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl">🏆</div>
                    <h3 className="mb-5 text-xl font-bold text-slate-900">Experience & Background</h3>
                    <ul className="space-y-3">
                      {[
                        "Minimum 2 years of relevant experience in travel, tourism, or hospitality",
                        "Strong proficiency in client relationship management and local travel geography",
                        "Previous experience managing tours or curating itineraries is a major plus",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-600">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl">⚙️</div>
                    <h3 className="mb-5 text-xl font-bold text-slate-900">Operational Assets</h3>
                    <ul className="space-y-3">
                      {[
                        "Must possess a laptop or computer equipped with a functional webcam",
                        "Access to a reliable, high-speed internet connection",
                        "Minimum commitment: available as an active partner for at least 6 months",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-600">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* S7: 3-Step Onboarding */}
            <div className="bg-white px-6 py-24">
              <div className="mx-auto max-w-5xl">
                <div className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-amber-600">How to Join</div>
                <h2 className="mb-16 text-center text-4xl font-bold text-slate-900 md:text-5xl">3 Steps to Get Started</h2>
                <div className="relative">
                  <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-amber-200 via-orange-300 to-amber-200 md:block"></div>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {[
                      {
                        step: "01",
                        title: "You Apply",
                        body: "Fill out our short, 2-minute application form below or reach out directly to our talent acquisition team if you have any questions.",
                      },
                      {
                        step: "02",
                        title: "Profile Review",
                        body: "If your experience matches our criteria, we'll hop on a call to discuss your travel background, commercial structures, and walk you through the platform.",
                      },
                      {
                        step: "03",
                        title: "You Partner",
                        body: "Once onboarded, log into your personalized TourBhook Partner App dashboard, get your unique download link, and start managing your portfolio!",
                      },
                    ].map((item, i) => (
                      <div key={i} className="relative flex flex-col items-center text-center">
                        <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-xl font-bold text-white shadow-lg shadow-amber-500/30">
                          {item.step}
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-slate-900">{item.title}</h3>
                        <p className="max-w-xs text-slate-500 leading-relaxed">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* S8: Final CTA + Form */}
            <div id="partner-form" className="bg-slate-900 px-6 py-24 text-white">
              <div className="mx-auto max-w-2xl">
                <div className="mb-10 text-center">
                  <div className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-400">Apply Now</div>
                  <h2 className="mb-3 text-4xl font-bold md:text-5xl">Now You Know How to Join Us.</h2>
                  <p className="text-xl text-slate-300">Why Are You Waiting?</p>
                </div>

                {partnerSubmitted ? (
                  <div className="rounded-3xl border border-amber-500/20 bg-white/5 p-12 text-center backdrop-blur-sm">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
                      <CheckCircle className="h-8 w-8 text-amber-400" />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-white">Application Received!</h3>
                    <p className="mb-6 text-slate-400">Thanks for applying. Our team will review your profile and reach out shortly.</p>
                    <button onClick={() => setPartnerSubmitted(false)} className="rounded-xl border border-white/20 px-6 py-2 text-sm font-medium text-slate-300 hover:border-amber-400 hover:text-amber-300">
                      Submit another application
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handlePartnerSubmit}
                    className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm md:p-10"
                  >
                    <div className="mb-6">
                      <label className="mb-2 block text-sm font-semibold text-slate-300">Full Name *</label>
                      <input type="text" name="fullName" placeholder="Your full name" required className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div className="mb-6">
                      <label className="mb-2 block text-sm font-semibold text-slate-300">Phone / WhatsApp Number *</label>
                      <input type="tel" name="phone" placeholder="+91 98765 43210" required className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div className="mb-6">
                      <label className="mb-2 block text-sm font-semibold text-slate-300">Years of Experience in Travel *</label>
                      <select name="experience" required className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                        <option value="">Select experience</option>
                        <option>2 Years</option>
                        <option>3–5 Years</option>
                        <option>5+ Years</option>
                      </select>
                    </div>
                    <div className="mb-8">
                      <label className="mb-2 block text-sm font-semibold text-slate-300">Current Location *</label>
                      <input type="text" name="location" placeholder="City, State" required className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    {partnerError ? (
                      <p className="mb-4 text-sm text-red-300">{partnerError}</p>
                    ) : null}
                    <button type="submit" disabled={partnerPending} className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50">
                      {partnerPending ? "Sending..." : "Submit Application & Get Started"}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Wishlist / Feature Voting Page */}
        {currentPage === "roadmap" && (
          <div className="animate-in fade-in duration-500">
            {/* Hero */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 px-6 py-24 text-center text-white">
              <div className="mx-auto max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-teal-300">
                  <Star className="h-3.5 w-3.5" /> Feature Wishlist
                </div>
                <h1 className="mb-4 text-5xl font-bold md:text-6xl">You decide what we build.</h1>
                <p className="text-lg text-slate-300">Vote on what matters most to you. The features with the most votes ship first. No guessing — just building what you actually need.</p>
              </div>
            </div>

            <div className="mx-auto max-w-3xl px-6 py-16">
              {/* Category tabs */}
              {(() => {
                const features = [
                  { id: "f1", emoji: "🗺️", title: "AI Itinerary Builder", desc: "Tell the app your dates, vibe, and budget — get a full trip plan in seconds.", votes: 1243 },
                  { id: "f2", emoji: "📍", title: "Offline Maps", desc: "Download your entire trip to your phone. No signal? No problem.", votes: 987 },
                  { id: "f3", emoji: "👥", title: "Group Trip Planning", desc: "Plan with friends — everyone votes on stops and splits costs.", votes: 876 },
                  { id: "f4", emoji: "🚌", title: "Live Transit Tracking", desc: "Real-time status for buses, trains, and ferries during your trip.", votes: 698 },
                  { id: "f5", emoji: "🍜", title: "Local Food Discovery", desc: "Find authentic local spots that tourists miss.", votes: 445 },
                ];
                return (
                  <div className="space-y-4">
                    <div className="mb-8 flex items-center justify-between">
                      <h2 className="text-xl font-bold text-slate-900">Top requested features</h2>
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">{Object.keys(featureVotes).length} voted</span>
                    </div>
                    {features.map((f) => {
                      const voted = featureVotes[f.id];
                      const displayVotes = voted ? f.votes + 1 : f.votes;
                      return (
                        <div key={f.id} className={`group flex items-center gap-4 rounded-2xl border p-5 transition-all hover:shadow-md ${voted ? "border-teal-200 bg-teal-50" : "border-slate-100 bg-white"}`}>
                          <span className="text-3xl">{f.emoji}</span>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900">{f.title}</div>
                            <p className="mt-0.5 text-sm text-slate-500">{f.desc}</p>
                          </div>
                          <button
                            onClick={() => setFeatureVotes(prev => {
                              const next = { ...prev };
                              if (next[f.id]) { delete next[f.id]; } else { next[f.id] = true; }
                              return next;
                            })}
                            className={`flex flex-shrink-0 flex-col items-center rounded-xl border px-4 py-2 text-sm font-bold transition-all ${voted ? "border-teal-400 bg-teal-500 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-600"}`}
                          >
                            <span className="text-base">{voted ? "▲" : "△"}</span>
                            <span>{displayVotes.toLocaleString()}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Suggest your own idea */}
              <div className="mt-16 rounded-3xl border border-slate-200 bg-slate-50 p-8">
                <div className="mb-2 text-xl font-bold text-slate-900">Don't see what you need?</div>
                <p className="mb-6 text-sm text-slate-500">Tell us in your own words. Every suggestion is read by the team — the best ones go straight to the build queue.</p>
                {wishlistSubmitted ? (
                  <div className="flex items-center gap-3 rounded-xl bg-teal-50 p-4 text-teal-700">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-teal-500" />
                    <span className="font-semibold">Got it! Your idea is in the queue. Thank you.</span>
                  </div>
                ) : (
                  <form onSubmit={handleIdeaSubmit} className="space-y-4">
                    <textarea
                      value={wishlistIdea}
                      onChange={(e) => setWishlistIdea(e.target.value)}
                      placeholder="e.g. I want to be able to share my itinerary as a link with people who don't have the app..."
                      rows={3}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                    />
                    {ideaError ? (
                      <p className="text-sm text-red-600">{ideaError}</p>
                    ) : null}
                    <button type="submit" disabled={!wishlistIdea.trim() || ideaPending} className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-40">
                      {ideaPending ? "Sending..." : "Submit Idea"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Press & Media Page */}
        {currentPage === "press" && (
          <div className="animate-in fade-in duration-500">
            <div className="border-b border-slate-100 bg-white px-6 py-20 text-center">
              <div className="mx-auto max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  <Newspaper className="h-3.5 w-3.5" /> Press &amp; Media
                </div>
                <h1 className="mb-4 text-5xl font-bold text-slate-900 md:text-6xl">Media Kit</h1>
                <p className="text-lg text-slate-500">Everything you need to cover Tour Bhook. For press enquiries, email us directly.</p>
                <a href="mailto:info@tourbhook.com" className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:text-teal-600">
                  <Mail className="h-4 w-4" /> info@tourbhook.com
                </a>
              </div>
            </div>

            <div className="mx-auto max-w-5xl px-6 py-20">
              {/* Boilerplate */}
              <div className="mb-16 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
                <h2 className="mb-4 text-2xl font-bold text-slate-900">Company Boilerplate</h2>
                <p className="mb-4 leading-relaxed text-slate-600">
                  Tour Bhook is an AI-powered travel planning app developed by Pramahar Technologies. The app uses intelligent route optimisation and community-verified recommendations to help travellers spend less time planning and more time exploring. Tour Bhook is currently in pre-launch with over 8,200 early adopters on its waitlist, and is set to launch in Southeast Asia with full coverage of Bali, Thailand, Vietnam, and Singapore.
                </p>
                <button
                  onClick={() => { navigator.clipboard.writeText("Tour Bhook is an AI-powered travel planning app developed by Pramahar Technologies. The app uses intelligent route optimisation and community-verified recommendations to help travellers spend less time planning and more time exploring. Tour Bhook is currently in pre-launch with over 8,200 early adopters on its waitlist, and is set to launch in Southeast Asia with full coverage of Bali, Thailand, Vietnam, and Singapore."); }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-teal-300 hover:text-teal-600"
                >
                  <Copy className="h-4 w-4" /> Copy boilerplate
                </button>
              </div>

              {/* Key Facts */}
              <div className="mb-16">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Key Facts</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: "Founded", value: "2026" },
                    { label: "Headquarters", value: "India" },
                    { label: "Stage", value: "Pre-launch / Beta" },
                    { label: "Waitlist", value: "8,200+ early adopters" },
                    { label: "Launch Markets", value: "Southeast Asia" },
                    { label: "Parent Company", value: "Pramahar Technologies" },
                  ].map((fact, i) => (
                    <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{fact.label}</div>
                      <div className="font-bold text-slate-900">{fact.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coverage Guidelines */}
              <div className="mb-16">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Coverage Guidelines</h2>
                <div className="space-y-4">
                  {[
                    { title: "Verify before you publish", body: "Please reach out to us before going to print. We're happy to confirm facts, provide quotes, or clarify anything that seems ambiguous. This keeps coverage accurate for your readers." },
                    { title: "Keep the brands separate", body: "Tour Bhook and Pramahar Technologies are distinct brands. Tour Bhook is the consumer product; Pramahar Technologies is the parent company. Please do not conflate the two in headlines or body copy." },
                    { title: "No unreleased feature screenshots", body: "We share early builds with media under embargo from time to time. Please do not publish screenshots of unreleased features or flows without prior written approval from our team." },
                  ].map((g, i) => (
                    <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                      <div className="mb-1 font-semibold text-slate-900">{g.title}</div>
                      <p className="text-sm leading-relaxed text-slate-500">{g.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="rounded-3xl bg-slate-900 p-8 text-center text-white md:p-10">
                <h2 className="mb-3 text-2xl font-bold">Press Enquiries</h2>
                <p className="mb-6 text-slate-400">For interviews, features, or media requests, reach out directly. We typically respond within 24 hours.</p>
                <a href="mailto:info@tourbhook.com" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-slate-900 transition hover:bg-slate-100">
                  <Mail className="h-4 w-4" /> info@tourbhook.com
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy Page */}
        {currentPage === "privacy" && (
          <div className="animate-in fade-in duration-500">
            <div className="border-b border-slate-100 bg-white px-6 py-16 text-center">
              <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">Privacy Policy</h1>
              <p className="mt-3 text-slate-500">Last updated: September 2026</p>
            </div>
            <div className="mx-auto max-w-3xl px-6 py-16">
              <div className="space-y-10">
                {[
                  {
                    title: "1. Who We Are",
                    body: "Tour Bhook is an AI-powered travel planning service operated by Pramahar Technologies ('we', 'us', 'our'). This Privacy Policy explains how we collect, use, and protect your personal information when you use our website or join our waitlist.",
                  },
                  {
                    title: "2. Information We Collect",
                    body: "We collect information you provide directly — such as your email address when joining the waitlist, your name and contact details when applying for a job or partner role, and messages you send through our contact form. We may also collect basic usage data (pages visited, time on site) through analytics tools to improve the experience.",
                  },
                  {
                    title: "3. How We Use Your Information",
                    body: "We use your email address to send you updates about Tour Bhook's launch, early access invitations, and product news. We use contact form submissions to respond to your enquiries. We use job and partner applications to evaluate your suitability for roles. We never sell your personal data to third parties.",
                  },
                  {
                    title: "4. Data Storage & Security",
                    body: "Your data is stored securely using industry-standard encryption. We use reputable third-party service providers for email delivery and form handling, all of whom are contractually bound to protect your data. We retain waitlist data until the app launches or you request deletion, whichever comes first.",
                  },
                  {
                    title: "5. Your Rights",
                    body: "You have the right to access, correct, or delete your personal data at any time. To exercise these rights, email us at hello.tourbhook@gmail.com. You may also unsubscribe from our mailing list at any time by clicking 'Unsubscribe' in any email we send you.",
                  },
                  {
                    title: "6. Cookies",
                    body: "We use minimal cookies to ensure the website functions correctly and to understand how visitors interact with the site. We do not use advertising cookies or track you across other websites. You can disable cookies in your browser settings, though this may affect some functionality.",
                  },
                  {
                    title: "7. Third-Party Links",
                    body: "Our website may link to external services such as Google Play Store, Apple App Store, Instagram, and Twitter. We are not responsible for the privacy practices of these third parties and encourage you to review their respective privacy policies.",
                  },
                  {
                    title: "8. Children's Privacy",
                    body: "Tour Bhook is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has submitted data to us, please contact us and we will delete it promptly.",
                  },
                  {
                    title: "9. Changes to This Policy",
                    body: "We may update this Privacy Policy from time to time. When we do, we will update the 'Last updated' date at the top. Continued use of the site after changes are posted constitutes your acceptance of the revised policy.",
                  },
                  {
                    title: "10. Contact Us",
                    body: "For any privacy-related questions or requests, contact us at hello.tourbhook@gmail.com. We aim to respond within 5 business days.",
                  },
                ].map((section, i) => (
                  <div key={i} className="border-b border-slate-100 pb-8 last:border-0">
                    <h2 className="mb-3 text-xl font-bold text-slate-900">{section.title}</h2>
                    <p className="leading-relaxed text-slate-600">{section.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-12 rounded-2xl border border-teal-100 bg-teal-50 p-6 text-center">
                <p className="text-sm text-teal-800">Questions about your data? <a href="mailto:hello.tourbhook@gmail.com" className="font-semibold underline">hello.tourbhook@gmail.com</a></p>
              </div>
            </div>
          </div>
        )}

        {/* 404 Fallback */}
        {!["home","about","crewbhook","careers","partner","job-detail","roadmap","press","privacy"].includes(currentPage) && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center animate-in fade-in duration-500">
            <div className="mb-6 text-7xl">🗺️</div>
            <h1 className="mb-3 text-4xl font-bold text-slate-900">Page not found</h1>
            <p className="mb-8 text-slate-500">Looks like this destination doesn't exist on our map — yet.</p>
            <button onClick={() => navigateTo("home")} className="rounded-full bg-teal-600 px-8 py-3 font-bold text-white transition hover:bg-teal-700">
              Back to Home
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 pb-8 pt-16">
        <div className="mx-auto max-w-7xl px-6 text-center md:text-left">
          <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-3">
            <div>
              <button
                onClick={() => navigateTo("home")}
                className="group mb-4 flex items-center gap-2 transition-opacity hover:opacity-90"
              >
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-slate-900 p-2 shadow-sm">
                  <img
                    src={logoImg}
                    alt="Tour Bhook"
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Tour{" "}
                  <span className="text-teal-600">Bhook</span>
                </span>
              </button>
              <p className="text-sm text-slate-500">
                Revolutionizing travel with AI-driven
                efficiency.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-slate-900">
                Company
              </h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <button
                    onClick={() => navigateTo("about")}
                    className="hover:text-teal-600"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo("crewbhook")}
                    className="hover:text-teal-600"
                  >
                    crewBhook
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo("partner")}
                    className="hover:text-teal-600"
                  >
                    Partner with Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { navigateTo("roadmap"); window.scrollTo(0,0); }}
                    className="hover:text-teal-600"
                  >
                    Wishlist
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { navigateTo("press"); window.scrollTo(0,0); }}
                    className="hover:text-teal-600"
                  >
                    Press &amp; Media
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-slate-900">
                Follow Us
              </h4>
              <div className="flex justify-center space-x-4 md:justify-start">
                <a
                  href="https://www.instagram.com/tourbhook/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 transition-colors hover:bg-teal-600 hover:text-white"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 transition-colors hover:bg-teal-600 hover:text-white"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between border-t border-slate-200 pt-8 text-sm text-slate-500 md:flex-row">
            <p>© 2026 Tour Bhook Inc.</p>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <button
                onClick={() => setShowTermsModal(true)}
                className="hover:text-slate-900"
              >
                Terms
              </button>
              <button onClick={() => { navigateTo("privacy"); window.scrollTo(0,0); }} className="hover:text-slate-900">
                Privacy
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms Modal */}
      {/* Cookie Consent Banner */}
      {!cookieDismissed && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white px-6 py-4 shadow-lg md:bottom-6 md:left-6 md:right-auto md:max-w-md md:rounded-2xl md:border md:shadow-xl">
          <p className="mb-3 text-sm text-slate-600">We use minimal cookies to keep the site working and understand how visitors interact with it. No ad tracking, ever.</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setCookieDismissed(true)} className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-slate-700">
              Got it
            </button>
            <button onClick={() => { navigateTo("privacy"); setCookieDismissed(true); }} className="text-sm text-slate-400 underline transition hover:text-slate-600">
              Privacy Policy
            </button>
          </div>
        </div>
      )}

      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h3 className="text-xl font-bold text-slate-900">
                Terms and Conditions
              </h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="rounded-full p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <div className="space-y-5 text-sm text-slate-600 leading-relaxed">
                <p className="text-slate-400 text-xs">Last updated: September 2026</p>
                {[
                  { title: "1. Acceptance of Terms", body: "By accessing or using Tour Bhook (\"the App\"), operated by Pramahar Technologies, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the App." },
                  { title: "2. Use of the Service", body: "Tour Bhook provides AI-assisted travel planning and itinerary management. The App is currently in pre-launch phase. Features displayed may change before the official release. You may not use the service for any unlawful purpose or in a way that could damage, disable, or impair the service." },
                  { title: "3. Waitlist & Early Access", body: "By joining the waitlist, you agree to receive email communications from Tour Bhook regarding product updates and launch announcements. You may unsubscribe at any time. Waitlist position is not guaranteed and may change." },
                  { title: "4. Intellectual Property", body: "All content, branding, and technology within Tour Bhook — including the TB logo, product name, and AI systems — are the intellectual property of Pramahar Technologies. You may not reproduce, distribute, or create derivative works without prior written permission." },
                  { title: "5. Third-Party Services", body: "The App may integrate with third-party services including mapping providers, booking platforms, and AI APIs. We are not responsible for the availability, accuracy, or content of third-party services." },
                  { title: "6. Limitation of Liability", body: "Tour Bhook and Pramahar Technologies shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App, including travel disruptions, booking errors, or reliance on AI-generated itineraries." },
                  { title: "7. Changes to Terms", body: "We reserve the right to modify these Terms at any time. Continued use of the App after changes are posted constitutes your acceptance of the revised Terms." },
                  { title: "8. Contact", body: "For any questions about these Terms, contact us at hello.tourbhook@gmail.com." },
                ].map((section, i) => (
                  <div key={i}>
                    <div className="mb-1 font-semibold text-slate-800">{section.title}</div>
                    <p>{section.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-slate-100 bg-slate-50 p-6 text-right">
              <button
                onClick={() => setShowTermsModal(false)}
                className="rounded-lg bg-slate-900 px-6 py-2 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}