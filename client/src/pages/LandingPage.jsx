import { useState } from 'react'
import { Link } from 'react-router-dom'
import arenaBg from '../assets/arena-bg.jpg'

// Premium vector SVG icons
const Icons = {
  Trophy: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-6.75a1.125 1.125 0 01-1.125 1.125v3.375m9 0h-9M12 3a6 6 0 00-6 6c0 2.22 1.206 4.16 3 5.196V15h6v-.804c1.794-1.036 3-2.976 3-5.196a6 6 0 00-6-6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5H4.125C3.504 7.5 3 8.004 3 8.625v.75c0 2.071 1.679 3.75 3.75 3.75h.375M18 7.5h1.875c.621 0 1.125.504 1.125 1.125v.75c0 2.071-1.679 3.75-3.75 3.75h-.375" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  ),
  Target: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  ),
  Flame: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    </svg>
  ),
  Activity: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  GitBranch: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="9" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9v6m0-6a9 9 0 019-9h3m-9 9a9 9 0 009 9h3" />
    </svg>
  ),
}

const GAMES = [
  {
    id: 'bgmi',
    tag: 'BATTLE ROYALE',
    name: 'BGMI',
    subtitle: 'Battlegrounds Mobile India',
    mode: 'Squads & Duos · Erangel',
    tournamentsCount: '12 Active Brackets',
    bracket: {
      seriesTitle: 'COLLEGIATE CHAMPIONSHIP',
      stage: 'GRAND FINALS // BO5',
      map: 'Erangel (Zone 6)',
      eloImpact: '+42 / -26 ELO',
      semisA: { team1: 'VORTEX ESPORTS', seed1: '01', score1: 3, team2: 'PHANTOM GAMING', seed2: '04', score2: 1, win: 1 },
      semisB: { team1: 'TITAN SQUAD', seed1: '02', score1: 1, team2: 'APEX RAIDER', seed2: '03', score2: 3, win: 2 },
      final: {
        team1: 'VORTEX ESPORTS',
        team2: 'APEX RAIDER',
        score1: 2,
        score2: 1,
        status: 'MATCH 4 LIVE',
      }
    }
  },
  {
    id: 'freefire',
    tag: 'TACTICAL 4V4',
    name: 'FREE FIRE',
    subtitle: 'Free Fire MAX Clash Squad',
    mode: 'Clash Squad Ranked · Bermuda',
    tournamentsCount: '8 Active Brackets',
    bracket: {
      seriesTitle: 'VARSITY CLASH INVITATIONAL',
      stage: 'CHAMPIONSHIP DECIDER // BO7',
      map: 'Bermuda (Clock Tower)',
      eloImpact: '+38 / -22 ELO',
      semisA: { team1: 'IGNITE CAMPUS', seed1: '01', score1: 4, team2: 'SHADOW LEGION', seed2: '04', score2: 2, win: 1 },
      semisB: { team1: 'BLAZE SQUAD', seed1: '02', score1: 3, team2: 'NIGHT RAID', seed2: '03', score2: 4, win: 2 },
      final: {
        team1: 'IGNITE CAMPUS',
        team2: 'NIGHT RAID',
        score1: 3,
        score2: 3,
        status: 'DECIDER ROUND',
      }
    }
  },
  {
    id: 'efootball',
    tag: '1V1 COMPETITIVE',
    name: 'eFOOTBALL',
    subtitle: 'eFootball 2026 Competitive League',
    mode: 'Solo Division · Regulation & ET',
    tournamentsCount: '16 Active Brackets',
    bracket: {
      seriesTitle: 'COLLEGE DERBY MASTERS',
      stage: 'NATIONAL FINAL // 1V1',
      map: 'Camp Nou Arena',
      eloImpact: '+48 / -32 ELO',
      semisA: { team1: 'Dutta_R9', seed1: '01', score1: 2, team2: 'Kolkata_FC', seed2: '04', score2: 0, win: 1 },
      semisB: { team1: 'Apex_Striker', seed1: '02', score1: 1, team2: 'Phantom_Messi', seed2: '03', score2: 3, win: 2 },
      final: {
        team1: 'Dutta_R9',
        team2: 'Phantom_Messi',
        score1: 2,
        score2: 2,
        status: 'EXTRA TIME',
      }
    }
  }
]

const STATS = [
  { value: '1,850+', label: 'Registered Athletes' },
  { value: '124', label: 'Completed Cups' },
  { value: '4,890', label: 'Matches Logged' },
  { value: '99.8%', label: 'Fair-Play Accuracy' },
]

const FEATURES = [
  {
    icon: <Icons.Chart />,
    tag: 'ALGORITHMIC RANKING',
    title: 'Precision ELO Engine',
    desc: 'Transparent rating adjustments calculated from your opponent’s verified strength. Climb from Bronze to Collegiate Grandmaster with zero rating inflation.'
  },
  {
    icon: <Icons.GitBranch />,
    tag: 'SEAMLESS BRACKETS',
    title: 'Automated Match Progression',
    desc: 'Real-time single elimination trees with automated seed pairing and immediate advancement upon score confirmation.'
  },
  {
    icon: <Icons.Shield />,
    tag: 'DISPUTE PREVENTION',
    title: 'Organiser Verification Panel',
    desc: 'Proof-based score validation with organizer oversight, dispute resolution, and verifiable competitive records.'
  }
]

export default function LandingPage({ isAuthenticated }) {
  const [activeGame, setActiveGame] = useState(GAMES[0])

  return (
    <div className="relative min-h-screen w-full bg-[#05070E] text-slate-100 font-sans selection:bg-cyan-400 selection:text-black antialiased overflow-x-hidden">
      
      {/* ========================================================
          HERO BACKGROUND: REAL ESPORTS ARENA PHOTO (INTEGRATED)
          High clarity with cinematic luxury vignette & lighting
         ======================================================== */}
      <div className="absolute top-0 left-0 right-0 h-[880px] lg:h-[940px] overflow-hidden pointer-events-none z-0">
        {/* Background Image: Crisp, vibrant arena stage with high contrast */}
        <img
          src={arenaBg}
          alt="Esports Championship Arena Stage"
          className="w-full h-full object-cover object-center scale-100 filter brightness-95 contrast-110"
        />

        {/* Cinematic gradient overlays:
            1. Left side shadow to ensure 100% sharp text legibility
            2. Top bar darken for navbar glassmorphism
            3. Bottom fade to seamlessly transition into deep onyx slate */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070E] via-[#05070E]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070E] via-[#05070E]/50 to-[#05070E]/70" />
        
        {/* Subtle radial cyan stage spotlight */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* ========================================================
          HEADER NAVIGATION: LUXURY FROSTED OBSIDIAN GLASS
         ======================================================== */}
      <header className="relative z-40 w-full border-b border-white/[0.08] bg-[#05070E]/75 backdrop-blur-md sticky top-0 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/15 shadow-inner text-cyan-400 group-hover:border-cyan-400/50 group-hover:text-cyan-300 transition-all duration-300">
              <Icons.Trophy />
              <div className="absolute -inset-0.5 rounded-lg bg-cyan-400/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-white font-['Space_Grotesk'] uppercase">
                  Campus Community Hub
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-widest text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 rounded">
                  PRO
                </span>
              </div>
              <p className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
                Collegiate Esports League
              </p>
            </div>
          </Link>

          {/* Center Status: Live Matchmaking Telemetry */}
          <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#0B0F19]/90 border border-white/10 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-emerald-400 font-semibold tracking-wider">MATCHMAKING ONLINE</span>
            <span className="text-white/20">|</span>
            <span className="text-slate-400 text-[11px]">18ms REGION: ASIA-SOUTH</span>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/tournaments"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#05070E] font-bold text-xs tracking-wider uppercase shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all duration-200"
              >
                <span>Enter Arena</span>
                <Icons.ArrowRight />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold tracking-wider uppercase text-slate-300 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[#05070E] font-extrabold text-xs tracking-wider uppercase shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all duration-200 hover:scale-[1.02]"
                >
                  <span>Sign Up</span>
                  <Icons.ArrowRight />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================
          HERO SECTION: ENTER THE ARENA + TOURNAMENT HUD
         ======================================================== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 lg:pt-16 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

          {/* HERO LEFT COLUMN */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            
            {/* Status Header Badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0B0F19]/90 border border-emerald-500/30 text-emerald-400 text-xs font-mono tracking-wider font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                MATCHMAKING ONLINE
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-mono tracking-widest uppercase">
                <span className="text-cyan-400">#</span>
                CAMPUS COMMUNITY HUB
              </div>
            </div>

            {/* Main Headline: Razor-sharp typography */}
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black font-['Space_Grotesk'] tracking-tight text-white uppercase leading-[1.03]">
                ENTER THE{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_40px_rgba(6,182,212,0.4)]">
                  ARENA
                </span>
              </h1>
            </div>

            {/* Supporting Line */}
            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-xl">
              College esports tournaments. Ranked matchmaking.{' '}
              <span className="text-white font-medium">Your game, your ELO.</span>
            </p>

            {/* Premium Game Chips Selector */}
            <div className="w-full pt-2">
              <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-slate-400 uppercase mb-3">
                <span>SELECT TOURNAMENT DIVISION</span>
                <span className="text-cyan-400 font-bold">{activeGame.tournamentsCount}</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {GAMES.map((game) => {
                  const isSelected = activeGame.id === game.id
                  return (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => setActiveGame(game)}
                      className={`relative group p-4 rounded-xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#0B101E]/95 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
                          : 'bg-[#0B0F19]/70 border-white/[0.08] hover:border-white/20 hover:bg-[#0B0F19]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-mono tracking-widest uppercase font-semibold ${
                          isSelected ? 'text-cyan-300' : 'text-slate-500'
                        }`}>
                          {game.tag}
                        </span>
                        {isSelected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                        )}
                      </div>

                      <div className={`text-sm sm:text-base font-black font-['Space_Grotesk'] tracking-wider ${
                        isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                      }`}>
                        {game.name}
                      </div>

                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {game.mode}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="w-full pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[#05070E] font-black text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Sign Up & Compete</span>
                <Icons.ArrowRight />
              </Link>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#0B0F19]/90 hover:bg-[#101524] text-slate-200 hover:text-white font-bold text-sm tracking-wider uppercase border border-white/10 hover:border-cyan-400/40 transition-all duration-200"
              >
                <Icons.Shield />
                <span>Player Log In</span>
              </Link>
            </div>

            {/* Sub-link for Organisers */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-1">
              <span>Hosting an inter-college tournament?</span>
              <Link
                to="/organiser-login"
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Organiser Portal</span>
                <Icons.ChevronRight />
              </Link>
            </div>

            {/* Clean Statistics Strip */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/[0.08]">
              {STATS.map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black font-['Space_Grotesk'] text-white">
                    {stat.value}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* HERO RIGHT COLUMN: HIGH-TECH TOURNAMENT HUD */}
          <div className="lg:col-span-5 relative">
            
            {/* Ambient Cyan Stage Glow behind the HUD card */}
            <div className="absolute -inset-1 rounded-3xl bg-cyan-500/20 blur-2xl opacity-60 pointer-events-none" />

            {/* Obsidian Glass HUD Card */}
            <div className="relative rounded-2xl bg-[#090D18]/90 border border-white/15 p-5 sm:p-6 shadow-[0_30px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
              
              {/* Top HUD Telemetry */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                    <span className="text-[11px] font-mono tracking-widest text-cyan-300 uppercase font-bold">
                      {activeGame.bracket.seriesTitle}
                    </span>
                  </div>
                  <h3 className="text-lg font-black font-['Space_Grotesk'] text-white mt-1">
                    {activeGame.bracket.stage}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    SPECTATING
                  </span>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    {activeGame.bracket.map}
                  </p>
                </div>
              </div>

              {/* Tournament Bracket Representation */}
              <div className="space-y-4">
                
                {/* Round Label */}
                <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-400 uppercase">
                  <span>Semi-Final Matches (BO3)</span>
                  <span>Grand Final (BO5)</span>
                </div>

                {/* Match A */}
                <div className="p-3.5 rounded-xl bg-[#0D1322] border border-white/[0.08] hover:border-white/20 transition-colors">
                  <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono text-slate-500 w-5">#{activeGame.bracket.semisA.seed1}</span>
                      <span className="text-xs font-bold text-white tracking-wide">{activeGame.bracket.semisA.team1}</span>
                    </div>
                    <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      {activeGame.bracket.semisA.score1}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 pt-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono text-slate-500 w-5">#{activeGame.bracket.semisA.seed2}</span>
                      <span className="text-xs font-semibold text-slate-400 tracking-wide">{activeGame.bracket.semisA.team2}</span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-500 px-2 py-0.5">
                      {activeGame.bracket.semisA.score2}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/[0.04] text-[10px] font-mono text-slate-400">
                    <span className="text-emerald-400 font-semibold">ADVANCED TO FINALS</span>
                    <span>CONFIRMED RESULT</span>
                  </div>
                </div>

                {/* Match B */}
                <div className="p-3.5 rounded-xl bg-[#0D1322] border border-white/[0.08] hover:border-white/20 transition-colors">
                  <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono text-slate-500 w-5">#{activeGame.bracket.semisB.seed1}</span>
                      <span className="text-xs font-semibold text-slate-400 tracking-wide">{activeGame.bracket.semisB.team1}</span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-500 px-2 py-0.5">
                      {activeGame.bracket.semisB.score1}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 pt-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono text-slate-500 w-5">#{activeGame.bracket.semisB.seed2}</span>
                      <span className="text-xs font-bold text-white tracking-wide">{activeGame.bracket.semisB.team2}</span>
                    </div>
                    <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      {activeGame.bracket.semisB.score2}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/[0.04] text-[10px] font-mono text-slate-400">
                    <span className="text-emerald-400 font-semibold">ADVANCED TO FINALS</span>
                    <span>CONFIRMED RESULT</span>
                  </div>
                </div>

                {/* Championship Match Card (Active) */}
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-[#0F172A] via-[#0B101E] to-[#0A1424] border border-cyan-400/40 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono tracking-widest text-amber-300 font-bold uppercase flex items-center gap-1.5">
                      <Icons.Trophy />
                      CHAMPIONSHIP MATCH
                    </span>
                    <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-400/30 px-2 py-0.5 rounded">
                      {activeGame.bracket.final.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 items-center gap-2 py-1">
                    <div className="col-span-3">
                      <p className="text-xs font-extrabold text-white truncate">{activeGame.bracket.final.team1}</p>
                      <p className="text-[10px] font-mono text-cyan-400">FINALIST 01</p>
                    </div>

                    <div className="col-span-1 text-center font-mono font-black text-sm text-cyan-300 bg-[#05070E] py-1.5 rounded border border-white/10">
                      {activeGame.bracket.final.score1}:{activeGame.bracket.final.score2}
                    </div>

                    <div className="col-span-3 text-right">
                      <p className="text-xs font-extrabold text-white truncate">{activeGame.bracket.final.team2}</p>
                      <p className="text-[10px] font-mono text-cyan-400">FINALIST 02</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">RATING AT STAKE:</span>
                    <span className="text-cyan-300 font-bold">{activeGame.bracket.eloImpact}</span>
                  </div>
                </div>

              </div>

              {/* Bottom Telemetry */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>BRACKET PROTOCOL // SINGLE ELIMINATION</span>
                <span className="text-cyan-400">ENGINE v2.4</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          FEATURES: ARCHITECTED FOR COLLEGIATE ESPORTS
         ======================================================== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.08]">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
            ENGINEERED FOR SERIOUS COMPETITION
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-['Space_Grotesk'] text-white uppercase tracking-tight mt-2">
            The Complete Campus Tournament Stack
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
            Eliminating manual paperwork, disputed match scores, and unranked friendly games with a verifiable competitive ladder.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => (
            <div
              key={i}
              className="p-7 rounded-2xl bg-[#090D18]/80 border border-white/[0.08] hover:border-cyan-400/30 transition-all duration-300 hover:translate-y-[-2px] group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-105 group-hover:text-cyan-300 transition-all">
                {feat.icon}
              </div>
              <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                {feat.tag}
              </div>
              <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white mt-1 mb-2">
                {feat.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          BOTTOM CTA: CALL TO ACTION
         ======================================================== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-[#090E1C] via-[#0B1224] to-[#070B14] p-8 sm:p-14 text-center shadow-2xl">
          {/* Subtle cyan glow in the center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
              BECOME A CAMPUS LEGEND
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-['Space_Grotesk'] text-white uppercase tracking-tight">
              Ready to Claim Your College Title?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Create your player profile, register with your squad, and represent your college in official campus cups.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[#05070E] font-black text-xs tracking-wider uppercase shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all hover:scale-105"
              >
                Create Player Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#090D18] hover:bg-[#101524] text-slate-200 font-bold text-xs tracking-wider uppercase border border-white/10 hover:border-cyan-400/40 transition-all"
              >
                Player Log In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FOOTER: MINIMALIST CYBER / BROADCAST FOOTER
         ======================================================== */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-[#030408] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-cyan-400">
              <Icons.Trophy />
            </div>
            <div>
              <p className="text-sm font-black font-['Space_Grotesk'] tracking-wider text-white uppercase">
                CAMPUS COMMUNITY HUB
              </p>
              <p className="text-[11px] font-mono text-slate-500">
                Official Collegiate Esports Ranked Infrastructure
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400">
            <Link to="/tournaments" className="hover:text-cyan-400 transition-colors">Tournaments</Link>
            <Link to="/leaderboard" className="hover:text-cyan-400 transition-colors">Leaderboard</Link>
            <Link to="/login" className="hover:text-cyan-400 transition-colors">Player Login</Link>
            <Link to="/register" className="hover:text-cyan-400 transition-colors">Sign Up</Link>
            <Link to="/organiser-login" className="hover:text-cyan-400 transition-colors">Organiser Portal</Link>
          </div>

          <div className="text-xs font-mono text-slate-600">
            © 2026 Campus Community Hub. Built for competitive campus play.
          </div>
        </div>
      </footer>

    </div>
  )
}
