// ==========================================
// Match Simulator & Real-Time 60 FPS Canvas Engine
// Silky-Smooth Continuous Interpolation Loop
// ==========================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  League,
  Tactic,
  MatchSimulationResult,
  MatchLivePlayer
} from '../../types';
import { FormationEngine } from '../../engine/tactics/formations';
import { MatchSimulator } from '../../engine/match/simulator';
import {
  Play,
  Pause,
  FastForward,
  SkipForward,
  RotateCcw,
  Sparkles,
  Volume2,
  Crosshair,
  Flag,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';

interface MatchSimulatorViewProps {
  league: League;
  currentTactic: Tactic;
  initialHomeClubId?: string;
  initialAwayClubId?: string;
  onMatchFinished: (result: MatchSimulationResult) => void;
}

interface InterpolatedPlayer extends MatchLivePlayer {
  canvasX: number;
  canvasY: number;
}

export const MatchSimulatorView: React.FC<MatchSimulatorViewProps> = ({
  league,
  currentTactic,
  initialHomeClubId,
  initialAwayClubId,
  onMatchFinished
}) => {
  const [homeClubId, setHomeClubId] = useState<string>(initialHomeClubId ?? league.clubs[0]?.id ?? '');
  const [awayClubId, setAwayClubId] = useState<string>(initialAwayClubId ?? league.clubs[1]?.id ?? '');
  const [matchSeed, setMatchSeed] = useState<string>('derby-match-01');

  // Simulation state
  const [simulationResult, setSimulationResult] = useState<MatchSimulationResult | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 5x, 10x
  const [displayTickIndex, setDisplayTickIndex] = useState<number>(0);
  const [commentaryFilter, setCommentaryFilter] = useState<'all' | 'goals' | 'shots' | 'cards'>('all');

  // Animation and state refs to avoid effect cascades
  const isPlayingRef = useRef<boolean>(false);
  const playbackSpeedRef = useRef<number>(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const tickFloatRef = useRef<number>(0);
  const simulationResultRef = useRef<MatchSimulationResult | null>(null);
  const onMatchFinishedRef = useRef(onMatchFinished);

  // Keep refs in sync
  useEffect(() => {
    onMatchFinishedRef.current = onMatchFinished;
  }, [onMatchFinished]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    simulationResultRef.current = simulationResult;
  }, [simulationResult]);

  // Mouse hover state for canvas
  const [hoveredPlayer, setHoveredPlayer] = useState<InterpolatedPlayer | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const interpolatedPlayersRef = useRef<InterpolatedPlayer[]>([]);

  const commentaryContainerRef = useRef<HTMLDivElement | null>(null);
  const lastScrolledEventCountRef = useRef<number>(0);

  // Sync if initial props change
  useEffect(() => {
    if (initialHomeClubId) setHomeClubId(initialHomeClubId);
    if (initialAwayClubId) setAwayClubId(initialAwayClubId);
  }, [initialHomeClubId, initialAwayClubId]);

  const homeClub = league.clubs.find(c => c.id === homeClubId) ?? league.clubs[0];
  const awayClub = league.clubs.find(c => c.id === awayClubId) ?? league.clubs[1];

  // Run Simulation (explicitly triggered or on club change)
  const runSimulation = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;

    const homeTactic = FormationEngine.populateStarting11(currentTactic, homeClub.players);
    const awayTactic = FormationEngine.populateStarting11(FormationEngine.create4231(), awayClub.players);

    const simulator = new MatchSimulator(matchSeed);
    const result = simulator.simulate(homeClub, awayClub, homeTactic, awayTactic, true);

    setSimulationResult(result);
    simulationResultRef.current = result;
    tickFloatRef.current = 0;
    setDisplayTickIndex(0);

    onMatchFinishedRef.current?.(result);
  }, [currentTactic, homeClub, awayClub, matchSeed]);

  // Auto-simulate ONLY when matchup IDs or seed change
  useEffect(() => {
    runSimulation();
  }, [homeClubId, awayClubId, matchSeed, runSimulation]);

  // Toggle Play / Pause handler
  const handleTogglePlay = () => {
    if (simulationResult) {
      if (tickFloatRef.current >= simulationResult.ticks.length - 1) {
        tickFloatRef.current = 0;
        setDisplayTickIndex(0);
      }
    }
    lastTimeRef.current = performance.now();
    setIsPlaying(prev => {
      const next = !prev;
      isPlayingRef.current = next;
      return next;
    });
  };

  // Keyboard shortcut: Space to toggle play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        handleTogglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Current active tick for scoreboard
  const activeTick = simulationResult?.ticks[displayTickIndex];
  const currentMinute = activeTick ? activeTick.minute : (simulationResult?.stats.homeScore !== undefined ? 90 : 0);
  const currentActualTick = activeTick ? activeTick.tick : (displayTickIndex * 2);

  // Filter events up to current tick
  const visibleEvents = simulationResult
    ? simulationResult.events.filter(e => e.tick <= currentActualTick)
    : [];

  const filteredEvents = visibleEvents.filter(e => {
    if (commentaryFilter === 'goals') return e.type === 'goal';
    if (commentaryFilter === 'shots') return e.type === 'shot' || e.type === 'goal' || e.type === 'save' || e.type === 'block';
    if (commentaryFilter === 'cards') return e.type === 'yellow_card' || e.type === 'red_card' || e.type === 'foul' || e.type === 'offside';
    return true;
  });

  // Auto-scroll commentary only when new events arrive
  useEffect(() => {
    if (visibleEvents.length !== lastScrolledEventCountRef.current && commentaryContainerRef.current) {
      lastScrolledEventCountRef.current = visibleEvents.length;
      commentaryContainerRef.current.scrollTop = commentaryContainerRef.current.scrollHeight;
    }
  }, [visibleEvents.length]);

  // -------------------------------------------------------------
  // 60 FPS Canvas Rendering & Smooth Interpolation
  // -------------------------------------------------------------
  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    const simRes = simulationResultRef.current;
    if (!canvas || !simRes || simRes.ticks.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Clear & Draw Grass Pitch with Mowing Stripes
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#062d1f';
    ctx.fillRect(0, 0, width, height);

    const stripes = 12;
    const stripeWidth = width / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(5, 40, 27, 0.45)' : 'rgba(8, 54, 37, 0.45)';
      ctx.fillRect(i * stripeWidth, 0, stripeWidth, height);
    }

    // 2. Regulation White Pitch Markings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

    const pLeft = width * 0.025;
    const pRight = width * 0.975;
    const pTop = height * 0.035;
    const pBottom = height * 0.965;
    const pWidth = pRight - pLeft;
    const pHeight = pBottom - pTop;
    const midX = width * 0.5;
    const midY = height * 0.5;

    // Touchlines
    ctx.strokeRect(pLeft, pTop, pWidth, pHeight);

    // Halfway line
    ctx.beginPath();
    ctx.moveTo(midX, pTop);
    ctx.lineTo(midX, pBottom);
    ctx.stroke();

    // Center circle & spot
    const centerRadius = height * 0.14;
    ctx.beginPath();
    ctx.arc(midX, midY, centerRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(midX, midY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Penalty Boxes
    const boxW = pWidth * 0.16;
    const boxH = pHeight * 0.56;
    const boxTop = midY - boxH / 2;
    ctx.strokeRect(pLeft, boxTop, boxW, boxH);

    const smallBoxW = pWidth * 0.055;
    const smallBoxH = pHeight * 0.28;
    ctx.strokeRect(pLeft, midY - smallBoxH / 2, smallBoxW, smallBoxH);

    const leftPenSpotX = pLeft + pWidth * 0.105;
    ctx.beginPath();
    ctx.arc(leftPenSpotX, midY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(leftPenSpotX, midY, height * 0.12, -0.65, 0.65);
    ctx.stroke();

    // Right Penalty Box
    ctx.strokeRect(pRight - boxW, boxTop, boxW, boxH);
    ctx.strokeRect(pRight - smallBoxW, midY - smallBoxH / 2, smallBoxW, smallBoxH);

    const rightPenSpotX = pRight - pWidth * 0.105;
    ctx.beginPath();
    ctx.arc(rightPenSpotX, midY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(rightPenSpotX, midY, height * 0.12, Math.PI - 0.65, Math.PI + 0.65);
    ctx.stroke();

    // Goal mouth frames
    const goalH = height * 0.14;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(pLeft - 6, midY - goalH / 2, 6, goalH);
    ctx.fillRect(pRight, midY - goalH / 2, 6, goalH);

    // Corner arcs
    const cornerR = 8;
    ctx.beginPath();
    ctx.arc(pLeft, pTop, cornerR, 0, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pLeft, pBottom, cornerR, -Math.PI / 2, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pRight, pTop, cornerR, Math.PI / 2, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pRight, pBottom, cornerR, Math.PI, Math.PI * 1.5);
    ctx.stroke();

    // 3. Interpolate Player & Ball Positions
    const totalTicks = simRes.ticks.length;
    const currentTFloat = tickFloatRef.current;
    const baseIndex = Math.min(totalTicks - 1, Math.floor(currentTFloat));
    const nextIndex = Math.min(totalTicks - 1, baseIndex + 1);
    const rawAlpha = Math.max(0, Math.min(1, currentTFloat - baseIndex));

    const smoothAlpha = rawAlpha * rawAlpha * (3 - 2 * rawAlpha);

    const tickA = simRes.ticks[baseIndex];
    const tickB = simRes.ticks[nextIndex];

    const toCanvasX = (pctX: number) => pLeft + (pctX / 100) * pWidth;
    const toCanvasY = (pctY: number) => pTop + (pctY / 100) * pHeight;

    // Draw dynamic trajectory vector
    if (tickA.passTrajectory) {
      const fromX = toCanvasX(tickA.passTrajectory.fromX);
      const fromY = toCanvasY(tickA.passTrajectory.fromY);
      const toX = toCanvasX(tickA.passTrajectory.toX);
      const toY = toCanvasY(tickA.passTrajectory.toY);
      const isShot = tickA.passTrajectory.isShot;

      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = isShot ? 'rgba(245, 158, 11, 0.85)' : 'rgba(52, 211, 153, 0.75)';
      ctx.lineWidth = isShot ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Calculate and Draw all 22 Players
    const currentPlayers: InterpolatedPlayer[] = [];

    for (const pA of tickA.players) {
      const pB = tickB.players.find(p => p.id === pA.id) ?? pA;

      const interpolatedPctX = pA.x + (pB.x - pA.x) * smoothAlpha;
      const interpolatedPctY = pA.y + (pB.y - pA.y) * smoothAlpha;

      const px = toCanvasX(interpolatedPctX);
      const py = toCanvasY(interpolatedPctY);

      currentPlayers.push({
        ...pA,
        canvasX: px,
        canvasY: py
      });
    }

    interpolatedPlayersRef.current = currentPlayers;

    currentPlayers.sort((a, b) => (a.isCarrier ? 1 : 0) - (b.isCarrier ? 1 : 0));

    const playerRadius = Math.max(10, Math.min(13, width * 0.015));

    for (const player of currentPlayers) {
      const isHome = player.team === 'home';
      const club = isHome ? homeClub : awayClub;

      // Soft shadow under player feet
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(player.canvasX, player.canvasY + playerRadius * 0.7, playerRadius * 0.8, playerRadius * 0.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();
      ctx.restore();

      // Active Ball Carrier Halo
      if (player.isCarrier) {
        ctx.save();
        const pulseR = playerRadius + 3 + Math.sin(Date.now() / 150) * 2;
        ctx.beginPath();
        ctx.arc(player.canvasX, player.canvasY, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
      }

      // Active Pressing Challenger Ring
      if (player.isChallenger) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(player.canvasX, player.canvasY, playerRadius + 3, 0, Math.PI * 2);
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Player circle body
      ctx.save();
      ctx.beginPath();
      ctx.arc(player.canvasX, player.canvasY, playerRadius, 0, Math.PI * 2);
      ctx.fillStyle = club.primaryColor;
      ctx.fill();

      // Border ring
      ctx.lineWidth = 2;
      ctx.strokeStyle = isHome ? '#10b981' : '#818cf8';
      ctx.stroke();

      // Player number text
      ctx.fillStyle = club.secondaryColor || '#ffffff';
      ctx.font = `bold ${Math.round(playerRadius * 0.95)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(player.number), player.canvasX, player.canvasY + 0.5);

      // Bookings Badges
      if (player.hasYellowCard) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(player.canvasX + playerRadius * 0.4, player.canvasY - playerRadius * 1.1, 6, 9);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(player.canvasX + playerRadius * 0.4, player.canvasY - playerRadius * 1.1, 6, 9);
      }
      if (player.isSentOff) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(player.canvasX + playerRadius * 0.4, player.canvasY - playerRadius * 1.1, 6, 9);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(player.canvasX + playerRadius * 0.4, player.canvasY - playerRadius * 1.1, 6, 9);
      }

      ctx.restore();
    }

    // 5. Calculate and Draw Continuous Ball Physics
    let ballCanvasX: number;
    let ballCanvasY: number;
    let ballHeight = 0;

    if (tickA.passTrajectory) {
      const traj = tickA.passTrajectory;
      const startX = toCanvasX(traj.fromX);
      const startY = toCanvasY(traj.fromY);
      const endX = toCanvasX(traj.toX);
      const endY = toCanvasY(traj.toY);

      if (rawAlpha < 0.10) {
        ballCanvasX = startX;
        ballCanvasY = startY;
      } else if (rawAlpha > 0.85) {
        ballCanvasX = endX;
        ballCanvasY = endY;
      } else {
        const flightT = (rawAlpha - 0.10) / 0.75;
        const flightSmooth = flightT * flightT * (3 - 2 * flightT);
        ballCanvasX = startX + (endX - startX) * flightSmooth;
        ballCanvasY = startY + (endY - startY) * flightSmooth;

        const maxArcHeight = traj.isShot ? 16 : 10;
        ballHeight = Math.sin(flightT * Math.PI) * maxArcHeight;
      }
    } else {
      const bAX = toCanvasX(tickA.ballCoordinates.x);
      const bAY = toCanvasY(tickA.ballCoordinates.y);
      const bBX = toCanvasX(tickB.ballCoordinates.x);
      const bBY = toCanvasY(tickB.ballCoordinates.y);

      ballCanvasX = bAX + (bBX - bAX) * smoothAlpha;
      ballCanvasY = bAY + (bBY - bAY) * smoothAlpha;
    }

    // Ball Ground Shadow
    ctx.save();
    const shadowR = Math.max(3, 5 - ballHeight * 0.15);
    ctx.beginPath();
    ctx.ellipse(ballCanvasX, ballCanvasY + 3 + ballHeight * 0.2, shadowR * 1.3, shadowR * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();
    ctx.restore();

    // 3D Elevated Soccer Ball
    ctx.save();
    const ballR = Math.max(4.5, 5.5 + ballHeight * 0.1);
    const ballRenderY = ballCanvasY - ballHeight;

    ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    ctx.arc(ballCanvasX, ballRenderY, ballR, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ballCanvasX, ballRenderY, ballR * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.restore();

  }, [homeClub, awayClub]);

  // -------------------------------------------------------------
  // Persistent 60 FPS requestAnimationFrame Loop
  // -------------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loop = (timestamp: number) => {
      if (!active) return;

      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const deltaMs = Math.min(64, timestamp - lastTimeRef.current);
      lastTimeRef.current = timestamp;

      const simRes = simulationResultRef.current;
      if (isPlayingRef.current && simRes) {
        const totalTicks = simRes.ticks.length;
        const tickDurationMs = 1400 / playbackSpeedRef.current;
        const tickAdvance = deltaMs / tickDurationMs;

        tickFloatRef.current += tickAdvance;

        if (tickFloatRef.current >= totalTicks - 1) {
          tickFloatRef.current = totalTicks - 1;
          setIsPlaying(false);
          isPlayingRef.current = false;
        }

        const newDisplayIndex = Math.min(totalTicks - 1, Math.floor(tickFloatRef.current));
        setDisplayTickIndex(prev => (prev !== newDisplayIndex ? newDisplayIndex : prev));
      }

      drawScene();
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawScene]);

  // Canvas Mouse Move for Hover Tooltip
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    let found: InterpolatedPlayer | null = null;
    for (const p of interpolatedPlayersRef.current) {
      const dist = Math.hypot(p.canvasX - mouseX, p.canvasY - mouseY);
      if (dist < 16) {
        found = p;
        break;
      }
    }

    setHoveredPlayer(found);
    if (found) {
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    } else {
      setTooltipPos(null);
    }
  };

  // Live Scores & xG
  const liveHomeGoals = activeTick ? activeTick.homeScore : (simulationResult?.stats.homeScore ?? 0);
  const liveAwayGoals = activeTick ? activeTick.awayScore : (simulationResult?.stats.awayScore ?? 0);

  const liveHomeXg = simulationResult
    ? simulationResult.shots.filter(s => s.tick <= currentActualTick && s.team === 'home').reduce((a, b) => a + b.xG, 0)
    : 0;
  const liveAwayXg = simulationResult
    ? simulationResult.shots.filter(s => s.tick <= currentActualTick && s.team === 'away').reduce((a, b) => a + b.xG, 0)
    : 0;

  const visibleBookings = simulationResult
    ? simulationResult.bookings.filter(b => b.minute <= currentMinute)
    : [];

  const homeBookings = visibleBookings.filter(b => b.team === 'home');
  const awayBookings = visibleBookings.filter(b => b.team === 'away');

  const homeSentOff = homeBookings.some(b => b.type === 'red_card' || b.type === 'second_yellow');
  const awaySentOff = awayBookings.some(b => b.type === 'red_card' || b.type === 'second_yellow');

  return (
    <div className="space-y-6">
      {/* Match Setup Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Matchup Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono">HOME:</span>
            <select
              value={homeClubId}
              onChange={(e) => setHomeClubId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold font-mono cursor-pointer"
            >
              {league.clubs.map(c => (
                <option key={c.id} value={c.id} disabled={c.id === awayClubId}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-500 font-bold font-mono text-xs">VS</span>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono">AWAY:</span>
            <select
              value={awayClubId}
              onChange={(e) => setAwayClubId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold font-mono cursor-pointer"
            >
              {league.clubs.map(c => (
                <option key={c.id} value={c.id} disabled={c.id === homeClubId}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono">SEED:</span>
            <input
              type="text"
              value={matchSeed}
              onChange={(e) => setMatchSeed(e.target.value)}
              className="w-36 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono"
            />
          </div>
        </div>

        <button
          onClick={runSimulation}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs font-mono transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Simulate Match
        </button>
      </div>

      {/* Scoreboard and Temporal Scrubber */}
      {simulationResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Home Club Banner */}
            <div className="flex items-center gap-3 min-w-[200px]">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black font-mono text-base border border-white/20 shadow-lg"
                style={{ backgroundColor: homeClub.primaryColor, color: homeClub.secondaryColor || '#ffffff' }}
              >
                {homeClub.code}
              </div>
              <div>
                <div className="font-extrabold text-white text-base flex items-center gap-2">
                  {homeClub.name}
                  {homeSentOff && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 border border-red-500 text-red-300 font-mono font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-red-400" />
                      10 MEN
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  xG: <span className="text-emerald-400 font-bold">{liveHomeXg.toFixed(2)}</span>
                </div>
                {homeBookings.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {homeBookings.map((b, i) => (
                      <span key={i} className="text-[10px] font-mono text-slate-300 flex items-center gap-0.5">
                        {b.type === 'yellow_card' ? '🟨' : '🟥'} {b.playerName.split(' ').pop()} {b.minute}'
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Score & Live Match Clock */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-4 text-3xl md:text-4xl font-black font-mono tracking-tight text-white">
                <span>{liveHomeGoals}</span>
                <span className="text-slate-600">:</span>
                <span>{liveAwayGoals}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs font-mono font-semibold px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span>{currentMinute}' ({activeTick ? `${activeTick.second}s` : '0s'})</span>
                {currentMinute >= 90 && <span className="text-amber-400 ml-1 font-bold">FT</span>}
              </div>
            </div>

            {/* Away Club Banner */}
            <div className="flex items-center gap-3 min-w-[200px] justify-end text-right">
              <div>
                <div className="font-extrabold text-white text-base flex items-center justify-end gap-2">
                  {awaySentOff && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 border border-red-500 text-red-300 font-mono font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-red-400" />
                      10 MEN
                    </span>
                  )}
                  {awayClub.name}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  xG: <span className="text-emerald-400 font-bold">{liveAwayXg.toFixed(2)}</span>
                </div>
                {awayBookings.length > 0 && (
                  <div className="flex flex-wrap justify-end gap-1 mt-1">
                    {awayBookings.map((b, i) => (
                      <span key={i} className="text-[10px] font-mono text-slate-300 flex items-center gap-0.5">
                        {b.type === 'yellow_card' ? '🟨' : '🟥'} {b.playerName.split(' ').pop()} {b.minute}'
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black font-mono text-base border border-white/20 shadow-lg"
                style={{ backgroundColor: awayClub.primaryColor, color: awayClub.secondaryColor || '#ffffff' }}
              >
                {awayClub.code}
              </div>
            </div>
          </div>

          {/* Temporal Scrubber and Playback Bar */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            {/* Playback Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 font-black transition-all shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center justify-center"
                title={isPlaying ? 'Pause (Space)' : 'Play in 60 FPS (Space)'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  isPlayingRef.current = false;
                  const nextTick = Math.min(simulationResult.ticks.length - 1, Math.floor(tickFloatRef.current) + 1);
                  tickFloatRef.current = nextTick;
                  setDisplayTickIndex(nextTick);
                }}
                className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                title="Step 1 tick (+20s)"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  isPlayingRef.current = false;
                  const lastTick = simulationResult.ticks.length - 1;
                  tickFloatRef.current = lastTick;
                  setDisplayTickIndex(lastTick);
                }}
                className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                title="Jump to Full Time"
              >
                <FastForward className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  isPlayingRef.current = false;
                  tickFloatRef.current = 0;
                  setDisplayTickIndex(0);
                }}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white active:scale-95 transition-all cursor-pointer"
                title="Restart to Kickoff"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Continuous Smooth Scrubber Slider */}
            <div className="flex-1 max-w-md flex items-center gap-3">
              <input
                type="range"
                min="0"
                max={simulationResult.ticks.length - 1}
                step="0.05"
                value={tickFloatRef.current}
                onChange={(e) => {
                  setIsPlaying(false);
                  isPlayingRef.current = false;
                  const val = parseFloat(e.target.value);
                  tickFloatRef.current = val;
                  setDisplayTickIndex(Math.floor(val));
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-400 w-16 text-right">
                {displayTickIndex}/{simulationResult.ticks.length - 1}
              </span>
            </div>

            {/* Speed Selector (1x, 2x, 5x, 10x) */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              {[1, 2, 5, 10].map(speed => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Match Engine Live Visualizer & Commentary Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live 60 FPS HTML5 Canvas Pitch */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
              Live 60 FPS Pitch • All 22 Players • Aerodynamic Ball Trajectory
            </span>
            {activeTick && (
              <span className="text-emerald-400 font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/80">
                {activeTick.ballZone.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* 60 FPS Canvas Element */}
          <div className="relative w-full aspect-[105/68] rounded-xl border-2 border-slate-700/80 overflow-hidden shadow-2xl bg-emerald-950">
            <canvas
              ref={canvasRef}
              width={840}
              height={544}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => setHoveredPlayer(null)}
              className="w-full h-full block cursor-crosshair"
            />

            {/* Floating Player Hover Tooltip HUD */}
            {hoveredPlayer && tooltipPos && (
              <div
                className="absolute z-40 bg-slate-950/95 border border-slate-700 rounded-lg p-2.5 shadow-2xl text-[10px] font-mono pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 w-40"
                style={{
                  left: `${tooltipPos.x}px`,
                  top: `${tooltipPos.y}px`
                }}
              >
                <div className="font-extrabold text-white truncate text-xs">
                  #{hoveredPlayer.number} {hoveredPlayer.name}
                </div>
                <div className="text-slate-400 flex items-center justify-between mt-1">
                  <span>{hoveredPlayer.position} • {hoveredPlayer.role.split(' ')[0]}</span>
                  <span className="text-emerald-400 font-bold">{hoveredPlayer.condition}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${hoveredPlayer.condition}%` }}
                  />
                </div>
                {hoveredPlayer.isCarrier && (
                  <div className="mt-1.5 text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    ACTIVE BALL CARRIER
                  </div>
                )}
                {hoveredPlayer.isChallenger && (
                  <div className="mt-1.5 text-[9px] text-amber-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    CONTESTING DUEL
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Real-time possession & fatigue telemetry */}
          {activeTick && (
            <div className="w-full mt-4 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Possession:</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${activeTick.possessionTeam === 'home' ? 'bg-emerald-400' : 'bg-indigo-400'}`}></span>
                  {activeTick.possessionTeam === 'home' ? homeClub.name : awayClub.name}
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Active Ball Carrier:</span>
                <span className="font-bold text-emerald-400 truncate max-w-[200px]">
                  {activeTick.activePlayerName}
                </span>
              </div>

              {activeTick.activeDefenderName && (
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Pressing Defender:</span>
                  <span className="font-bold text-amber-400 truncate max-w-[200px]">
                    {activeTick.activeDefenderName}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="text-[9px] text-slate-500">Home Avg Stamina</div>
                  <div className="font-bold text-white">{activeTick.homeConditionAvg}%</div>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="text-[9px] text-slate-500">Away Avg Stamina</div>
                  <div className="font-bold text-white">{activeTick.awayConditionAvg}%</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Minute-by-Minute Live Commentary Feed */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-[560px]">
          {/* Commentary Header & Filter */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
            <span className="font-bold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              Commentary Feed
            </span>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(['all', 'goals', 'shots', 'cards'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setCommentaryFilter(f)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                    commentaryFilter === f ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Commentary Log Items */}
          <div ref={commentaryContainerRef} className="flex-1 overflow-y-auto space-y-2 py-3 pr-2 scroll-smooth">
            {filteredEvents.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                Click "Simulate Match" to start match timeline...
              </div>
            ) : (
              filteredEvents.map((evt) => {
                const isGoal = evt.type === 'goal';
                const isCard = evt.type === 'yellow_card' || evt.type === 'red_card';
                const isOffside = evt.type === 'offside';

                return (
                  <div
                    key={evt.id}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      isGoal
                        ? 'bg-emerald-950/80 border-emerald-500/80 shadow-md shadow-emerald-500/20'
                        : isCard
                          ? 'bg-amber-950/50 border-amber-500/50'
                          : isOffside
                            ? 'bg-cyan-950/40 border-cyan-700/60'
                            : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 font-mono">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isGoal
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : isCard
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : isOffside
                                ? 'bg-cyan-600 text-white font-bold'
                                : 'bg-slate-800 text-slate-300'
                        }`}>
                          {evt.minute}'
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                          {isOffside && <Flag className="w-3 h-3 text-cyan-400" />}
                          {isCard && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                          {evt.type.replace('_', ' ')}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-semibold ${
                        evt.team === 'home' ? 'text-emerald-400' : 'text-indigo-400'
                      }`}>
                        {evt.team === 'home' ? homeClub.code : awayClub.code}
                      </span>
                    </div>

                    <p className={`font-sans leading-relaxed ${
                      isGoal ? 'font-bold text-emerald-200 text-sm' : isCard ? 'font-semibold text-amber-200' : 'text-slate-200'
                    }`}>
                      {evt.commentary}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
