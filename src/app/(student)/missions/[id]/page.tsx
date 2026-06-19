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
    setTerminalLogs(prev => [...prev, '> Running check test...']);
    
    // Simulating Python interpretation console dynamically
    setTimeout(() => {
      setIsRunning(false);
      
      const cleanCode = code.trim();
      const expected = activeChallenge.expected_output.trim();

      const lines = cleanCode.split('\n');
      const variables: Record<string, string> = {};
      const outputLines: string[] = [];

      for (let line of lines) {
        line = line.trim();
        // Skip comments and empty lines
        if (line.startsWith('#') || !line) continue;

        // Match variable assignments like: school_city = "Tangier" or x = 'value'
        const assignmentMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*["']([^"']*)["']$/);
        if (assignmentMatch) {
          const varName = assignmentMatch[1];
          const varVal = assignmentMatch[2];
          variables[varName] = varVal;
          continue;
        }

        // Match print statement: print("...") or print(var_name)
        const printMatch = line.match(/^print\s*\(\s*(.*)\s*\)$/);
        if (printMatch) {
          const arg = printMatch[1].trim();
          // Check if argument is quoted string
          const stringMatch = arg.match(/^["']([^"']*)["']$/);
          if (stringMatch) {
            outputLines.push(stringMatch[1]);
          } else if (variables[arg] !== undefined) {
            outputLines.push(variables[arg]);
          } else {
            // Fallback: if it's print(something) and not a recognized variable,
            // strip quotes if any, or output the raw text.
            const cleanArg = arg.replace(/^["']|["']$/g, '');
            outputLines.push(cleanArg);
          }
        }
      }

      const stdout = outputLines.join('\n').trim();

      if (stdout === expected) {
        setTerminalLogs(prev => [
          ...prev,
          `SUCCESS: Output matches expected outcome.`,
          `[STDOUT]: ${stdout}`,
          `🎉 All tests passed successfully! +${activeChallenge.xp_reward} XP rewarded.`
        ]);
        setIsSuccess(true);
      } else {
        setTerminalLogs(prev => [
          ...prev,
          `[STDOUT]: ${stdout || '(no output)'}`,
          `❌ TEST FAILED: Output did not match expected string: "${expected}".`,
          `Review your inputs and run again.`
        ]);
        setIsSuccess(false);
      }
    }, 1200);
  };

  const handleSubmitChallenge = async () => {
    if (!student || !profile || !activeChallenge || !isSuccess) return;
    try {
      await dbService.completeChallenge(student.id, profile.id, mission.id, activeChallenge.id, activeChallenge.xp_reward, activeChallenge.coin_reward);
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

              <div className="text-sm text-slate-600 leading-relaxed space-y-4">
                <p>{activeLesson.content}</p>
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
