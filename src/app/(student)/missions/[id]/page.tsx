// src/app/(student)/missions/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { dbService } from '@/lib/db';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  BookOpen,
  Code2,
  Play,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  Terminal,
  Trophy
} from 'lucide-react';

interface SandboxResult {
  stdout: string;
  error: string;
}

function runPythonSandbox(code: string): SandboxResult {
  const lines = code.split('\n');
  const variables: Record<string, any> = {};
  const outputs: string[] = [];

  const evalArg = (arg: string, vars: Record<string, any>): string => {
    const strMatch = arg.match(/^["']([^"']*)["']$/);
    if (strMatch) return strMatch[1];
    if (vars[arg] !== undefined) return String(vars[arg]);
    
    let clean = arg;
    for (const [k, v] of Object.entries(vars)) {
      clean = clean.replace(new RegExp(`\\b${k}\\b`, 'g'), String(v));
    }
    
    clean = clean.replace(/\s+/g, '');
    const mathMatch = clean.match(/^(\d+(?:\.\d+)?)([\+\-\*\/])(\d+(?:\.\d+)?)$/);
    if (mathMatch) {
      const left = parseFloat(mathMatch[1]);
      const op = mathMatch[2];
      const right = parseFloat(mathMatch[3]);
      if (op === '+') return String(left + right);
      if (op === '-') return String(left - right);
      if (op === '*') return String(left * right);
      if (op === '/') return String(left / right);
    }
    return clean.replace(/^["']|["']$/g, '');
  };

  try {
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) {
        i++;
        continue;
      }

      // Loops
      const loopMatch = line.match(/^for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+in\s+range\s*\(([^)]+)\)\s*:/);
      if (loopMatch) {
        const loopVar = loopMatch[1];
        const args = loopMatch[2].split(',').map(a => a.trim());
        let start = 0;
        let end = 0;
        if (args.length === 1) {
          end = parseInt(args[0], 10);
        } else if (args.length === 2) {
          start = parseInt(args[0], 10);
          end = parseInt(args[1], 10);
        }

        const body: string[] = [];
        let j = i + 1;
        while (j < lines.length) {
          const nextLineRaw = lines[j];
          if (!nextLineRaw.trim()) {
            j++;
            continue;
          }
          if (/^\s+/.test(nextLineRaw)) {
            body.push(nextLineRaw);
            j++;
          } else {
            break;
          }
        }

        for (let val = start; val < end; val++) {
          variables[loopVar] = val;
          for (const bl of body) {
            const cb = bl.trim();
            if (!cb || cb.startsWith('#')) continue;
            const printMatch = cb.match(/^print\s*\(\s*(.*)\s*\)$/);
            if (printMatch) {
              outputs.push(evalArg(printMatch[1].trim(), variables));
            }
          }
        }
        i = j;
        continue;
      }

      // Prints
      const printMatch = line.match(/^print\s*\(\s*(.*)\s*\)$/);
      if (printMatch) {
        outputs.push(evalArg(printMatch[1].trim(), variables));
        i++;
        continue;
      }

      // Assignments
      const assignMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*)$/);
      if (assignMatch) {
        const vName = assignMatch[1];
        const vExpr = assignMatch[2].trim();
        variables[vName] = evalArg(vExpr, variables);
      }
      i++;
    }
    return { stdout: outputs.join('\n').trim(), error: '' };
  } catch (err: any) {
    return { stdout: '', error: err.message };
  }
}

function runJsSandbox(code: string): SandboxResult {
  const logsList: string[] = [];
  const customConsole = {
    log: (...args: any[]) => {
      logsList.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    }
  };

  try {
    // eslint-disable-next-line no-new-func
    const sandbox = new Function('console', `
      try {
        ${code}
      } catch(e) {
        throw e;
      }
    `);
    sandbox(customConsole);
    return { stdout: logsList.join('\n').trim(), error: '' };
  } catch (err: any) {
    return { stdout: '', error: err.message };
  }
}

export default function MissionDetailPage() {
  const { id } = useParams() as { id: string };
  const { student, profile, addXpAndCoins } = useApp();
  const router = useRouter();

  const [mission, setMission] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  
  const [activeItem, setActiveItem] = useState<{ type: 'lesson' | 'challenge'; id: string } | null>(null);
  const [code, setCode] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  const [attemptsCount, setAttemptsCount] = useState(0);
  const [secondsActive, setSecondsActive] = useState(0);

  // Challenge dynamic timer
  useEffect(() => {
    if (!activeItem || activeItem.type !== 'challenge') return;
    setSecondsActive(0);
    setAttemptsCount(0);

    const interval = setInterval(() => {
      setSecondsActive(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeItem]);

  useEffect(() => {
    async function loadMissionDetails() {
      if (!student) return;
      try {
        const missions = await dbService.getMissions();
        const foundMission = missions.find((m: any) => m.id === id);
        if (!foundMission) {
          router.push('/missions');
          return;
        }

        // Access guard: enforce student grade matching
        const courses = await dbService.getCourses();
        const missionCourse = courses.find((c: any) => c.id === foundMission.course_id);
        const isAdmin = profile?.role === 'admin';
        const studentGrade = student?.grade || profile?.grade || 'Grade 10';
        if (!isAdmin && missionCourse && missionCourse.grade !== studentGrade) {
          router.push('/missions');
          return;
        }

        setMission(foundMission);

        const foundLessons = await dbService.getLessons(id);
        const foundChallenges = await dbService.getChallenges(id);
        setLessons(foundLessons);
        setChallenges(foundChallenges);

        const foundProgress = await dbService.getStudentProgress(student.id);
        setProgress(foundProgress);

        // Select first active item (incomplete preferred)
        const combined = [
          ...foundLessons.map((l: any) => ({ type: 'lesson' as const, id: l.id })),
          ...foundChallenges.map((c: any) => ({ type: 'challenge' as const, id: c.id }))
        ];

        const incomplete = combined.find((item: any) => {
          const key = item.type === 'lesson' ? 'lesson_id' : 'challenge_id';
          return !foundProgress.some((p: any) => p[key] === item.id && p.status === 'completed');
        });

        if (incomplete) {
          setActiveItem(incomplete);
        } else if (combined.length > 0) {
          setActiveItem(combined[0]);
        }
      } catch (err) {
        console.error('Failed to load mission details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMissionDetails();
  }, [id, student, router]);

  // Load starter code when active challenge changes
  useEffect(() => {
    if (activeItem && activeItem.type === 'challenge') {
      const chal = challenges.find(c => c.id === activeItem.id);
      if (chal) {
        setCode(chal.starter_code);
        setTerminalLogs(['CIST CodeQuest Sandbox initialized. Ready to execute.']);
        setIsSuccess(false);
      }
    }
  }, [activeItem, challenges]);

  if (loading || !mission) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full border-4 border-navy-deep border-t-transparent h-10 w-10"></div>
      </div>
    );
  }

  const activeLesson = activeItem?.type === 'lesson' ? lessons.find(l => l.id === activeItem.id) : null;
  const activeChallenge = activeItem?.type === 'challenge' ? challenges.find(c => c.id === activeItem.id) : null;

  const checkCompletedStatus = (type: 'lesson' | 'challenge', itemUserId: string) => {
    const key = type === 'lesson' ? 'lesson_id' : 'challenge_id';
    return progress.some((p: any) => p[key] === itemUserId && p.status === 'completed');
  };

  const handleCompleteLesson = async () => {
    if (!student || !profile || !activeLesson) return;
    try {
      await dbService.completeLesson(student.id, profile.id, mission.id, activeLesson.id);
      await addXpAndCoins(25, 5, `Completed Lesson: ${activeLesson.title}`);

      // Refresh progress list
      const updatedProg = await dbService.getStudentProgress(student.id);
      setProgress(updatedProg);

      // Check auto mission completion
      await dbService.checkAndCompleteMission(student.id, profile.id, mission.id);

      // Navigate to next incomplete item
      goToNextItem();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunCode = () => {
    if (!activeChallenge) return;
    setIsRunning(true);
    setAttemptsCount(prev => prev + 1);
    setTerminalLogs(prev => [...prev, `> Executing script in sandboxed runtime...`]);

    setTimeout(() => {
      setIsRunning(false);
      const isPython = (mission.category || '').toLowerCase() === 'python' || code.includes('#') || !code.includes('console.log');
      
      const { stdout, error } = isPython 
        ? runPythonSandbox(code)
        : runJsSandbox(code);

      const expected = activeChallenge.expected_output.trim();

      if (error) {
        setTerminalLogs(prev => [
          ...prev,
          `❌ RUNTIME ERROR: ${error}`,
          `Please fix syntax / execution errors and run again.`
        ]);
        setIsSuccess(false);
      } else if (stdout === expected) {
        setTerminalLogs(prev => [
          ...prev,
          `SUCCESS: Output matches target condition.`,
          `[STDOUT]: ${stdout}`,
          `🎉 All tests passed successfully! Click Publish to submit.`
        ]);
        setIsSuccess(true);
      } else {
        setTerminalLogs(prev => [
          ...prev,
          `[STDOUT]: ${stdout || '(no console output)'}`,
          `❌ TEST FAILED: Output did not match expected value: "${expected}".`,
          `Review your inputs and run again.`
        ]);
        setIsSuccess(false);
      }
    }, 1200);
  };

  const handleSubmitChallenge = async () => {
    if (!student || !profile || !activeChallenge || !isSuccess) return;
    try {
      await dbService.completeChallenge(
        student.id,
        profile.id,
        mission.id,
        activeChallenge.id,
        activeChallenge.xp_reward,
        activeChallenge.coin_reward,
        100,
        secondsActive,
        attemptsCount
      );
      await addXpAndCoins(activeChallenge.xp_reward, activeChallenge.coin_reward, `Completed Challenge: ${activeChallenge.title}`);

      // Refresh progress
      const updatedProg = await dbService.getStudentProgress(student.id);
      setProgress(updatedProg);

      // Check auto mission completion
      await dbService.checkAndCompleteMission(student.id, profile.id, mission.id);

      goToNextItem();
    } catch (err) {
      console.error(err);
    }
  };

  const goToNextItem = () => {
    const combined = [
      ...lessons.map(l => ({ type: 'lesson' as const, id: l.id })),
      ...challenges.map(c => ({ type: 'challenge' as const, id: c.id }))
    ];
    const currentIndex = combined.findIndex(item => item.id === activeItem?.id);
    if (currentIndex !== -1 && currentIndex + 1 < combined.length) {
      setActiveItem(combined[currentIndex + 1]);
    } else {
      // Completed last slide, redirect to main missions
      router.push('/missions');
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-4">
      {/* Top Breadcrumb Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <Link href="/missions" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              CIST CodeQuest Pathway • {mission.category}
            </span>
            <h2 className="text-base font-extrabold text-slate-800 leading-tight">{mission.title}</h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Mission Nodes:</span>
          <div className="flex space-x-1.5">
            {lessons.map((l) => {
              const done = checkCompletedStatus('lesson', l.id);
              const isActive = activeItem?.type === 'lesson' && activeItem.id === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setActiveItem({ type: 'lesson', id: l.id })}
                  className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs transition border ${
                    isActive ? 'bg-navy-deep text-white border-navy-deep' :
                    done ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                  title={`Lesson: ${l.title}`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                </button>
              );
            })}
            {challenges.map((c) => {
              const done = checkCompletedStatus('challenge', c.id);
              const isActive = activeItem?.type === 'challenge' && activeItem.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveItem({ type: 'challenge', id: c.id })}
                  className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs transition border ${
                    isActive ? 'bg-navy-deep text-white border-navy-deep' :
                    done ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                  title={`Challenge: ${c.title}`}
                >
                  <Code2 className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic View Splitter */}
      <div className="flex-1 grid gap-6 lg:grid-cols-12 items-stretch">
        
        {/* LEFT PANEL: Slides / Lesson Reading */}
        <div className={`lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between ${
          activeItem?.type === 'lesson' ? 'lg:col-span-12 max-w-4xl mx-auto w-full' : ''
        }`}>
          {activeLesson && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-navy-deep font-black uppercase text-xs tracking-wider">
                <BookOpen className="h-4.5 w-4.5" />
                <span>Reading & Concept slide</span>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3">
                {activeLesson.title}
              </h3>

              {activeLesson.video_url && (
                <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-black">
                  <iframe
                    className="h-full w-full"
                    src={activeLesson.video_url}
                    title="CIST Video tutorial"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              <div className="text-sm text-slate-650 leading-relaxed space-y-4">
                {renderMarkdown(activeLesson.content)}
              </div>

              {activeLesson.code_example && (
                <div className="rounded-lg bg-navy-dark p-4 border border-navy-light/20 text-white font-mono text-xs">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                    Example Syntax
                  </span>
                  <pre className="overflow-x-auto">{activeLesson.code_example}</pre>
                </div>
              )}

              <div className="pt-6 border-t border-slate-150 flex justify-end">
                <button
                  onClick={handleCompleteLesson}
                  className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-6 py-3 font-bold text-white shadow transition-all active:scale-95"
                >
                  <span>Complete Lesson</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {activeChallenge && (
            <div className="flex flex-col h-full justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2 text-gold-accent bg-gold-accent/10 border border-gold-accent/20 px-3 py-1 rounded-full font-black uppercase text-[10px] tracking-widest leading-none">
                    <Trophy className="h-3.5 w-3.5 text-gold-accent" />
                    <span>Challenge Quest</span>
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Reward: ⚡ {activeChallenge.xp_reward} XP
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 leading-snug">
                  {activeChallenge.title}
                </h3>

                <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center space-x-1">
                    <HelpCircle className="h-4 w-4" />
                    <span>Mission Instructions</span>
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {activeChallenge.instructions}
                  </p>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed">
                  <p>{activeChallenge.description}</p>
                </div>
              </div>

              {checkCompletedStatus('challenge', activeChallenge.id) && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4.5 flex items-center space-x-3 text-emerald-800 text-xs">
                  <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-extrabold uppercase tracking-wide">Quest Complete!</p>
                    <p className="text-emerald-600 font-medium mt-0.5">You have solved this compiler task and gained all reward stars.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Sandbox Code Editor (only visible for challenges) */}
        {activeChallenge && (
          <div className="lg:col-span-7 flex flex-col justify-between bg-navy-dark rounded-xl overflow-hidden border border-navy-light/30 shadow-xl min-h-[450px]">
            {/* Editor Top Control Bar */}
            <div className="bg-navy-deep px-4 py-2 border-b border-navy-light/25 flex items-center justify-between text-xs text-gray-300">
              <span className="font-mono text-gray-400">code_quest_workspace.py</span>
              <div className="flex items-center space-x-3">
                <span className="text-[10px] uppercase font-bold text-gold-accent tracking-wider bg-gold-accent/15 px-2 py-0.5 rounded">
                  Python 3.x Simulated
                </span>
              </div>
            </div>

            {/* Code Textarea Area */}
            <div className="flex-1 relative font-mono text-xs flex">
              {/* Line margins */}
              <div className="bg-navy-dark px-3.5 py-4 border-r border-navy-light/15 text-gray-600 select-none text-right w-11 flex flex-col">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span key={i} className="leading-6 block">{i + 1}</span>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full bg-transparent text-slate-100 py-4 px-3 outline-none resize-none font-mono leading-6 focus:ring-0"
                spellCheck="false"
              />
            </div>

            {/* Simulated expected outputs block */}
            <div className="bg-navy-deep border-t border-navy-light/20 p-4">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">
                <span>Expected Console Result:</span>
              </div>
              <div className="rounded bg-navy-dark border border-navy-light/10 p-2 font-mono text-xs text-emerald-400">
                {activeChallenge.expected_output}
              </div>
            </div>

            {/* Sandbox Console Output Log Terminal */}
            <div className="bg-black/90 p-4 font-mono text-xs text-slate-300 border-t border-navy-light/25 h-36 overflow-y-auto">
              <div className="flex items-center space-x-1.5 text-gray-400 border-b border-navy-light/10 pb-1.5 mb-1.5 uppercase font-bold text-[9px] tracking-widest">
                <Terminal className="h-3.5 w-3.5" />
                <span>Standard Output Logs</span>
              </div>
              {terminalLogs.map((log, index) => (
                <div
                  key={index}
                  className={`leading-snug mt-1 ${
                    log.startsWith('🎉') || log.startsWith('SUCCESS') ? 'text-emerald-400' :
                    log.startsWith('❌') ? 'text-rose-400' :
                    log.startsWith('>') ? 'text-blue-400' : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>

            {/* Run submit operations bar */}
            <div className="bg-navy-deep px-4 py-3 border-t border-navy-light/25 flex items-center justify-between">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex items-center space-x-1.5 rounded-lg bg-navy-medium hover:bg-navy-light px-5 py-2.5 font-bold text-xs text-white border border-navy-light/35 shadow transition-all active:scale-95 disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5 fill-current text-gold-accent" />
                <span>Run Sandbox Tests</span>
              </button>

              <button
                onClick={handleSubmitChallenge}
                disabled={!isSuccess}
                className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 font-bold text-xs text-white shadow transition-all active:scale-95 disabled:opacity-50"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Claim Rewards & Next</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderMarkdown(content: string) {
  if (!content) return null;
  const blocks = content.split('\n\n');
  
  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Check for image: ![alt](url)
    const imgRegex = /^!\[([^\]]*)\]\(([^)]+)\)$/;
    const imgMatch = trimmed.match(imgRegex);
    if (imgMatch) {
      return (
        <div key={idx} className="my-5 text-center">
          <img
            src={imgMatch[2]}
            alt={imgMatch[1]}
            className="rounded-xl border border-slate-200 shadow-md max-h-72 object-contain mx-auto max-w-full hover:scale-[1.01] transition duration-200"
          />
          {imgMatch[1] && (
            <span className="text-[10px] font-black text-slate-400 block mt-2.5 uppercase tracking-widest">
              {imgMatch[1]}
            </span>
          )}
        </div>
      );
    }

    // Check for bullet list lines
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const lines = trimmed.split('\n');
      return (
        <ul key={idx} className="list-disc pl-5 space-y-2.5 my-4 text-slate-650 text-xs font-semibold leading-relaxed">
          {lines.map((line, lIdx) => {
            const lineContent = line.replace(/^[-*]\s+/, '');
            return <li key={lIdx}>{parseInlineStyles(lineContent)}</li>;
          })}
        </ul>
      );
    }

    // Normal paragraph
    return (
      <p key={idx} className="leading-relaxed text-xs text-slate-600 my-3 font-semibold">
        {parseInlineStyles(trimmed)}
      </p>
    );
  });
}

function parseInlineStyles(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-black text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="bg-slate-100 border border-slate-200 text-gold-accent px-1.5 py-0.5 rounded text-[11px] font-mono font-bold">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}
