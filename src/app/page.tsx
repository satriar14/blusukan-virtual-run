'use client';

import Image from 'next/image';

export default function Home() {
  const stravaUriClub = `https://www.strava.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI}&scope=read,activity:read&approval_prompt=auto`;

  const handleResetLocalStorage = () => {
    localStorage.removeItem('stravaAccessToken');
    localStorage.removeItem('athlete');
  };

  return (
    <div className="container-app bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-orange-500/30 rounded-full"></div>
            <Image
              src="/Logo blusukan-01.jpg"
              alt="Blusukan Logo"
              width={140}
              height={140}
              className="rounded-full relative z-10 border-4 border-orange-500/50 shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Virtual Run
            <span className="block text-orange-500">Blusukan</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xs mx-auto">
            Join the challenge and track your running journey with Strava
          </p>
        </div>

        {/* Features */}
        <div className="w-full max-w-sm mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-xl">
                🏃
              </div>
              <div>
                <h3 className="text-white font-semibold">Track Progress</h3>
                <p className="text-slate-400 text-sm">Monitor your daily runs</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-xl">
                🏆
              </div>
              <div>
                <h3 className="text-white font-semibold">Leaderboard</h3>
                <p className="text-slate-400 text-sm">Compete with friends</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-xl">
                🎯
              </div>
              <div>
                <h3 className="text-white font-semibold">Achieve Goals</h3>
                <p className="text-slate-400 text-sm">Complete 300km challenge</p>
              </div>
            </div>
          </div>
        </div>

        {/* Strava Login Button */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <a href={stravaUriClub} onClick={handleResetLocalStorage}>
            <button className="bg-[#fc4c02] hover:bg-[#e64500] text-white font-bold py-4 px-8 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-orange-500/25 flex items-center gap-3">
              <svg
                className="w-6 h-6"
                viewBox="0 0 384 512"
                fill="currentColor"
              >
                <path d="M158.4 0L7 292h89.2l62.2-116.1L220.1 292h88.5zm62.2 296.5l-36.5 68.5h-73l109.5 147 109.5-147h-72.9l-36.6-68.5z" />
              </svg>
              Connect with Strava
            </button>
          </a>
        </div>

        {/* Manual Registration Link */}
        <div className="animate-fade-in mt-4" style={{ animationDelay: '0.4s' }}>
          <a href="/register" className="text-slate-400 hover:text-white text-sm transition-colors">
            Tidak punya Strava? <span className="underline">Daftar Manual</span>
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center border-t border-white/10">
        <p className="text-slate-500 text-sm mb-2">
          © 2025 Blusukan Virtual Run
        </p>
        <div className="flex justify-center gap-4 text-xs text-slate-600">
          <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
