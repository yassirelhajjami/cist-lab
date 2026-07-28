// src/app/(student)/robotics-lab/page.tsx
'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Cpu, Play, HelpCircle, Info, RefreshCw, Zap, Lightbulb, Compass, Award, Bot, Flag } from 'lucide-react';

const MODULES = [
  {
    id: 'motors',
    title: 'Motors & Actuators',
    desc: 'Motors convert electrical energy into mechanical rotation. We control speed and direction using PWM pulses and pin states.',
    syntax: '// Rotate Motor A clockwise at 50% power\nmotorA.drive(255);\ndelay(1000);\nmotorA.stop();'
  },
  {
    id: 'sensors',
    title: 'Sensors & Inputs',
    desc: 'Ultrasonic rangefinders measure distance by timing sound echoes. Infrared track sensors detect lines by light reflection.',
    syntax: '// Check distance to front obstacle\nint dist = rangefinder.ping();\nif (dist < 10) {\n    robot.brake();\n}'
  },
  {
    id: 'leds',
    title: 'LED Indicators & Tones',
    desc: 'LEDs and Buzzers provide visual and auditory feedback. Use digital pins to write HIGH (5V) or LOW (0V) states.',
    syntax: '// Blink warning light\ndigitalWrite(LED_PIN, HIGH);\ndelay(500);\ndigitalWrite(LED_PIN, LOW);'
  }
];

export default function RoboticsLabPage() {
  const { addXpAndCoins } = useApp();
  const [activeModule, setActiveModule] = useState('motors');
  const [robotState, setRobotState] = useState({ x: 0, y: 0, led: false });
  const [commandsList, setCommandsList] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>(['Virtual robot linked to COM4 port. Ready.']);
  const [isPlaying, setIsPlaying] = useState(false);
  const [victory, setVictory] = useState(false);

  const addCommand = (cmd: string) => {
    if (isPlaying || victory) return;
    setCommandsList(prev => [...prev, cmd]);
    setLogs(prev => [...prev, `Added command block: ${cmd}`]);
  };

  const clearCommands = () => {
    setCommandsList([]);
    setRobotState({ x: 0, y: 0, led: false });
    setLogs(['Commands cleared. Robot repositioned.']);
    setVictory(false);
  };

  const handleRun = () => {
    if (commandsList.length === 0 || isPlaying) return;
    setIsPlaying(true);
    setLogs(prev => [...prev, '> Starting robotics firmware execution...']);

    const current = { x: 0, y: 0, led: false };
    let step = 0;

    const interval = setInterval(() => {
      if (step >= commandsList.length) {
        clearInterval(interval);
        setIsPlaying(false);
        // Win condition: reach grid coordinate (2,2)
        if (current.x === 2 && current.y === 2) {
          setLogs(prev => [...prev, '🎉 SUCCESS: Target coordinates reached! Virtual robot delivered package. +80 XP rewarded.']);
          setVictory(true);
          addXpAndCoins(80, 15, 'Completed Robotics Lab Grid Quest');
        } else {
          setLogs(prev => [...prev, '⚠️ Sequence ended. Robot stopped. Target coordinate (2,2) not reached.']);
        }
        return;
      }

      const cmd = commandsList[step];
      step++;

      if (cmd === 'Drive Forward') {
        current.y = Math.min(2, current.y + 1);
        setLogs(prev => [...prev, `Motors active: Drive Forward. Pos Y: ${current.y}`]);
      } else if (cmd === 'Turn Right') {
        current.x = Math.min(2, current.x + 1);
        setLogs(prev => [...prev, `Motors active: Turn Right. Pos X: ${current.x}`]);
      } else if (cmd === 'Toggle LED') {
        current.led = !current.led;
        setLogs(prev => [...prev, `GPIO: Pin 13 set to ${current.led ? 'HIGH (5V)' : 'LOW (0V)'}`]);
      }
      
      setRobotState({ ...current });
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
          <Cpu className="h-6 w-6 text-navy-deep" />
          <span>Virtual Robotics & Microcontrollers Lab</span>
        </h2>
        <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
          Assemble actuator sequences, program sensor feedback gates, and run virtual Lego firmware
        </p>
      </div>

      {victory && (
        <div className="rounded-xl border border-emerald-250 bg-emerald-50 p-4 font-bold text-xs text-emerald-850 flex items-center space-x-2.5 animate-pulse">
          <Award className="h-5 w-5 text-emerald-600 animate-bounce" />
          <span>Robotics sequence successful! You earned +80 XP and 15 Coins!</span>
        </div>
      )}

      {/* Split visual workspace */}
      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        
        {/* Left Column: Educational hardware modules */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="font-black text-sm uppercase text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Info className="h-4.5 w-4.5 text-navy-deep" />
              <span>Arduino & Hardware Concepts</span>
            </h3>

            {/* Selection tabs */}
            <div className="flex space-x-2">
              {MODULES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveModule(m.id)}
                  className={`flex-1 px-3 py-2 text-center rounded-lg text-xs font-bold transition border ${
                    activeModule === m.id
                      ? 'bg-navy-deep text-white border-navy-deep shadow-sm'
                      : 'bg-white text-slate-650 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  {m.title.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {MODULES.map((m) => {
              if (m.id !== activeModule) return null;
              return (
                <div key={m.id} className="space-y-4 animate-fade-in text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
                  <p className="text-slate-500 leading-relaxed font-semibold">{m.desc}</p>
                  
                  <div className="rounded-lg bg-navy-dark p-4 border border-navy-light/15 text-white font-mono leading-relaxed shadow-inner">
                    <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                      Pin Configuration Sketch
                    </span>
                    <pre className="overflow-x-auto whitespace-pre">{m.syntax}</pre>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 text-xs text-slate-500 font-semibold mt-6">
            <h4 className="font-black uppercase text-slate-700 mb-1 flex items-center space-x-1">
              <HelpCircle className="h-4 w-4" />
              <span>Sandbox Goal:</span>
            </h4>
            Guide the virtual robot coordinates to coordinate <span className="text-navy-deep font-bold">Pos [2, 2]</span> by building a motor sequence to claim XP.
          </div>
        </div>

        {/* Right Column: Visual simulation simulator */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="font-black text-sm uppercase text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Compass className="h-4.5 w-4.5 text-navy-deep" />
              <span>Robot Command Controller</span>
            </h3>

            {/* Animation board */}
            <div className="grid grid-cols-12 gap-5 items-center">
              {/* Virtual Arena Canvas */}
              <div className="col-span-12 sm:col-span-6 flex flex-col items-center">
                <div className="grid grid-cols-3 gap-1.5 w-48 h-48 bg-slate-150 p-2.5 rounded-lg border border-slate-350 shadow-inner">
                  {Array.from({ length: 3 }).map((_, r) =>
                    Array.from({ length: 3 }).map((_, c) => {
                      const isRobot = robotState.x === c && robotState.y === 2 - r;
                      const isTarget = c === 2 && 2 - r === 2;

                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`relative rounded-md flex flex-col items-center justify-center font-bold text-[10px] border transition-all ${
                            isRobot ? 'bg-navy-deep text-white border-2 border-gold-accent shadow' :
                            isTarget ? 'bg-amber-100 text-amber-500 border border-amber-300 animate-pulse' :
                            'bg-white border-slate-200'
                          }`}
                        >
                          {isRobot && (
                            <div className="flex flex-col items-center">
                              <Bot className="h-5 w-5 text-amber-300 drop-shadow animate-pulse" />
                              <span className={`h-1.5 w-1.5 rounded-full mt-1 ${robotState.led ? 'bg-yellow-400 animate-ping' : 'bg-slate-400'}`}></span>
                            </div>
                          )}
                          {isTarget && !isRobot && <Flag className="h-5 w-5 text-emerald-500 fill-current" />}
                          <span className="absolute bottom-0.5 right-1 text-[8px] text-slate-300 font-normal">
                            {c},{2 - r}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-bold mt-2">
                  Robot Position: {robotState.x}, {robotState.y}
                </span>
              </div>

              {/* Sequence control builder */}
              <div className="col-span-12 sm:col-span-6 space-y-3">
                <span className="block text-xs font-black uppercase text-slate-650">Select Commands</span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => addCommand('Drive Forward')}
                    className="text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-3 py-2 text-xs font-bold text-slate-700 transition"
                  >
                    + Drive Forward (Y + 1)
                  </button>
                  <button
                    onClick={() => addCommand('Turn Right')}
                    className="text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-3 py-2 text-xs font-bold text-slate-700 transition"
                  >
                    + Turn Right (X + 1)
                  </button>
                  <button
                    onClick={() => addCommand('Toggle LED')}
                    className="text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-3 py-2 text-xs font-bold text-slate-700 transition"
                  >
                    + Toggle LED (Pin 13)
                  </button>
                </div>

                <div className="rounded border border-slate-200 p-2.5 max-h-24 overflow-y-auto bg-slate-50/50">
                  <span className="block text-[9.5px] uppercase font-bold text-slate-450 border-b pb-1 mb-1.5">Program stack</span>
                  {commandsList.length === 0 ? (
                    <span className="text-[10px] text-slate-400 font-semibold italic">Sequence stack empty</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {commandsList.map((cmd, idx) => (
                        <span key={idx} className="bg-navy-deep text-white px-2 py-0.5 rounded text-[10px] font-mono border border-gold-accent/25">
                          {idx + 1}: {cmd}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* IO Terminal output logs */}
            <div className="bg-black/95 p-3.5 rounded-lg border border-navy-light/25 font-mono text-[10px] text-slate-350 mt-4 h-24 overflow-y-auto shadow-inner">
              <span className="block text-gray-500 font-bold uppercase text-[9px] border-b border-navy-light/10 pb-1 mb-1.5 flex items-center space-x-1">
                <Zap className="h-3 w-3 text-gold-accent" />
                <span>COM4 Port debugging outputs</span>
              </span>
              {logs.map((log, idx) => (
                <div key={idx} className={log.startsWith('🎉') || log.startsWith('Motors') ? 'text-emerald-400' : log.startsWith('⚠️') ? 'text-rose-450' : 'text-slate-350'}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex space-x-3">
            <button
              onClick={clearCommands}
              className="flex items-center space-x-1 border border-slate-300 hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-650 rounded-lg shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Clear Board</span>
            </button>
            <button
              onClick={handleRun}
              disabled={isPlaying || commandsList.length === 0 || victory}
              className="flex-grow flex items-center justify-center space-x-1.5 bg-navy-deep hover:bg-maple-red px-5 py-2.5 text-xs font-bold text-white rounded-lg shadow disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current text-gold-accent" />
              <span>Run Robotics Sequence</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
