'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, Award, BookOpen, Bot, Braces, CheckCircle2, ChevronRight,
  Code2, Database, Gamepad2, Globe2, Lightbulb, LockKeyhole, Network,
  Play, RotateCcw, Sparkles, Trophy, XCircle
} from 'lucide-react';

type GameMode = 'quiz' | 'debug' | 'predict' | 'classify' | 'build';

interface Question {
  prompt: string;
  code?: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface LearningStage {
  grade: number;
  title: string;
  subject: string;
  difficulty: string;
  mode: GameMode;
  icon: React.ElementType;
  color: string;
  accent: string;
  description: string;
  lessons: string[];
  questions: Question[];
}

export const LEARNING_STAGES: LearningStage[] = [
  { grade: 2, title: 'Puzzle Builder', subject: 'Block Coding', difficulty: 'Novice', mode: 'classify', icon: Network, color: 'from-cyan-500 to-blue-600', accent: 'cyan', description: 'Learn how visual coding pieces connect and how computers follow instructions.', lessons: ['Block shapes', 'Connections', 'Sequences', 'Puzzle mastery'], questions: [
    { prompt: 'Which Blockly shape can connect below a statement block?', options: ['A matching statement notch', 'A round picture', 'Any random edge', 'A title label'], answer: 0, explanation: 'Matching notches show which statement blocks can connect in sequence.' },
    { prompt: 'Why do some blocks have different shapes?', options: ['Shapes show how blocks can connect', 'Only for decoration', 'To hide instructions', 'To change screen size'], answer: 0, explanation: 'Blockly shapes communicate the role and valid connections of each block.' },
    { prompt: 'What is a sequence?', options: ['Instructions in an order', 'One random picture', 'A color only', 'An unplugged cable'], answer: 0, explanation: 'A sequence is an ordered list of instructions.' },
  ]},
  { grade: 3, title: 'Maze Runner', subject: 'Block Coding', difficulty: 'Beginner', mode: 'build', icon: Globe2, color: 'from-teal-500 to-emerald-600', accent: 'teal', description: 'Guide a character through mazes using sequences, loops, and conditions.', lessons: ['Directions', 'Sequences', 'Repeat loops', 'Conditions'], questions: [
    { prompt: 'Your character repeats the same four moves. What should you use?', options: ['A repeat loop', 'Four new characters', 'A color block', 'A sound file'], answer: 0, explanation: 'A loop expresses repeated movement clearly and efficiently.' },
    { prompt: 'Why does command order matter in a maze?', options: ['The character performs commands in sequence', 'Order changes colors only', 'It never matters', 'It changes the browser'], answer: 0, explanation: 'Changing the sequence changes the route the character follows.' },
    { prompt: 'What does an if block do?', options: ['Runs an action when a condition is true', 'Always repeats forever', 'Draws an image', 'Deletes the maze'], answer: 0, explanation: 'Conditions let a program choose actions based on the situation.' },
  ]},
  { grade: 4, title: 'Bird Logic', subject: 'Logic', difficulty: 'Beginner', mode: 'predict', icon: Braces, color: 'from-amber-400 to-orange-500', accent: 'amber', description: 'Use comparisons and conditions to guide a bird to its goal.', lessons: ['True or false', 'Comparisons', 'If decisions', 'Combined conditions'], questions: [
    { prompt: 'The bird should turn only when it is north of the flower. Which idea is needed?', options: ['A condition', 'A sound loop', 'A file name', 'A paint brush'], answer: 0, explanation: 'A condition checks position before choosing the action.' },
    { prompt: 'Which expression can be either true or false?', options: ['A comparison', 'A picture', 'A melody', 'A folder'], answer: 0, explanation: 'Comparisons produce Boolean true/false results.' },
    { prompt: 'What does an else branch mean?', options: ['Do this when the if condition is false', 'Repeat forever', 'End the internet', 'Draw a square'], answer: 0, explanation: 'Else provides an alternative action when the condition is false.' },
  ]},
  { grade: 5, title: 'Turtle Artist', subject: 'Creative Coding', difficulty: 'Intermediate', mode: 'debug', icon: Code2, color: 'from-blue-500 to-indigo-600', accent: 'blue', description: 'Create geometric art using movement, angles, and repeating patterns.', lessons: ['Movement', 'Angles', 'Repeat patterns', 'Nested designs'], questions: [
    { prompt: 'How many degrees does a turtle turn for a square corner?', options: ['90', '45', '60', '180'], answer: 0, explanation: 'A square has four 90-degree turns.' },
    { prompt: 'Which pattern efficiently draws a square?', options: ['Repeat move and turn four times', 'Use random turns', 'Move once only', 'Turn without moving'], answer: 0, explanation: 'A loop captures the repeated side-and-turn pattern.' },
    { prompt: 'What are nested loops useful for in turtle art?', options: ['Repeating a whole shape pattern', 'Closing the browser', 'Changing passwords', 'Deleting colors'], answer: 0, explanation: 'A loop inside another loop can repeat complete shapes.' },
  ]},
  { grade: 6, title: 'Movie Maker', subject: 'Math & Animation', difficulty: 'Intermediate', mode: 'classify', icon: Database, color: 'from-violet-500 to-purple-700', accent: 'violet', description: 'Animate a movie with coordinates, time, values, and mathematical patterns.', lessons: ['Coordinates', 'Time', 'Equations', 'Animation scenes'], questions: [
    { prompt: 'Which values normally control a 2D object’s position?', options: ['x and y', 'red and blue', 'name and date', 'volume only'], answer: 0, explanation: 'The x and y coordinates locate an object on a 2D stage.' },
    { prompt: 'To make motion smooth, position should change...', options: ['A little on each animation frame', 'Only once', 'Without time', 'At random'], answer: 0, explanation: 'Small timed changes create the appearance of smooth motion.' },
    { prompt: 'What can an equation control in a movie?', options: ['Position, size, or rotation over time', 'Only the file name', 'The keyboard cable', 'Nothing visual'], answer: 0, explanation: 'Equations map time to visual properties for animation.' },
  ]},
  { grade: 7, title: 'Music Studio', subject: 'Music & Functions', difficulty: 'Intermediate', mode: 'quiz', icon: LockKeyhole, color: 'from-rose-500 to-red-700', accent: 'rose', description: 'Compose music by combining notes, patterns, repetition, and reusable functions.', lessons: ['Notes', 'Rhythm patterns', 'Repeat phrases', 'Functions'], questions: [
    { prompt: 'Why put a repeated melody inside a function?', options: ['Reuse it without rebuilding every note', 'Make it silent', 'Delete its rhythm', 'Stop all code'], answer: 0, explanation: 'Functions name reusable sequences of musical instructions.' },
    { prompt: 'What creates rhythm?', options: ['Patterns of notes and rests over time', 'Random file names', 'Screen brightness', 'A password'], answer: 0, explanation: 'Music rhythm comes from timed patterns of sound and silence.' },
    { prompt: 'How can a loop help compose music?', options: ['Repeat a beat or phrase', 'Change the keyboard', 'Remove all notes', 'Close the project'], answer: 0, explanation: 'Loops repeat musical material consistently.' },
  ]},
  { grade: 8, title: 'Pond Tutor', subject: 'Blocks to Text', difficulty: 'Intermediate', mode: 'build', icon: Gamepad2, color: 'from-fuchsia-500 to-purple-700', accent: 'fuchsia', description: 'See how visual blocks translate into readable text-based code.', lessons: ['Block translation', 'Commands', 'Functions', 'Text coding'], questions: [
    { prompt: 'What is generated when Blockly blocks are translated?', options: ['Text-based code', 'A new keyboard', 'Only an image', 'A password'], answer: 0, explanation: 'Code generators translate visual blocks into a text language such as JavaScript.' },
    { prompt: 'Why compare the block view and text view?', options: ['See how the same logic is represented', 'Make the pond larger', 'Hide the program', 'Remove all commands'], answer: 0, explanation: 'The two views express the same algorithm in different forms.' },
    { prompt: 'What is a function in text code?', options: ['A named reusable group of instructions', 'A background color', 'A browser window', 'A single picture'], answer: 0, explanation: 'Functions organize reusable behavior in both blocks and text.' },
  ]},
  { grade: 9, title: 'Pond Strategy', subject: 'Strategy Coding', difficulty: 'Advanced', mode: 'classify', icon: Bot, color: 'from-orange-400 to-rose-600', accent: 'orange', description: 'Program an autonomous player using logic, variables, and strategy.', lessons: ['Game state', 'Strategy', 'Functions', 'Autonomous play'], questions: [
    { prompt: 'What makes a game agent autonomous?', options: ['It senses state and chooses actions itself', 'A person clicks every move', 'It has no rules', 'It only changes color'], answer: 0, explanation: 'An autonomous agent reads the world and selects actions through code.' },
    { prompt: 'Why store an opponent’s position in a variable?', options: ['Use it when deciding the next action', 'Make the screen brighter', 'Rename the browser', 'Delete the arena'], answer: 0, explanation: 'State variables give a strategy current information.' },
    { prompt: 'What is a strategy?', options: ['A rule for choosing actions toward a goal', 'A random picture', 'A sound volume', 'A folder type'], answer: 0, explanation: 'Strategies connect observations to goal-directed decisions.' },
  ]},
  { grade: 10, title: 'Scratch Creator', subject: 'Creative Coding', difficulty: 'Advanced', mode: 'predict', icon: Bot, color: 'from-slate-500 to-cyan-700', accent: 'cyan', description: 'Create an original interactive story, animation, or game in Scratch.', lessons: ['Sprites', 'Events', 'Motion and looks', 'Original project'], questions: [
    { prompt: 'Which Scratch block starts a script when the green flag is clicked?', options: ['An event block', 'A motion value', 'A costume only', 'A variable reporter'], answer: 0, explanation: 'Event blocks begin scripts when something happens.' },
    { prompt: 'What is a sprite?', options: ['A programmable character or object', 'A password', 'A browser setting', 'A table row'], answer: 0, explanation: 'Sprites are the actors and objects in a Scratch project.' },
    { prompt: 'How can two sprites coordinate?', options: ['Broadcast and receive messages', 'Rename the computer', 'Delete the stage', 'Use no events'], answer: 0, explanation: 'Broadcast messages let sprites trigger one another’s scripts.' },
  ]},
  { grade: 11, title: 'Computer Science Foundations', subject: 'Computer Science', difficulty: 'Advanced', mode: 'predict', icon: Sparkles, color: 'from-indigo-500 to-blue-800', accent: 'indigo', description: 'Study algorithms, data structures, abstraction, efficiency, and computational thinking.', lessons: ['Algorithms', 'Data structures', 'Efficiency', 'Abstraction'], questions: [
    { prompt: 'Binary search requires the data to be...', options: ['Sorted', 'Encrypted', 'Colorful', 'Duplicated'], answer: 0, explanation: 'Binary search eliminates half of a sorted search space each step.' },
    { prompt: 'Which notation describes algorithm growth?', options: ['Big O', 'HTML', 'RGB', 'HTTP'], answer: 0, explanation: 'Big O describes how resource use grows with input size.' },
    { prompt: 'What must recursion include?', options: ['A base case', 'A browser tab', 'A global password', 'A CSS class'], answer: 0, explanation: 'A base case stops recursive calls.' },
  ]},
  { grade: 12, title: 'Web Development Studio', subject: 'Web Development', difficulty: 'Expert', mode: 'build', icon: Trophy, color: 'from-yellow-500 to-orange-700', accent: 'yellow', description: 'Create complete websites with HTML, CSS, JavaScript, accessibility, and responsive design.', lessons: ['HTML structure', 'CSS and responsive layout', 'JavaScript interactions', 'Publish a website'], questions: [
    { prompt: 'Which HTML element contains the main page heading?', options: ['<h1>', '<img>', '<style>', '<script>'], answer: 0, explanation: '<h1> represents the primary heading.' },
    { prompt: 'What makes a layout responsive?', options: ['It adapts to different screen sizes', 'It only works on one laptop', 'It has no CSS', 'It uses fixed pictures only'], answer: 0, explanation: 'Responsive layouts adapt using flexible sizing and media queries.' },
    { prompt: 'What does JavaScript add to a web page?', options: ['Interactive behavior', 'Only text color', 'The internet cable', 'A file extension only'], answer: 0, explanation: 'JavaScript handles events, state changes, and dynamic interactions.' },
  ]},
];

const modeCopy: Record<GameMode, { title: string; action: string }> = {
  quiz: { title: 'Knowledge Mission', action: 'Lock answer' },
  debug: { title: 'Bug Hunt', action: 'Apply fix' },
  predict: { title: 'Output Oracle', action: 'Run prediction' },
  classify: { title: 'Sorting Lab', action: 'Classify it' },
  build: { title: 'Builder Challenge', action: 'Use this block' },
};

export function LearningArcadeGame({ grade, levelNumber, onBack, onComplete }: { grade: number; levelNumber: number; onBack: () => void; onComplete: () => void }) {
  const stage = LEARNING_STAGES.find((item) => item.grade === grade) || LEARNING_STAGES[0];
  const questions = useMemo(() => Array.from({ length: 3 }, (_, index) => stage.questions[(levelNumber + index - 1) % stage.questions.length]), [stage, levelNumber]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const question = questions[questionIndex];
  const Icon = stage.icon;
  const isCorrect = selected === question.answer;

  const checkAnswer = () => {
    if (selected === null) return;
    setChecked(true);
    if (selected === question.answer) setScore((value) => value + 1);
  };

  const next = () => {
    if (questionIndex === questions.length - 1) {
      onComplete();
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelected(null);
    setChecked(false);
  };

  return (
    <div className="min-h-[calc(100vh-9.5rem)] bg-slate-950 p-4 md:p-7">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border-2 border-white/10 bg-slate-900 shadow-2xl">
        <header className={`relative overflow-hidden bg-gradient-to-r ${stage.color} p-6 text-white md:p-8`}>
          <div className="absolute -right-10 -top-20 text-[13rem] font-black opacity-10">{stage.subject.slice(0, 2).toUpperCase()}</div>
          <button onClick={onBack} className="relative flex items-center gap-2 rounded-xl bg-black/20 px-3 py-2 text-xs font-black hover:bg-black/30"><ArrowLeft className="h-4 w-4" /> Course library</button>
          <div className="relative mt-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4"><span className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/20"><Icon className="h-8 w-8" /></span><div><span className="text-xs font-black uppercase tracking-[.18em]">{stage.subject} • {stage.difficulty}</span><h1 className="mt-1 text-3xl font-black">{stage.title}</h1><p className="mt-1 max-w-2xl text-sm font-semibold text-white/85">{stage.description}</p></div></div>
            <div className="rounded-2xl border border-white/20 bg-black/15 px-5 py-3 text-center"><span className="text-[10px] font-black uppercase tracking-wider text-white/70">Challenge</span><strong className="block text-2xl">{levelNumber} / 10</strong></div>
          </div>
        </header>

        <div className="grid lg:grid-cols-[280px_1fr]">
          <aside className="border-b border-white/10 bg-slate-900 p-5 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400"><BookOpen className="h-4 w-4" /> What you learn</div>
            <div className="mt-4 space-y-2">{stage.lessons.map((lesson, index) => <div key={lesson} className={`flex items-center gap-3 rounded-xl border p-3 text-xs font-bold ${index <= Math.floor((levelNumber - 1) / 3) ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/5 bg-white/[.03] text-slate-500'}`}><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/20">{index + 1}</span>{lesson}</div>)}</div>
            <div className="mt-6"><div className="flex justify-between text-[10px] font-black uppercase text-slate-500"><span>Mission progress</span><span>{questionIndex + 1}/{questions.length}</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-black/30 p-0.5"><div className={`h-full rounded-full bg-gradient-to-r ${stage.color} transition-all`} style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div></div>
          </aside>

          <main className="bg-slate-950 p-5 md:p-8">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center justify-between"><div><span className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-400">{modeCopy[stage.mode].title}</span><h2 className="mt-1 text-2xl font-black text-white">{question.prompt}</h2></div><div className="flex items-center gap-1 rounded-full bg-yellow-400/10 px-3 py-1.5 text-xs font-black text-yellow-300"><Award className="h-4 w-4" /> {score} correct</div></div>
              {question.code && <pre className="mt-6 overflow-x-auto rounded-2xl border-2 border-sky-400/20 bg-[#0d2235] p-5 font-mono text-sm leading-relaxed text-sky-100 shadow-inner"><code>{question.code}</code></pre>}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">{question.options.map((option, index) => { const correct = checked && index === question.answer; const wrong = checked && selected === index && index !== question.answer; return <button key={option} disabled={checked} onClick={() => setSelected(index)} className={`min-h-20 rounded-2xl border-2 p-4 text-left text-sm font-black transition ${correct ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200' : wrong ? 'border-rose-400 bg-rose-500/15 text-rose-200' : selected === index ? 'border-sky-400 bg-sky-500/15 text-white' : 'border-white/10 bg-white/[.04] text-slate-200 hover:border-sky-400/50 hover:bg-white/[.07]'}`}><span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-black/20 text-xs">{String.fromCharCode(65 + index)}</span>{option}</button>; })}</div>
              {checked && <div className={`mt-5 flex gap-3 rounded-2xl border p-4 ${isCorrect ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100' : 'border-rose-400/30 bg-rose-500/10 text-rose-100'}`}>{isCorrect ? <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" /> : <XCircle className="h-6 w-6 shrink-0 text-rose-400" />}<div><b>{isCorrect ? 'Excellent work!' : 'Good try—learn from the clue.'}</b><p className="mt-1 text-xs leading-relaxed opacity-80">{question.explanation}</p></div></div>}
              <div className="mt-7 flex items-center justify-between gap-3"><button onClick={() => { setSelected(null); setChecked(false); }} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs font-black text-slate-400 hover:text-white"><RotateCcw className="h-4 w-4" /> Reset</button>{checked ? <button onClick={next} className={`quest-button flex items-center gap-2 rounded-2xl bg-gradient-to-r ${stage.color} px-7 py-4 text-sm font-black text-white`}>{questionIndex === questions.length - 1 ? 'Complete challenge' : 'Next mission'} <ChevronRight className="h-5 w-5" /></button> : <button disabled={selected === null} onClick={checkAnswer} className={`quest-button flex items-center gap-2 rounded-2xl bg-gradient-to-r ${stage.color} px-7 py-4 text-sm font-black text-white disabled:opacity-40`}><Play className="h-5 w-5 fill-current" /> {modeCopy[stage.mode].action}</button>}</div>
              <div className="mt-6 flex items-center gap-2 text-[11px] font-semibold text-slate-500"><Lightbulb className="h-4 w-4 text-yellow-400" /> Complete three learning missions to earn this level’s XP and coins.</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
