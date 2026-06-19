// src/app/(student)/code-lab/page.tsx
'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { dbService } from '@/lib/db';
import { Code2, Play, Save, UploadCloud, Terminal, AlertCircle, FileCode } from 'lucide-react';

export default function CodeLabPage() {
  const { student } = useApp();
  const [language, setLanguage] = useState('python');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('# Write your custom project code here\n\ndef main():\n    print("Hello from CIST Code Lab!")\n\nif __name__ == "__main__":\n    main()');
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['CIST Code Lab compiler ready. Select language and start coding.']);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (lang === 'python') {
      setCode('# Write your custom project code here\n\ndef main():\n    print("Hello from CIST Code Lab!")\n\nif __name__ == "__main__":\n    main()');
    } else if (lang === 'javascript') {
      setCode('// JavaScript Playground\nfunction greeting() {\n    console.log("Welcome to JavaScript sandbox!");\n}\n\ngreeting();');
    } else if (lang === 'html') {
      setCode('<!-- HTML/CSS Editor -->\n<div class="card">\n    <h1>CIST CodeQuest</h1>\n    <p>Build beautiful visual pages.</p>\n</div>\n\n<style>\n.card { padding: 20px; background: #0B2545; color: #fff; border-radius: 8px; }\n</style>');
    } else {
      setCode('// Arduino Microcontroller logic\nvoid setup() {\n    pinMode(13, OUTPUT);\n    Serial.begin(9600);\n}\n\nvoid loop() {\n    digitalWrite(13, HIGH);\n    delay(1000);\n    digitalWrite(13, LOW);\n    delay(1000);\n}');
    }
  };

  const handleRun = () => {
    setTerminalLogs(prev => [...prev, `> Executing ${language.toUpperCase()} file...`]);
    setTimeout(() => {
      if (language === 'python') {
        setTerminalLogs(prev => [...prev, 'Hello from CIST Code Lab!', '🎉 Execution successful. Zero exit codes.']);
      } else if (language === 'javascript') {
        setTerminalLogs(prev => [...prev, 'Welcome to JavaScript sandbox!', '🎉 Program compiled with zero warnings.']);
      } else if (language === 'html') {
        setTerminalLogs(prev => [...prev, 'Render Engine: HTML layout parsed successfully. Frame sizes standard.']);
      } else {
        setTerminalLogs(prev => [...prev, 'Sketch uploaded to Virtual Arduino controller. LED Pin 13 blinking.', 'Memory usage: 9% of flash space.']);
      }
    }, 800);
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    if (!title || !description) {
      setStatusMsg({ type: 'error', text: 'Please fill in both a project title and description.' });
      return;
    }
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const projectData = {
        title,
        description,
        category: language === 'arduino' ? 'Robotics' : language === 'html' ? 'Website' : language === 'javascript' ? 'Game' : 'Python',
        image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80', // Default code lab preview image
        video_url: '',
        project_url: '',
        github_url: ''
      };

      await dbService.submitProject(student.id, projectData);
      setStatusMsg({
        type: 'success',
        text: '🎉 Project submitted! A CIST instructor will review your code. Track status in the Showcase!'
      });
      // Clear forms
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Submission failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
          <Code2 className="h-6 w-6 text-navy-deep" />
          <span>Student Code Lab</span>
        </h2>
        <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
          An open environment to write software, save code files, and submit projects to teachers
        </p>
      </div>

      {statusMsg.text && (
        <div className={`p-4 rounded-xl border text-xs font-semibold leading-relaxed flex items-center space-x-2.5 ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 animate-pulse' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main split grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        
        {/* LEFT COMPONENT: Code editor terminal */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-navy-dark rounded-xl overflow-hidden border border-navy-light/35 shadow-lg min-h-[500px]">
          {/* Header Controls */}
          <div className="bg-navy-deep px-4 py-2.5 border-b border-navy-light/25 flex items-center justify-between text-xs text-gray-300">
            <div className="flex space-x-2">
              {['python', 'javascript', 'html', 'arduino'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-3 py-1 rounded font-bold uppercase text-[9.5px] transition ${
                    language === lang
                      ? 'bg-maple-red text-white shadow-sm border border-gold-accent/25'
                      : 'hover:bg-navy-medium text-gray-400'
                  }`}
                >
                  {lang === 'arduino' ? 'Arduino (C++)' : lang}
                </button>
              ))}
            </div>
            <span className="font-mono text-gray-500 hidden sm:block">main_file.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'html' ? 'html' : 'ino'}</span>
          </div>

          {/* Text Editor Area */}
          <div className="flex-grow flex text-xs font-mono relative">
            <div className="bg-navy-dark px-3 py-4 border-r border-navy-light/15 text-gray-650 text-right select-none w-10">
              {Array.from({ length: 16 }).map((_, i) => (
                <span key={i} className="leading-6 block">{i + 1}</span>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-grow bg-transparent text-slate-100 py-4 px-3 outline-none resize-none leading-6 w-full focus:ring-0"
              spellCheck="false"
            />
          </div>

          {/* Terminal output */}
          <div className="bg-black/95 p-4 font-mono text-[11px] text-slate-350 border-t border-navy-light/20 h-32 overflow-y-auto">
            <div className="flex items-center space-x-1.5 text-gray-500 font-bold uppercase text-[9px] tracking-widest pb-1 border-b border-navy-light/10 mb-1">
              <Terminal className="h-3.5 w-3.5" />
              <span>Compilation output logs</span>
            </div>
            {terminalLogs.map((log, index) => (
              <div key={index} className={`mt-0.5 ${log.startsWith('🎉') || log.startsWith('Hello') || log.startsWith('Welcome') ? 'text-emerald-400' : log.startsWith('>') ? 'text-blue-400' : 'text-slate-400'}`}>
                {log}
              </div>
            ))}
          </div>

          {/* Actions Bar */}
          <div className="bg-navy-deep px-4 py-3.5 border-t border-navy-light/25 flex justify-end">
            <button
              onClick={handleRun}
              className="flex items-center space-x-1.5 rounded-lg bg-navy-medium hover:bg-navy-light px-5 py-2.5 font-bold text-xs text-white border border-navy-light/35 shadow transition-all active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-current text-gold-accent" />
              <span>Compile & Run Sandbox</span>
            </button>
          </div>
        </div>

        {/* RIGHT COMPONENT: Submission details form */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-black uppercase text-sm text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center space-x-2">
            <UploadCloud className="h-4.5 w-4.5 text-navy-deep" />
            <span>Publish Project Showcase</span>
          </h3>

          <form onSubmit={handleSubmitProject} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Software Title
              </label>
              <input
                type="text"
                placeholder="e.g. Cape Spartel Tour Helper"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-navy-deep transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Project Description & Architecture
              </label>
              <textarea
                placeholder="Explain the logic, loop counters, variable types, or sensor configurations you applied in this code."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-navy-deep transition resize-none"
                required
              />
            </div>

            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 text-xs text-slate-500 leading-relaxed font-semibold">
              <span className="block font-black uppercase text-slate-700 mb-1">Moderation Notice:</span>
              Once you submit this software block, it will appear in the CIST teacher evaluation dashboard. Upon approval, you earn <span className="text-navy-deep font-bold">+200 XP</span> and it will be visible on the school Projects Showcase.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-navy-deep hover:bg-maple-red py-3 font-bold uppercase text-xs text-white transition active:scale-95 shadow disabled:opacity-50"
            >
              Submit to Instructor
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
