import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { SMARTBIN_LOGO, SMARTBIN_HERO } from '../../assets/branding';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Building,
  Phone,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Truck,
  Tv,
  Eye,
  Activity,
  RefreshCw,
  Layers,
  SunMedium,
  Radio,
  MapPin,
  LogIn,
  UserPlus,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    signIn,
    signUp,
    loginWithGoogle,
    loginWithApple,
    loginWithMicrosoft,
    loginWithDemoRole,
    loading,
    error,
    clearError,
  } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  // Login Form
  const [email, setEmail] = useState('giniyomugabo@gmail.com');
  const [password, setPassword] = useState('Admin123!SG');
  const [rememberMe, setRememberMe] = useState(true);

  // Signup Form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('ADMIN');
  const [signupOrg, setSignupOrg] = useState('City of Kigali Municipal Fleet');
  const [signupPhone, setSignupPhone] = useState('+250 788 123 456');
  const [signupZone, setSignupZone] = useState('Gasabo Sector (Kigali Heights)');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await signIn(email, password);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword || !signupName) return;
    await signUp({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      role: signupRole,
      organization: signupOrg,
      phone: signupPhone,
      assignedZone: signupZone,
    });
  };

  const demoPresets = [
    { role: 'ADMIN' as UserRole, label: 'Admin (Gisa)', email: 'giniyomugabo@gmail.com', pass: 'Admin123!SG' },
    { role: 'OPERATOR' as UserRole, label: 'Operator (Aline)', email: 'a.umutoni@kigalicity.gov.rw', pass: 'Operator123!SG' },
    { role: 'COLLECTOR' as UserRole, label: 'Collector (Jean-Paul)', email: 'jp.nshimiye@kigalieco.rw', pass: 'Collector123!SG' },
    { role: 'ADVERTISER' as UserRole, label: 'Advertiser (Cedric)', email: 'c.habimana@mtn.co.rw', pass: 'Advertiser123!SG' },
    { role: 'VIEWER' as UserRole, label: 'Viewer (Marie)', email: 'm.mukamana@rema.gov.rw', pass: 'Viewer123!SG' },
  ];

  const demoRoles: {
    role: UserRole;
    name: string;
    title: string;
    org: string;
    color: string;
    icon: React.ElementType;
    description: string;
  }[] = [
    {
      role: 'ADMIN',
      name: 'Gisa Niyomugabo',
      title: 'Chief Municipal Admin',
      org: 'SG AI Agency / City of Kigali',
      color: 'border-purple-500/50 hover:border-purple-400 bg-purple-950/20 text-purple-300',
      icon: ShieldCheck,
      description: 'Full unconstrained control over fleet, users, ads, & Firebase backend',
    },
    {
      role: 'OPERATOR',
      name: 'Aline Umutoni',
      title: 'Command Center Operator',
      org: 'Kigali Waste Command',
      color: 'border-sky-500/50 hover:border-sky-400 bg-sky-950/20 text-sky-300',
      icon: Activity,
      description: 'Fleet telematics, sensor self-tests, alerts resolution & route dispatch',
    },
    {
      role: 'COLLECTOR',
      name: 'Jean-Paul Nshimiyimana',
      title: 'Waste Route Driver',
      org: 'Kigali Green Waste Logistics',
      color: 'border-emerald-500/50 hover:border-emerald-400 bg-emerald-950/20 text-emerald-300',
      icon: Truck,
      description: 'Assigned pickups only, bin navigation & clearance weight logging',
    },
    {
      role: 'ADVERTISER',
      name: 'Cedric Habimana',
      title: 'Digital Media Lead',
      org: 'MTN Rwanda Brand Media',
      color: 'border-amber-500/50 hover:border-amber-400 bg-amber-950/20 text-amber-300',
      icon: Tv,
      description: 'Upload LED screen media, track impressions & view ad spend ROI',
    },
    {
      role: 'VIEWER',
      name: 'Dr. Marie Claire Mukamana',
      title: 'Citizen Auditor',
      org: 'REMA Environmental Oversight',
      color: 'border-slate-600 hover:border-slate-400 bg-slate-900/40 text-slate-300',
      icon: Eye,
      description: 'Read-only public dashboard, station locator map & sustainability data',
    },
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="h-16 border-b border-slate-800/80 bg-[#0A0F17]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img
            src={SMARTBIN_LOGO}
            alt="SG SmartBin Logo"
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-xl object-cover border border-emerald-400/40 shadow-lg shadow-emerald-950/50"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white font-mono">
                SG SMARTBIN
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                KIGALI IoT
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-400 block -mt-0.5">
              3-Compartment AI Waste &amp; LED Billboard Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Main Top Mode Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              id="header-btn-login"
              onClick={() => {
                setMode('LOGIN');
                clearError();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'LOGIN'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              id="header-btn-signup"
              onClick={() => {
                setMode('SIGNUP');
                clearError();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'SIGNUP'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-center z-10">
        
        {/* Solution Purpose Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0A0F17]/90 p-5 sm:p-6 mb-6 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-300 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Next-Gen Urban Clean Infrastructure • City of Kigali</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">SG SmartBin</span> Kigali Platform
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Please <strong>Log In</strong> or <strong>Sign Up</strong> below to access the centralized smart waste management dashboard, real-time ultrasonic bin fill telemetry, automated collection routes, and outdoor LED billboard media network.
              </p>
              
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" /> 3-Compartment Auto Sorting
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                  <Tv className="w-3.5 h-3.5 text-amber-400" /> Upper LED Media Screens
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                  <Radio className="w-3.5 h-3.5 text-sky-400" /> Ultrasonic &amp; Air Quality IoT
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                  <SunMedium className="w-3.5 h-3.5 text-yellow-400" /> Solar Battery Telemetry
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 hidden lg:block">
              <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-xl group">
                <img
                  src={SMARTBIN_HERO}
                  alt="SG SmartBin Kigali Station"
                  referrerPolicy="no-referrer"
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F17] via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-200">
                  <span className="bg-black/70 px-2 py-0.5 rounded border border-slate-700 backdrop-blur-sm">
                    Station #KB-001 (Kigali Heights)
                  </span>
                  <span className="text-emerald-400 font-bold">ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-6 w-full p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-center justify-between text-xs text-rose-300 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-rose-400 hover:text-white font-mono text-[11px] underline ml-3 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Section 1: Interactive Authentication Card (Login or Sign Up) (6 cols) */}
          <div className="lg:col-span-6 bg-[#0A0F17] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl relative">
            
            {/* Prominent Tab Switcher Header */}
            <div className="grid grid-cols-2 p-1 bg-slate-900/90 border border-slate-800 rounded-xl mb-6">
              <button
                id="tab-btn-login-main"
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  clearError();
                }}
                className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'LOGIN'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Log In (Sign In)</span>
              </button>
              <button
                id="tab-btn-signup-main"
                type="button"
                onClick={() => {
                  setMode('SIGNUP');
                  clearError();
                }}
                className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'SIGNUP'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up (Register)</span>
              </button>
            </div>

            {/* Social Single Sign-On Options (Google, Apple, Microsoft) */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-mono">
                  {mode === 'LOGIN' ? 'Fast Single Sign-On' : 'Quick Register with Single Sign-On'}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                  Firebase OAuth
                </span>
              </div>

              {/* Google Button */}
              <button
                id="btn-login-google"
                type="button"
                onClick={() => loginWithGoogle()}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-white font-medium text-xs transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md hover:scale-[1.01]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z"
                  />
                </svg>
                <span>{mode === 'LOGIN' ? 'Continue with Google' : 'Sign Up with Google'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Apple Button */}
                <button
                  id="btn-login-apple"
                  type="button"
                  onClick={() => loginWithApple()}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01]"
                >
                  <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-5.78-8.81-10.37-18.79-13.78-29.93-3.41-11.14-5.12-21.78-5.12-31.91 0-14.28 3.73-26.06 11.2-35.33 7.46-9.28 16.71-14.03 27.75-14.26 4.35 0 9.28 1.13 14.79 3.38 5.51 2.26 9.38 3.44 11.62 3.55 1.85 0 5.86-1.25 12.03-3.76 6.17-2.5 11.45-3.64 15.84-3.41 12.3.65 22.06 5.34 29.27 14.07-10.78 6.52-16.03 15.53-15.75 27.02.22 8.92 3.65 16.38 10.3 22.38 4.35 3.92 9.28 6.63 14.79 8.16-2.07 6.19-4.57 12.51-7.5 18.96zM119.22 31.02c0-7.29 2.65-14.03 7.95-20.21 5.3-6.19 11.75-10.12 19.34-11.81.44 1.74.65 3.37.65 4.9 0 7.39-2.73 14.32-8.18 20.78-5.46 6.46-12.03 10.39-19.76 11.79v-5.45z" />
                  </svg>
                  <span>Apple ID</span>
                </button>

                {/* Microsoft Button */}
                <button
                  id="btn-login-microsoft"
                  type="button"
                  onClick={() => loginWithMicrosoft()}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01]"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                  <span>Microsoft</span>
                </button>
              </div>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0A0F17] px-3 text-[11px] font-mono text-slate-500">
                  {mode === 'LOGIN' ? 'Or sign in with email credentials' : 'Or fill in registration details'}
                </span>
              </div>
            </div>

            {/* FORM 1: LOGIN MODE */}
            {mode === 'LOGIN' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Email Address
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Enterprise ID</span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      id="input-login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="giniyomugabo@gmail.com"
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">Encrypted</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      id="input-login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Quick preset selector pills */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block mb-1.5">
                    Quick Preset Credentials:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {demoPresets.map((p) => (
                      <button
                        key={p.role}
                        type="button"
                        onClick={() => {
                          setEmail(p.email);
                          setPassword(p.pass);
                        }}
                        className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                    />
                    <span>Remember my session</span>
                  </label>
                  <span className="text-emerald-400 text-[11px] font-mono">Auto-Sync On</span>
                </div>

                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50 hover:scale-[1.01] mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating credentials...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Log In &amp; Enter Platform</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-400">
                    Don&apos;t have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('SIGNUP');
                        clearError();
                      }}
                      className="text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      Sign Up here
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* FORM 2: SIGNUP MODE */
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      id="input-signup-name"
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Eric Kayitare"
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      id="input-signup-email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="e.kayitare@kigalicity.gov.rw"
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Set Secure Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      id="input-signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Target Role (RBAC)
                    </label>
                    <select
                      id="select-signup-role"
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value as UserRole)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    >
                      <option value="ADMIN">ADMIN (Full Access)</option>
                      <option value="OPERATOR">OPERATOR (Command)</option>
                      <option value="COLLECTOR">COLLECTOR (Driver)</option>
                      <option value="ADVERTISER">ADVERTISER (Media)</option>
                      <option value="VIEWER">VIEWER (Auditor)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Organization
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                      <input
                        id="input-signup-org"
                        type="text"
                        value={signupOrg}
                        onChange={(e) => setSignupOrg(e.target.value)}
                        placeholder="Agency / Company"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                      <input
                        id="input-signup-phone"
                        type="text"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="+250 788..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Sector / Zone
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                      <input
                        id="input-signup-zone"
                        type="text"
                        value={signupZone}
                        onChange={(e) => setSignupZone(e.target.value)}
                        placeholder="Gasabo / Nyarugenge"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  id="btn-signup-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50 hover:scale-[1.01] mt-3"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating secure account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account &amp; Enter Platform</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-400">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('LOGIN');
                        clearError();
                      }}
                      className="text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      Log In here
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Section 2: 1-Click Role Exploration Personas (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  1-Click Role Personas (RBAC Access)
                </span>
              </div>
              <span className="text-[11px] text-emerald-400/80 font-mono bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                Instant Demo Access
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed px-1">
              Need to test immediately without typing? Choose any of the 5 official Kigali city roles below to enter with full corresponding permissions.
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {demoRoles.map((dr) => {
                const Icon = dr.icon;
                return (
                  <button
                    key={dr.role}
                    id={`login-role-${dr.role.toLowerCase()}`}
                    onClick={() => loginWithDemoRole(dr.role)}
                    disabled={loading}
                    className={`p-3.5 rounded-xl border ${dr.color} text-left transition-all duration-200 hover:scale-[1.01] hover:shadow-lg flex items-center justify-between group cursor-pointer`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-emerald-500/50">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                            {dr.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                            {dr.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{dr.title} • {dr.org}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">{dr.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-mono font-semibold opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all pl-2 shrink-0">
                      <span>Launch</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="h-12 border-t border-slate-800 bg-[#070B12] px-6 flex items-center justify-between text-[11px] font-mono text-slate-500 z-10">
        <div>City of Kigali • SG Smart Cities IoT Ecosystem</div>
        <div className="flex items-center gap-4">
          <span className="text-emerald-400">● FIRESTORE ONLINE</span>
          <span className="hidden sm:inline text-slate-400">OAuth &amp; RBAC Gateway</span>
        </div>
      </footer>
    </div>
  );
};
