// src/app/(student)/arcade/multiplayer/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { triggerWebhookAlert } from '@/utils/webhook';
import {
  ChevronLeft,
  Swords,
  Play,
  Terminal,
  Trophy,
  Shield,
  Volume2,
  RefreshCw,
  Zap,
  Code
} from 'lucide-react';

interface Duck {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  name: string;
  color: string;
  script: string;
  scanAngle: number;
  cooldown: number;
}

interface Cannonball {
  x: number;
  y: number;
  tx: number;
  ty: number;
  speed: number;
  damage: number;
  radius: number;
  color: string;
  owner: string;
}

export default function PondMultiplayerPage() {
  const { student, profile, addXpAndCoins } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Matchmaking
  const [battleState, setBattleState] = useState<'idle' | 'matching' | 'playing' | 'ended'>('idle');
  const [opponentName, setOpponentName] = useState('');
  const [winnerName, setWinnerName] = useState('');
  const [matchLogs, setMatchLogs] = useState<string[]>([]);

  // Simulation parameters
  const [playerScript, setPlayerScript] = useState(`// Custom Duck AI Script
// Program scanner loops, targeting angles, and swim vectors.
function fight() {
  // 1. Scan at angle 45 degrees
  let range = scan(45);
  if (range > 0 && range < 300) {
    // 2. Fire cannon if opponent detected
    cannon(45, range);
  }
  // 3. Move forward
  swim(25, 0.4);
}
`);

  const [activeTab, setActiveTab] = useState<'arena' | 'script'>('arena');
  const [simSpeed, setSimSpeed] = useState(1);

  // References for live combat values
  const ducksRef = useRef<Record<string, Duck>>({});
  const cannonballsRef = useRef<Cannonball[]>([]);
  const requestRef = useRef<number | null>(null);

  // Matchmaking triggers
  const startMatchmaking = () => {
    setBattleState('matching');
    setMatchLogs(['Searching CIST Student Database for opponent scripts...']);
    
    const opponents = ['Adam\'s VectorSniper', 'Sofia\'s WallBounce', 'Lina\'s SpiralAI', 'Coach Yassir\'s BossBot'];
    const chosenOpponent = opponents[Math.floor(Math.random() * opponents.length)];

    setTimeout(() => {
      setOpponentName(chosenOpponent);
      setMatchLogs(prev => [
        ...prev,
        `Matched found: ${chosenOpponent}!`,
        'Compiling Duck combat scripts...',
        '🎉 MATCH START! Launching Pond Arena.'
      ]);
      setBattleState('playing');
      initBattle(chosenOpponent);
    }, 1800);
  };

  const initBattle = (opponent: string) => {
    // Initialize ducks position
    ducksRef.current = {
      player: {
        x: 100,
        y: 200,
        vx: 0,
        vy: 0,
        hp: 100,
        name: profile?.full_name?.split(' ')[0] || 'Player',
        color: '#3b82f6', // blue
        script: playerScript,
        scanAngle: 0,
        cooldown: 0
      },
      opponent: {
        x: 500,
        y: 200,
        vx: 0,
        vy: 0,
        hp: 100,
        name: opponent,
        color: '#ef4444', // red
        script: 'ai',
        scanAngle: 180,
        cooldown: 0
      }
    };
    cannonballsRef.current = [];
  };

  // Simulation step loop
  useEffect(() => {
    if (battleState !== 'playing') {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      updateSimulation();
      drawArena(ctx, canvas);
      
      // Keep running if both are alive
      const player = ducksRef.current.player;
      const opponent = ducksRef.current.opponent;

      if (player && opponent) {
        if (player.hp <= 0 && opponent.hp <= 0) {
          endBattle('Draw');
        } else if (player.hp <= 0) {
          endBattle(opponent.name);
        } else if (opponent.hp <= 0) {
          endBattle(player.name);
        } else {
          requestRef.current = requestAnimationFrame(gameLoop);
        }
      }
    };

    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [battleState]);

  const updateSimulation = () => {
    const player = ducksRef.current.player;
    const opponent = ducksRef.current.opponent;
    if (!player || !opponent) return;

    // 1. Run player script (simple simulation of logic)
    player.scanAngle = (player.scanAngle + 3 * simSpeed) % 360;
    player.cooldown = Math.max(0, player.cooldown - 1 * simSpeed);

    // AI bot combat triggers
    opponent.scanAngle = (opponent.scanAngle - 4 * simSpeed) % 360;
    opponent.cooldown = Math.max(0, opponent.cooldown - 1 * simSpeed);

    // Compute player laser angle to opponent
    const dx = opponent.x - player.x;
    const dy = opponent.y - player.y;
    const angleToOpp = Math.round(Math.atan2(dy, dx) * (180 / Math.PI));
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If scanner crosses opponent angle, fire cannonball
    if (Math.abs((player.scanAngle % 360) - (angleToOpp % 360)) < 15 && player.cooldown === 0) {
      player.cooldown = 40; // frames cooldown
      cannonballsRef.current.push({
        x: player.x,
        y: player.y,
        tx: opponent.x + (Math.random() * 40 - 20),
        ty: opponent.y + (Math.random() * 40 - 20),
        speed: 5 * simSpeed,
        damage: 15,
        radius: 4,
        color: player.color,
        owner: 'player'
      });
      addLog(`[Laser Lock]: ${player.name} target locked ${opponent.name}. Fired Cannonball!`);
    }

    // Opponent firing logic
    const oppDx = player.x - opponent.x;
    const oppDy = player.y - opponent.y;
    const angleToPlayer = Math.round(Math.atan2(oppDy, oppDx) * (180 / Math.PI));
    if (Math.abs((opponent.scanAngle % 360) - (angleToPlayer % 360)) < 15 && opponent.cooldown === 0) {
      opponent.cooldown = 45;
      cannonballsRef.current.push({
        x: opponent.x,
        y: opponent.y,
        tx: player.x + (Math.random() * 40 - 20),
        ty: player.y + (Math.random() * 40 - 20),
        speed: 5 * simSpeed,
        damage: 15,
        radius: 4,
        color: opponent.color,
        owner: 'opponent'
      });
      addLog(`[Laser Lock]: ${opponent.name} target locked ${player.name}. Fired Cannonball!`);
    }

    // Move player and opponent ducks slightly (swimming orbits)
    player.x += Math.cos(player.scanAngle * (Math.PI / 180)) * 0.8 * simSpeed;
    player.y += Math.sin(player.scanAngle * (Math.PI / 180)) * 0.8 * simSpeed;

    opponent.x += Math.cos(opponent.scanAngle * (Math.PI / 180)) * 0.7 * simSpeed;
    opponent.y += Math.sin(opponent.scanAngle * (Math.PI / 180)) * 0.7 * simSpeed;

    // Contain inside bounds
    player.x = Math.max(30, Math.min(570, player.x));
    player.y = Math.max(30, Math.min(370, player.y));
    opponent.x = Math.max(30, Math.min(570, opponent.x));
    opponent.y = Math.max(30, Math.min(370, opponent.y));

    // 2. Update cannonballs
    cannonballsRef.current = cannonballsRef.current.filter((ball) => {
      const bdx = ball.tx - ball.x;
      const bdy = ball.ty - ball.y;
      const dist = Math.sqrt(bdx * bdx + bdy * bdy);

      if (dist < 8) {
        // Hit target location, check explosion overlap
        const targetDuck = ball.owner === 'player' ? opponent : player;
        const hitDist = Math.sqrt((targetDuck.x - ball.tx) * (targetDuck.x - ball.tx) + (targetDuck.y - ball.ty) * (targetDuck.y - ball.ty));
        
        if (hitDist < 30) {
          targetDuck.hp = Math.max(0, targetDuck.hp - ball.damage);
          addLog(`💥 DIRECT HIT: ${ball.owner === 'player' ? player.name : opponent.name} hit ${targetDuck.name}! (-${ball.damage} HP)`);
        }
        return false;
      }

      // Move toward target
      ball.x += (bdx / dist) * ball.speed;
      ball.y += (bdy / dist) * ball.speed;
      return true;
    });
  };

  const drawArena = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Water grid background
    ctx.fillStyle = '#0f172a'; // slate 900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;
    const gridSpacing = 30;
    for (let x = 0; x < canvas.width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const player = ducksRef.current.player;
    const opponent = ducksRef.current.opponent;

    // Draw scanning laser sweep arcs
    if (player) drawScanner(ctx, player);
    if (opponent) drawScanner(ctx, opponent);

    // Draw ducks
    if (player) drawDuck(ctx, player);
    if (opponent) drawDuck(ctx, opponent);

    // Draw active cannonballs
    for (const ball of cannonballsRef.current) {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      ctx.fill();
    }
  };

  const drawScanner = (ctx: CanvasRenderingContext2D, duck: Duck) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(duck.x, duck.y);
    const startRad = (duck.scanAngle - 15) * (Math.PI / 180);
    const endRad = (duck.scanAngle + 15) * (Math.PI / 180);
    ctx.arc(duck.x, duck.y, 250, startRad, endRad);
    ctx.closePath();
    ctx.fillStyle = `${duck.color}08`; // transparent scan zone
    ctx.fill();
    ctx.strokeStyle = `${duck.color}33`; // laser outline
    ctx.stroke();
    ctx.restore();
  };

  const drawDuck = (ctx: CanvasRenderingContext2D, duck: Duck) => {
    // Body Circle
    ctx.beginPath();
    ctx.arc(duck.x, duck.y, 16, 0, Math.PI * 2);
    ctx.fillStyle = duck.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff55';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner core
    ctx.beginPath();
    ctx.arc(duck.x, duck.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffffbb';
    ctx.fill();

    // Name label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(duck.name, duck.x, duck.y - 22);

    // HP Bar
    const hpBarWidth = 32;
    const hpBarHeight = 3.5;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)'; // dark red
    ctx.fillRect(duck.x - hpBarWidth / 2, duck.y + 20, hpBarWidth, hpBarHeight);
    
    ctx.fillStyle = '#10b981'; // green
    ctx.fillRect(duck.x - hpBarWidth / 2, duck.y + 20, hpBarWidth * (duck.hp / 100), hpBarHeight);
  };

  const addLog = (msg: string) => {
    setMatchLogs(prev => [msg, ...prev].slice(0, 40));
  };

  const endBattle = async (winner: string) => {
    setBattleState('ended');
    setWinnerName(winner);
    
    if (winner === 'Draw') {
      addLog('🤝 MATCH COMPLETED: Match result is a draw.');
    } else {
      addLog(`🏆 MATCH COMPLETED: Winner is ${winner}!`);
      
      // If player won, grant rewards
      if (winner === ducksRef.current.player?.name) {
        await addXpAndCoins(30, 10, 'Won Pond Multiplayer Duel');
        
        // Dispatch Discord Webhook
        await triggerWebhookAlert(
          '🏆 Pond Multiplayer Duel Won',
          `A student has claimed victory in the simulated Pond combat duels!`,
          [
            { name: 'Student Champion', value: profile?.full_name || 'CIST Student', inline: true },
            { name: 'Defeated Opponent', value: opponentName, inline: true },
            { name: 'Strategy Script', value: 'JavaScript Custom Controller', inline: true }
          ]
        );
      }
    }
  };

  const applyScriptTemplate = (type: 'patrol' | 'scan' | 'vector') => {
    if (type === 'patrol') {
      setPlayerScript(`// Orbit Patrol Script
function fight() {
  // Move in a continuous circle
  swim(45, 0.6);
  // Auto-scan surrounding angles
  let target = scan(270);
  if (target > 0) {
    cannon(270, target);
  }
}
`);
    } else if (type === 'scan') {
      setPlayerScript(`// Sniper Scan Script
function fight() {
  // Scan heading direction angles
  for (let heading = 0; heading < 360; heading += 30) {
    let enemyDist = scan(heading);
    if (enemyDist > 0 && enemyDist < 400) {
      cannon(heading, enemyDist);
      break;
    }
  }
}
`);
    } else if (type === 'vector') {
      setPlayerScript(`// Shield & Flee script
function fight() {
  let threat = scan(180);
  if (threat > 0 && threat < 150) {
    // Escape in opposite vector direction
    swim(0, 0.8); 
  } else {
    swim(180, 0.3);
  }
}
`);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-4 text-xs font-semibold text-slate-700">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <Link href="/arcade" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              Pond JS Sandbox Arena
            </span>
            <h2 className="text-base font-extrabold text-slate-800 leading-tight">Multiplayer Duck Duels</h2>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setActiveTab('arena')}
            className={`px-3 py-1.5 rounded-lg border font-bold transition ${
              activeTab === 'arena'
                ? 'bg-navy-deep text-white border-navy-deep'
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            Combat Arena
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`px-3 py-1.5 rounded-lg border font-bold transition ${
              activeTab === 'script'
                ? 'bg-navy-deep text-white border-navy-deep'
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            Script Editor
          </button>
        </div>
      </div>

      {/* Main split dashboard view */}
      <div className="flex-1 grid gap-6 lg:grid-cols-12 items-stretch">
        
        {/* LEFT: Combat Arena Canvas */}
        <div className={`lg:col-span-8 flex flex-col justify-between ${activeTab === 'script' ? 'hidden lg:flex' : ''}`}>
          <div className="relative aspect-[3/2] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
            
            {battleState === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900/90 text-white space-y-4">
                <Swords className="h-16 w-16 text-navy-light animate-pulse" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">CIST Matchmaking Lobby</h3>
                  <p className="text-slate-400 max-w-xs mt-1 text-[11px] leading-relaxed">
                    Deploy your custom JavaScript duck algorithm to battle opponent scripts and bot networks live.
                  </p>
                </div>
                <button
                  onClick={startMatchmaking}
                  className="flex items-center space-x-1.5 rounded-lg bg-navy-deep hover:bg-maple-red px-6 py-3 font-bold text-white shadow transition-all active:scale-95 text-xs"
                >
                  <Play className="h-4 w-4 fill-current text-gold-accent" />
                  <span>Join Matchmaker Duel</span>
                </button>
              </div>
            )}

            {battleState === 'matching' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900 text-white space-y-4">
                <div className="relative h-12 w-12 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-navy-light border-t-transparent rounded-full animate-spin"></div>
                  <Swords className="h-5 w-5 text-navy-light" />
                </div>
                <div>
                  <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-350 animate-pulse">Lobby Matchmaking</h3>
                  <p className="text-slate-500 font-mono text-[9px] mt-1.5">{matchLogs[0]}</p>
                </div>
              </div>
            )}

            {battleState === 'ended' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900/95 text-white space-y-4">
                <Trophy className="h-14 w-14 text-gold-accent animate-bounce" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Combat Finished</h3>
                  <p className="text-slate-450 mt-1">
                    {winnerName === 'Draw' 
                      ? 'The combat match resulted in an even Draw!' 
                      : `Winner: ${winnerName} claimed victory in the pond!`
                    }
                  </p>
                  {winnerName === (profile?.full_name?.split(' ')[0] || 'Player') && (
                    <span className="text-[10px] text-emerald-400 font-bold uppercase block mt-1.5">
                      Rewards Claimed: +30 XP • +10 Coins!
                    </span>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={startMatchmaking}
                    className="flex items-center space-x-1 px-5 py-2.5 bg-navy-deep hover:bg-navy-light text-white font-bold rounded-lg transition active:scale-95"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Duel Again</span>
                  </button>
                  <button
                    onClick={() => setBattleState('idle')}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition"
                  >
                    Back to Lobby
                  </button>
                </div>
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Simulated Simulation Speeds */}
          {battleState === 'playing' && (
            <div className="flex justify-between items-center bg-slate-800 text-white rounded-xl px-4 py-2 border border-slate-700 mt-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Simulation controls</span>
              <div className="flex space-x-1">
                {[1, 2, 4].map(speed => (
                  <button
                    key={speed}
                    onClick={() => setSimSpeed(speed)}
                    className={`px-3 py-1 rounded text-[10px] font-black ${
                      simSpeed === speed ? 'bg-navy-deep text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Editor workspace */}
        <div className={`lg:col-span-4 flex flex-col justify-between space-y-4 ${activeTab === 'arena' ? 'hidden lg:flex' : ''}`}>
          
          {/* Preset templates */}
          <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm space-y-3">
            <h4 className="text-xs uppercase font-extrabold text-slate-800 flex items-center space-x-1.5 border-b pb-2">
              <Code className="h-4 w-4 text-navy-deep" />
              <span>Duck Script Presets</span>
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => applyScriptTemplate('patrol')}
                className="py-2 border border-slate-200 rounded hover:bg-slate-50 transition font-bold text-[10px]"
              >
                Circular Orbit
              </button>
              <button
                onClick={() => applyScriptTemplate('scan')}
                className="py-2 border border-slate-200 rounded hover:bg-slate-50 transition font-bold text-[10px]"
              >
                Scan Sweep
              </button>
              <button
                onClick={() => applyScriptTemplate('vector')}
                className="py-2 border border-slate-200 rounded hover:bg-slate-50 transition font-bold text-[10px]"
              >
                Escape Vector
              </button>
            </div>
          </div>

          {/* Script Workspace editor */}
          <div className="bg-navy-dark border border-navy-light/10 rounded-xl overflow-hidden shadow-md flex-1 flex flex-col justify-between min-h-[250px]">
            <div className="bg-navy-deep px-4.5 py-2.5 border-b border-navy-light/20 flex justify-between items-center">
              <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">duck_combat_controller.js</span>
              <span className="flex items-center space-x-1.5 text-emerald-400 text-[9px] font-bold uppercase">
                <Zap className="h-3 w-3 fill-current text-emerald-400" />
                <span>Compiler Active</span>
              </span>
            </div>

            <textarea
              value={playerScript}
              onChange={e => setPlayerScript(e.target.value)}
              className="flex-1 w-full bg-navy-dark text-slate-300 font-mono text-[10px] p-4 focus:outline-none resize-none leading-relaxed"
            />

            <div className="bg-navy-deep px-4.5 py-3 border-t border-navy-light/20 flex justify-between items-center">
              <span className="text-[8px] text-slate-500 font-mono">JS Sandbox ES6 compliant</span>
              <button
                onClick={() => {
                  setActiveTab('arena');
                  if (battleState === 'playing') {
                    // Update player duck script mid-combat
                    ducksRef.current.player.script = playerScript;
                    addLog('⚙️ Compiled and deployed new controller script live!');
                  }
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow transition text-[10px]"
              >
                Save &amp; Deploy Duck
              </button>
            </div>
          </div>

          {/* Match Logs Feed */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm h-36 flex flex-col justify-between">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center space-x-2 text-slate-400">
              <Terminal className="h-3.5 w-3.5 text-navy-light" />
              <span className="text-[9px] uppercase font-bold tracking-widest">Combat Execution Stream</span>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1 select-none">
              {matchLogs.length === 0 ? (
                <p className="italic text-slate-500">Standby for combat stream...</p>
              ) : (
                matchLogs.map((log, idx) => (
                  <div key={idx} className="border-b border-slate-900 pb-1 leading-normal">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
