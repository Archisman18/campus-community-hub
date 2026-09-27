import { useState } from 'react'
import { Link } from 'react-router-dom'
import arenaBg from '../assets/arena-bg.jpg'

const GAMES = [
  {
    id: 'bgmi',
    name: 'BGMI',
    fullName: 'Battlegrounds Mobile India',
    mode: 'Battle Royale · Squads & Duos',
    activeTournaments: '12 Active Cups',
    badgeColor: 'from-amber-500 to-orange-600',
    accentColor: '#f59e0b',
    icon: '🎯',
    bracket: {
      title: 'BGMI CAMPUS SHOWDOWN · GRAND FINALS',
      round: 'ROUND 3 - CHAMPIONSHIP MATCH',
      matchA: { team1: 'Hydra College', score1: 3, team2: 'Soul Strikers', score2: 1, winner: 1 },
      matchB: { team1: 'GodL Campus', score1: 2, team2: 'Velocity Esports', score2: 3, winner: 2 },
      final: { team1: 'Hydra College', score1: 1, team2: 'Velocity Esports', score2: 0, status: 'LIVE ON STAGE' },
      eloChange: '+45 / -28 ELO',
      map: 'Erangel (Military Base)'
    }
  },
  {
    id: 'freefire',
    name: 'FREE FIRE',
    fullName: 'Garena Free Fire MAX',
    mode: 'Clash Squad · 4v4 Ranked',
    activeTournaments: '8 Active Cups',
    badgeColor: 'from-yellow-400 to-red-500',
    accentColor: '#ef4444',
    icon: '🔥',
    bracket: {
      title: 'CLASH SQUAD INTER-COLLEGE INVITATIONAL',
      round: 'SEMI-FINALS & FINALS',
      matchA: { team1: 'Total Gaming Unit', score1: 4, team2: 'Desi Gamers Squad', score2: 2, winner: 1 },
      matchB: { team1: 'Ignite Campus', score1: 1, team2: 'Night Raid Elite', score2: 4, winner: 2 },
      final: { team1: 'Total Gaming Unit', score1: 3, team2: 'Night Raid Elite', score2: 3, status: 'DECIDER ROUND' },
      eloChange: '+38 / -22 ELO',
      map: 'Bermuda (Clock Tower)'
    }
  },
  {
    id: 'efootball',
    name: 'eFOOTBALL',
    fullName: 'eFootball 2026 Mobile/PC',
    mode: '1v1 Division · Competitive League',
    activeTournaments: '15 Active Cups',
    badgeColor: 'from-cyan-400 to-blue-600',
    accentColor: '#06b6d4',
    icon: '⚽',
    bracket: {
      title: 'VARSITY EFOOTBALL DERBY CUP',
      round: 'ROUND OF 4 · ELIMINATION',
      matchA: { team1: 'Dutta_R9', score1: 2, team2: 'Kolkata_King', score2: 1, winner: 1 },
      matchB: { team1: 'Apex_Striker', score1: 0, team2: 'Phantom_Messi', score2: 3, winner: 2 },
      final: { team1: 'Dutta_R9', score1: 1, team2: 'Phantom_Messi', score2: 1, status: 'EXTRA TIME' },
      eloChange: '+50 / -30 ELO',
      map: 'Camp Nou Arena'
    }
  }
]

const STATS = [
  { label: 'Active College Players', value: '1,850+', icon: '👥' },
  { label: 'Tournaments Hosted', value: '120+', icon: '🏆' },
  { label: 'Total Matches Played', value: '4,500+', icon: '⚔️' },
  { label: 'ELO Rating Accuracy', value: '99.8%', icon: '⚡' },
]

const FEATURES = [
  {
    tag: 'RANKED MATCHMAKING',
    title: 'Precision Campus ELO Rating',
    description: 'Every match stakes your rank. Powered by algorithmic ELO calculations calibrated specifically for collegiate competition.',
    icon: '📊'
  },
  {
    tag: 'AUTOMATED BRACKETS',
    title: 'Instant Tournament Progression',
    description: 'Automatic round generation, single elimination brackets, and automated winner seeding with zero manual delay.',
    icon: '🌲'
  },
  {
    tag: 'FAIR PLAY VERIFICATION',
    title: 'Organiser Verification & Anti-Dispute',
    description: 'Tournament organisers verify match proofs and approve disputed rounds directly from a dedicated control dashboard.',
    icon: '🛡️'
  }
]

export default function LandingPage({ isAuthenticated }) {
  const [selectedGame, setSelectedGame] = useState(GAMES[0])

  return (
    <div className="relative min-h-screen w-full bg-[#050811] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      {/* Background Arena Image with Cyber Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={arenaBg}
          alt="Esports Arena Background"
          className="w-full h-full object-cover object-center opacity-35 scale-105 filter brightness-75 contrast-125"
        />
        {/* Deep ambient vignette and color grades */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050811]/90 via-[#070d1e]/85 to-[#050811] mix-blend-multiply" />
        <div className="absolute inset-0 bg-radial-gradient from-cyan-600/10 via-transparent to-transparent" />
        {/* Subtle cyber grid lines */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />
      </div>

      {/* Top Glassmorphic Navigation Bar */}
      <header className="relative z-30 w-full border-b border-cyan-500/15 bg-[#070b16]/75 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/25 border border-cyan-300/30 group-hover:scale-105 transition-transform duration-300">
              <span className="text-xl">🏆</span>
              <div className="absolute -inset-1 rounded-lg bg-cyan-400/20 blur group-hover:bg-cyan-400/35 transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-wider text-white font-['Space_Grotesk'] uppercase flex items-center gap-2">
                CAMPUS COMMUNITY HUB
                <span className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 rounded">
                  ESPORTS
                </span>
              </span>
              <span className="text-[11px] font-mono text-cyan-400/80 tracking-widest uppercase">
                Collegiate Tournament & ELO Arena
              </span>
            </div>
          </Link>

          {/* Center: Live Matchmaking Indicator Pill */}
          <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 text-xs font-mono text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-bold tracking-widest">MATCHMAKING ONLINE</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 text-[11px]">18ms ASIA-SOUTH</span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/tournaments"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/30 transition-all hover:scale-[1.02] border border-cyan-300/40"
              >
                <span>ENTER ARENA</span>
                <span>→</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 border border-slate-700/60 hover:border-cyan-500/40 transition-all duration-200"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="relative group overflow-hidden px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 border border-cyan-400/40 hover:shadow-cyan-400/40 hover:scale-[1.02] transition-all duration-200"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    Sign Up
                    <span className="text-xs">⚡</span>
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 lg:pt-14 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Hero Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            
            {/* Live Status + Brand Tag */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-mono tracking-wider font-semibold shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                MATCHMAKING ONLINE
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-widest uppercase">
                <span className="text-cyan-400">⚡</span>
                CAMPUS COMMUNITY HUB // S2
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black font-['Space_Grotesk'] tracking-tight text-white uppercase leading-[1.05]">
                ENTER THE{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(14,165,233,0.45)]">
                    ARENA
                  </span>
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                </span>
              </h1>
            </div>

            {/* Supporting Line */}
            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
              College esports tournaments. Ranked matchmaking.{' '}
              <span className="text-cyan-300 font-semibold">Your game, your ELO.</span>
            </p>

            {/* Three Game Chips Selector */}
            <div className="w-full pt-2">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span>SELECT TOURNAMENT TITLE:</span>
                <span className="h-px flex-1 bg-slate-800" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {GAMES.map((game) => {
                  const isSelected = selectedGame.id === game.id
                  return (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => setSelectedGame(game)}
                      className={`relative group flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all duration-300 ${
                        isSelected
                          ? 'bg-slate-900/90 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.35)] scale-[1.02]'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-600 hover:bg-slate-900/50'
                      }`}
                    >
                      {/* Active Glowing Border Accent */}
                      {isSelected && (
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                      )}

                      <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                        {game.icon}
                      </span>
                      <span className={`text-xs sm:text-sm font-black font-['Space_Grotesk'] tracking-wider ${
                        isSelected ? 'text-white' : 'text-slate-300'
                      }`}>
                        {game.name}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400/90 mt-0.5 hidden sm:inline-block">
                        {game.activeTournaments}
                      </span>

                      {/* Small Active Corner Pip */}
                      {isSelected && (
                        <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* CTAs / Authentication Actions */}
            <div className="w-full pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-base tracking-wide shadow-xl shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-cyan-300/40"
              >
                <span>SIGN UP & COMPETE</span>
                <span className="text-lg">→</span>
              </Link>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-850 text-slate-200 hover:text-white font-bold text-base tracking-wide border border-slate-700 hover:border-cyan-500/50 shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                <span>PLAYER LOG IN</span>
                <span className="text-slate-400">🛡️</span>
              </Link>
            </div>

            {/* Organiser Direct Link */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-1">
              <span>Hosting a campus cup?</span>
              <Link
                to="/organiser-login"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-semibold flex items-center gap-1"
              >
                Organiser Portal Access →
              </Link>
            </div>

            {/* Live Stats Row */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
              {STATS.map((stat, index) => (
                <div key={index} className="flex flex-col p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <span>{stat.icon}</span>
                    <span className="truncate">{stat.label}</span>
                  </div>
                  <span className="text-lg sm:text-xl font-black font-['Space_Grotesk'] text-white mt-1">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Hero Right Column: Tournament Bracket & HUD Visual Treatment */}
          <div className="lg:col-span-5 relative">
            
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-600/20 blur-xl opacity-75" />

            {/* Outer HUD Container */}
            <div className="relative rounded-2xl bg-[#090e1c]/90 border border-cyan-500/30 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
              
              {/* Sci-Fi HUD Corner Elements */}
              <div className="absolute top-2 left-2 text-cyan-400/40 font-mono text-[10px] select-none">┌ [ARENA_HUD_V2]</div>
              <div className="absolute top-2 right-2 text-cyan-400/40 font-mono text-[10px] select-none">NODE: 04 ┐</div>
              <div className="absolute bottom-2 left-2 text-cyan-400/40 font-mono text-[10px] select-none">└ STATUS: ACTIVE</div>
              <div className="absolute bottom-2 right-2 text-cyan-400/40 font-mono text-[10px] select-none">100 FPS ┘</div>

              {/* HUD Header */}
              <div className="border-b border-slate-800 pb-4 mb-5 pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    LIVE TOURNAMENT BRACKET
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/80 border border-red-500/40 text-red-400 animate-pulse">
                    ● SPECTATING
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white font-['Space_Grotesk'] tracking-wide">
                  {selectedGame.bracket.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                  <span>{selectedGame.fullName}</span>
                  <span>•</span>
                  <span className="text-amber-400">{selectedGame.bracket.map}</span>
                </div>
              </div>

              {/* Tournament Bracket Visualizer */}
              <div className="space-y-4">
                
                {/* Round Header */}
                <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <span>Semi-Finals (BO3)</span>
                  <span>Championship Final (BO5)</span>
                </div>

                {/* Match 1 */}
                <div className="relative p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500/40 transition-colors">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center font-mono">1</span>
                      {selectedGame.bracket.matchA.team1}
                    </span>
                    <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded">
                      {selectedGame.bracket.matchA.score1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 pt-1.5">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-slate-800 text-slate-400 text-[10px] flex items-center justify-center font-mono">2</span>
                      {selectedGame.bracket.matchA.team2}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500 px-2 py-0.5">
                      {selectedGame.bracket.matchA.score2}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center justify-between">
                    <span>ADVANCED TO FINALS</span>
                    <span>✓ CONFIRMED</span>
                  </div>
                </div>

                {/* Match 2 */}
                <div className="relative p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500/40 transition-colors">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-slate-800 text-slate-400 text-[10px] flex items-center justify-center font-mono">3</span>
                      {selectedGame.bracket.matchB.team1}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500 px-2 py-0.5">
                      {selectedGame.bracket.matchB.score1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 pt-1.5">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center font-mono">4</span>
                      {selectedGame.bracket.matchB.team2}
                    </span>
                    <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded">
                      {selectedGame.bracket.matchB.score2}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center justify-between">
                    <span>ADVANCED TO FINALS</span>
                    <span>✓ CONFIRMED</span>
                  </div>
                </div>

                {/* Grand Finals Card (Active Match Highlight) */}
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-blue-950/40 border-2 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                      🏆 CHAMPIONSHIP DECIDER
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold animate-pulse">
                      {selectedGame.bracket.final.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 items-center gap-2 py-1">
                    <div className="col-span-3 text-left">
                      <p className="text-xs font-bold text-white truncate">{selectedGame.bracket.final.team1}</p>
                      <p className="text-[10px] font-mono text-cyan-400">SEED #1</p>
                    </div>

                    <div className="col-span-1 text-center font-mono font-black text-sm text-cyan-300 bg-slate-950/80 py-1 rounded border border-cyan-500/30">
                      {selectedGame.bracket.final.score1}:{selectedGame.bracket.final.score2}
                    </div>

                    <div className="col-span-3 text-right">
                      <p className="text-xs font-bold text-white truncate">{selectedGame.bracket.final.team2}</p>
                      <p className="text-[10px] font-mono text-cyan-400">SEED #2</p>
                    </div>
                  </div>

                  {/* ELO Stakes Strip */}
                  <div className="mt-3 pt-2.5 border-t border-cyan-500/20 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">RATING IMPACT:</span>
                    <span className="text-cyan-300 font-bold tracking-wider">
                      {selectedGame.bracket.eloChange}
                    </span>
                  </div>
                </div>

              </div>

              {/* HUD Micro Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>SYSTEM: AUTOMATED TOURNAMENT SEEDER</span>
                <span className="text-cyan-400">ONLINE · v2.4</span>
              </div>
            </div>

          </div>

        </div>

        {/* Features / Why Campus Community Hub Section */}
        <div className="mt-24 pt-12 border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30">
              BUILT FOR CAMPUS COMPETITION
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-['Space_Grotesk'] text-white uppercase mt-4">
              Everything Needed For Collegiate Esports
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              From automated single elimination brackets to real-time player ELO ratings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 hover:translate-y-[-2px] group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
                  {feature.tag}
                </div>
                <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white mt-1 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-20 relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/50 p-8 sm:p-12 text-center shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black font-['Space_Grotesk'] text-white uppercase tracking-tight">
              Ready to Claim Your College Title?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Create your account in seconds, link your gamer ID, and register for this week's campus tournaments.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm tracking-wider shadow-lg shadow-cyan-500/30 transition-all hover:scale-105"
              >
                CREATE PLAYER ACCOUNT
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm tracking-wider border border-slate-700 hover:border-cyan-400/50 transition-all"
              >
                LOG IN TO ARENA
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#04060d] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xl">🏆</span>
            <div>
              <p className="text-sm font-black font-['Space_Grotesk'] tracking-wider text-white uppercase">
                CAMPUS COMMUNITY HUB
              </p>
              <p className="text-[11px] font-mono text-slate-500">
                Collegiate Esports Ranked Tournament Platform
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
            © 2026 Campus Community Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
