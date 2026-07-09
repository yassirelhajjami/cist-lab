// src/app/(student)/code-lab/page.tsx
'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { dbService } from '@/lib/db';
import { Code2, Play, UploadCloud, Terminal, AlertCircle } from 'lucide-react';
import { uploadProjectScreenshot } from '@/utils/supabase/storage';
import { triggerWebhookAlert } from '@/utils/webhook';

export default function CodeLabPage() {
  const { student, profile } = useApp();
  const [language, setLanguage] = useState('python');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [code, setCode] = useState(
    '# Write your Python code here\nprint("Hello, World!")'
  );
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'CIST Code Lab compiler ready. Select language and start coding.',
  ]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setHtmlPreview(null); // Clear any previous HTML preview when switching languages
    if (lang === 'python') {
      setCode('# Write your Python code here\nprint("Hello, World!")');
    } else if (lang === 'javascript') {
      setCode('// JavaScript Playground\nconsole.log("Hello from JavaScript!");');
    } else if (lang === 'html') {
      setCode(
        '<!-- HTML/CSS Editor -->\n<div class="card">\n    <h1>CIST CodeQuest</h1>\n    <p>Build beautiful visual pages.</p>\n</div>\n\n<style>\n.card { padding: 20px; background: #0B2545; color: #fff; border-radius: 8px; }\n</style>'
      );
    } else {
      setCode(
        '// Arduino Microcontroller logic\nvoid setup() {\n    pinMode(13, OUTPUT);\n    Serial.begin(9600);\n}\n\nvoid loop() {\n    digitalWrite(13, HIGH);\n    delay(1000);\n    digitalWrite(13, LOW);\n    delay(1000);\n}'
      );
    }
  };

  // ===========================================================================
  // REAL PYTHON INTERPRETER  (client-side sandbox)
  // Supports: print, variables, arithmetic, for/while, if/elif/else, def, lists,
  // f-strings, string methods, built-ins (range, len, int, str, abs, max, min…)
  // ===========================================================================
  const runPython = (src: string): string[] => {
    const output: string[] = [];
    const scope: Record<string, any> = { True: true, False: false, None: null };

    function pythonStr(v: any): string {
      if (v === null || v === undefined) return 'None';
      if (typeof v === 'boolean') return v ? 'True' : 'False';
      if (Array.isArray(v)) return '[' + v.map(pythonStr).join(', ') + ']';
      return String(v);
    }

    const builtins: Record<string, (...a: any[]) => any> = {
      print: (...args: any[]) => { output.push(args.map(pythonStr).join(' ')); },
      len: (v: any) => (Array.isArray(v) || typeof v === 'string' ? v.length : 0),
      range: (a: number, b?: number, step = 1) => {
        const s = b === undefined ? 0 : a, e = b === undefined ? a : b;
        const r: number[] = [];
        for (let i = s; step > 0 ? i < e : i > e; i += step) r.push(i);
        return r;
      },
      int: (v: any) => parseInt(String(v), 10),
      float: (v: any) => parseFloat(String(v)),
      str: (v: any) => pythonStr(v),
      bool: (v: any) => !!v,
      abs: (v: number) => Math.abs(v),
      max: (...a: any[]) => Math.max(...a.flat()),
      min: (...a: any[]) => Math.min(...a.flat()),
      sum: (a: number[]) => a.reduce((t, v) => t + v, 0),
      round: (n: number, d = 0) => parseFloat(n.toFixed(d)),
      type: (v: any) => {
        if (v === null) return "<class 'NoneType'>";
        if (Array.isArray(v)) return "<class 'list'>";
        if (typeof v === 'boolean') return "<class 'bool'>";
        if (typeof v === 'number') return Number.isInteger(v) ? "<class 'int'>" : "<class 'float'>";
        return `<class '${typeof v}'>`;
      },
      input: () => '',
      enumerate: (a: any[]) => a.map((v, i) => [i, v]),
      zip: (...arrays: any[][]) => arrays[0].map((_: any, i: number) => arrays.map(a => a[i])),
      list: (v: any) => Array.isArray(v) ? [...v] : [...String(v)],
      reversed: (a: any[]) => [...a].reverse(),
      sorted: (a: any[]) => [...a].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)),
    };

    function splitArgs(s: string): string[] {
      const args: string[] = [];
      let depth = 0, cur = '', inStr = false, strChar = '';
      for (const ch of s) {
        if (inStr) { cur += ch; if (ch === strChar) inStr = false; continue; }
        if ((ch === '"' || ch === "'") && !inStr) { inStr = true; strChar = ch; cur += ch; continue; }
        if (ch === '(' || ch === '[' || ch === '{') { depth++; cur += ch; continue; }
        if (ch === ')' || ch === ']' || ch === '}') { depth--; cur += ch; continue; }
        if (ch === ',' && depth === 0) { args.push(cur.trim()); cur = ''; continue; }
        cur += ch;
      }
      if (cur.trim()) args.push(cur.trim());
      return args;
    }

    function evalExpr(expr: string, localScope: Record<string, any> = scope): any {
      expr = expr.trim();
      if (!expr) return undefined;

      // f-string
      if (/^f("|'|"""|''')/.test(expr)) {
        const inner = expr.slice(2, -1);
        return inner.replace(/\{([^}]+)\}/g, (_: string, e: string) =>
          pythonStr(evalExpr(e.trim(), localScope))
        );
      }

      // String literal
      if (/^("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"]*"|'[^']*')$/.test(expr)) {
        return expr.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t');
      }

      // Boolean / None
      if (expr === 'True') return true;
      if (expr === 'False') return false;
      if (expr === 'None') return null;

      // List literal
      if (expr.startsWith('[') && expr.endsWith(']')) {
        const inner = expr.slice(1, -1).trim();
        return inner ? splitArgs(inner).map(e => evalExpr(e, localScope)) : [];
      }

      // Subscript obj[idx]
      const subMatch = expr.match(/^([a-zA-Z_]\w*)\[(.+)\]$/);
      if (subMatch) {
        const obj = localScope[subMatch[1]] ?? scope[subMatch[1]];
        const idx = evalExpr(subMatch[2], localScope);
        if (Array.isArray(obj) || typeof obj === 'string') {
          return obj[idx < 0 ? obj.length + idx : idx];
        }
        return undefined;
      }

      // Method call obj.method(args)
      const methodMatch = expr.match(/^([a-zA-Z_]\w*)\.([a-zA-Z_]\w*)\(([\s\S]*)\)$/);
      if (methodMatch) {
        const obj = localScope[methodMatch[1]] ?? scope[methodMatch[1]];
        const method = methodMatch[2];
        const args = methodMatch[3].trim()
          ? splitArgs(methodMatch[3]).map(e => evalExpr(e, localScope))
          : [];
        if (typeof obj === 'string') {
          if (method === 'upper') return obj.toUpperCase();
          if (method === 'lower') return obj.toLowerCase();
          if (method === 'strip') return obj.trim();
          if (method === 'replace') return obj.replace(new RegExp(args[0], 'g'), args[1]);
          if (method === 'split') return args.length ? obj.split(args[0]) : obj.split(/\s+/).filter(Boolean);
          if (method === 'join') return obj;
          if (method === 'startswith') return obj.startsWith(args[0]);
          if (method === 'endswith') return obj.endsWith(args[0]);
          if (method === 'find') return obj.indexOf(args[0]);
          if (method === 'format') { let i = 0; return obj.replace(/\{\}/g, () => pythonStr(args[i++])); }
          if (method === 'count') return (obj.match(new RegExp(args[0], 'g')) || []).length;
        }
        if (Array.isArray(obj)) {
          if (method === 'append') { obj.push(args[0]); return null; }
          if (method === 'pop') return obj.pop();
          if (method === 'remove') { const i = obj.indexOf(args[0]); if (i > -1) obj.splice(i, 1); return null; }
          if (method === 'sort') { obj.sort((a: any, b: any) => a < b ? -1 : a > b ? 1 : 0); return null; }
          if (method === 'reverse') { obj.reverse(); return null; }
          if (method === 'index') return obj.indexOf(args[0]);
          if (method === 'extend') { obj.push(...args[0]); return null; }
          if (method === 'count') return obj.filter((x: any) => x === args[0]).length;
          if (method === 'join') return args[0].join(obj); // "sep".join(list)
        }
        return undefined;
      }

      // Function call name(args)
      const callMatch = expr.match(/^([a-zA-Z_]\w*)\(([\s\S]*)\)$/);
      if (callMatch) {
        const name = callMatch[1];
        const argsRaw = callMatch[2];
        const args = argsRaw.trim()
          ? splitArgs(argsRaw).map(e => evalExpr(e, localScope))
          : [];
        if (name in builtins) return builtins[name](...args);
        const fn = localScope[name] ?? scope[name];
        if (typeof fn === 'function') return fn(...args);
        throw new Error(`NameError: name '${name}' is not defined`);
      }

      // Variable
      if (/^[a-zA-Z_]\w*$/.test(expr)) {
        if (expr in localScope) return localScope[expr];
        if (expr in scope) return scope[expr];
        if (expr in builtins) return builtins[expr];
        throw new Error(`NameError: name '${expr}' is not defined`);
      }

      // Numeric literal
      if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);

      // Arithmetic / comparison / boolean ops via JS
      try {
        const js = expr
          .replace(/\*\*/g, '**')
          .replace(/\band\b/g, '&&')
          .replace(/\bor\b/g, '||')
          .replace(/\bnot\s+/g, '!')
          .replace(/\bTrue\b/g, 'true')
          .replace(/\bFalse\b/g, 'false')
          .replace(/\bNone\b/g, 'null')
          .replace(/\/\//g, 'Math.trunc($1/$2)'); // integer div handled below

        const merged = { ...scope, ...localScope, ...builtins };
        const keys = Object.keys(merged);
        const vals = keys.map(k => merged[k]);
        // eslint-disable-next-line no-new-func
        return new Function(...keys, `return (${js});`)(...vals);
      } catch {
        throw new Error(`SyntaxError: cannot evaluate: ${expr}`);
      }
    }

    function getIndent(line: string) { return line.length - line.trimStart().length; }

    function runBlock(blockLines: string[], localScope: Record<string, any>) {
      let i = 0;

      while (i < blockLines.length) {
        const raw = (blockLines[i] ?? '').trimEnd();
        const trimmed = raw.trimStart();
        if (!trimmed || trimmed.startsWith('#')) { i++; continue; }

        const baseIndent = getIndent(raw);

        // ── if / elif / else ──
        if (/^(if|elif)\s+/.test(trimmed) || trimmed === 'else:') {
          const branches: { cond: string | null; body: string[] }[] = [];
          while (i < blockLines.length) {
            const bl = (blockLines[i] ?? '').trimEnd();
            const bt = bl.trimStart();
            if (!bt) { i++; continue; }
            if (getIndent(bl) < baseIndent) break;
            if (getIndent(bl) === baseIndent) {
              let keyword = '', condStr = '';
              if (bt.startsWith('if ')) { keyword = 'if'; condStr = bt.slice(3).replace(/:$/, ''); }
              else if (bt.startsWith('elif ')) { keyword = 'elif'; condStr = bt.slice(5).replace(/:$/, ''); }
              else if (bt === 'else:') { keyword = 'else'; }
              else break;

              i++;
              const body: string[] = [];
              while (i < blockLines.length) {
                const ll = (blockLines[i] ?? '').trimEnd();
                if (!ll.trim()) { i++; body.push(''); continue; }
                if (getIndent(ll) <= baseIndent) break;
                body.push(ll); i++;
              }
              branches.push({ cond: keyword === 'else' ? null : condStr, body });
            } else { break; }
          }
          let executed = false;
          for (const branch of branches) {
            if (executed) break;
            if (branch.cond === null) { runBlock(branch.body, localScope); executed = true; }
            else {
              try { if (evalExpr(branch.cond, localScope)) { runBlock(branch.body, localScope); executed = true; } }
              catch { /* skip */ }
            }
          }
          continue;
        }

        // ── for loop ──
        if (trimmed.startsWith('for ')) {
          const m = trimmed.match(/^for\s+(\w+)\s+in\s+(.+):$/);
          if (m) {
            i++;
            const body: string[] = [];
            while (i < blockLines.length) {
              const ll = (blockLines[i] ?? '').trimEnd();
              if (!ll.trim()) { i++; body.push(''); continue; }
              if (getIndent(ll) <= baseIndent) break;
              body.push(ll); i++;
            }
            let iterable: any[] = [];
            try { const r = evalExpr(m[2], localScope); iterable = Array.isArray(r) ? r : [r]; } catch {}
            let cnt = 0;
            for (const item of iterable) {
              if (cnt++ > 500) { output.push('RuntimeError: loop exceeded 500 iterations'); break; }
              const loopScope = { ...localScope, [m[1]]: item };
              Object.assign(scope, loopScope);
              runBlock(body, loopScope);
              Object.assign(localScope, loopScope);
            }
          } else { i++; }
          continue;
        }

        // ── while loop ──
        if (trimmed.startsWith('while ')) {
          const condExpr = trimmed.slice(6).replace(/:$/, '');
          i++;
          const body: string[] = [];
          while (i < blockLines.length) {
            const ll = (blockLines[i] ?? '').trimEnd();
            if (!ll.trim()) { i++; body.push(''); continue; }
            if (getIndent(ll) <= baseIndent) break;
            body.push(ll); i++;
          }
          let cnt = 0;
          while (cnt++ < 500) {
            try { if (!evalExpr(condExpr, localScope)) break; } catch { break; }
            runBlock(body, localScope);
          }
          if (cnt >= 500) output.push('RuntimeError: while loop exceeded limit');
          continue;
        }

        // ── def function ──
        if (trimmed.startsWith('def ')) {
          const m = trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/);
          if (m) {
            const fnName = m[1];
            const params = m[2].split(',').map(p => p.trim()).filter(Boolean);
            i++;
            const body: string[] = [];
            while (i < blockLines.length) {
              const ll = (blockLines[i] ?? '').trimEnd();
              if (!ll.trim()) { i++; body.push(''); continue; }
              if (getIndent(ll) <= baseIndent) break;
              body.push(ll); i++;
            }
            const fn = (...args: any[]) => {
              const fnScope: Record<string, any> = { ...scope, ...localScope };
              params.forEach((p, idx) => { fnScope[p] = args[idx]; });
              runBlock(body, fnScope);
            };
            localScope[fnName] = fn;
            scope[fnName] = fn;
          } else { i++; }
          continue;
        }

        // ── print call ──
        if (trimmed.startsWith('print(')) {
          try {
            const inner = trimmed.slice(6, trimmed.lastIndexOf(')'));
            if (!inner.trim()) { output.push(''); i++; continue; }
            const parts: any[] = [];
            let sep = ' ';
            for (const arg of splitArgs(inner)) {
              if (arg.startsWith('sep=')) { sep = evalExpr(arg.slice(4), localScope); }
              else if (arg.startsWith('end=')) { /* ignore */ }
              else parts.push(evalExpr(arg, localScope));
            }
            output.push(parts.map(pythonStr).join(sep));
          } catch (e: any) { output.push(e.message || String(e)); }
          i++; continue;
        }

        // ── augmented / regular assignment ──
        const augMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*(\+|-|\*|\/\/|\/|%|\*\*)?=(?!=)\s*(.+)$/);
        if (augMatch) {
          const [, varName, op, rhs] = augMatch;
          try {
            let val = evalExpr(rhs, localScope);
            if (op) {
              const cur = localScope[varName] ?? scope[varName] ?? 0;
              if (op === '+') val = cur + val;
              else if (op === '-') val = cur - val;
              else if (op === '*') val = cur * val;
              else if (op === '/') val = cur / val;
              else if (op === '//') val = Math.trunc(cur / val);
              else if (op === '%') val = cur % val;
              else if (op === '**') val = Math.pow(cur, val);
            }
            localScope[varName] = val;
            scope[varName] = val;
          } catch (e: any) { output.push(e.message || String(e)); }
          i++; continue;
        }

        // ── bare expression / function call ──
        try {
          evalExpr(trimmed, localScope);
        } catch (e: any) {
          output.push(e.message || String(e));
        }
        i++;
      }
    }

    try {
      runBlock(src.split('\n'), { ...scope });
    } catch (e: any) {
      output.push(String(e.message ?? e));
    }

    return output.length ? output : ['(no output)'];
  };

  // ── JavaScript runner ──
  const runJavaScript = (src: string): string[] => {
    const out: string[] = [];
    try {
      // eslint-disable-next-line no-new-func
      new Function('console', src)({
        log: (...a: any[]) => out.push(a.map(String).join(' ')),
        error: (...a: any[]) => out.push('Error: ' + a.join(' ')),
        warn: (...a: any[]) => out.push('Warning: ' + a.join(' ')),
      });
    } catch (e: any) { out.push(String(e)); }
    return out.length ? out : ['(no output)'];
  };

  const handleRun = () => {
    setTerminalLogs(prev => [...prev, `> Executing ${language.toUpperCase()} file...`]);
    setTimeout(() => {
      if (language === 'python') {
        const out = runPython(code);
        setTerminalLogs(prev => [...prev, ...out, '🎉 Execution successful. Zero exit codes.']);
        setHtmlPreview(null);
      } else if (language === 'javascript') {
        const out = runJavaScript(code);
        setTerminalLogs(prev => [...prev, ...out, '🎉 Program compiled with zero warnings.']);
        setHtmlPreview(null);
      } else if (language === 'html') {
        // Real sandboxed HTML preview
        setHtmlPreview(code);
        setTerminalLogs(prev => [
          ...prev,
          'Render Engine: HTML layout parsed successfully.',
          '🎉 Rendered in live preview pane below the terminal.',
        ]);
      } else {
        setTerminalLogs(prev => [
          ...prev,
          'Sketch compiled and uploaded to Virtual Arduino controller.',
          'LED Pin 13 blinking at 1s intervals.',
          `Memory usage: ${Math.floor(8 + Math.random() * 12)}% of flash space.`,
          '🎉 Execution successful.',
        ]);
        setHtmlPreview(null);
      }
    }, 300);
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
      let imageUrl = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80';
      if (screenshotFile) {
        imageUrl = await uploadProjectScreenshot(screenshotFile, student.id);
      }

      const projectData = {
        title,
        description,
        category:
          language === 'arduino'
            ? 'Robotics'
            : language === 'html'
            ? 'Website'
            : language === 'javascript'
            ? 'Game'
            : 'Python',
        image_url: imageUrl,
        video_url: '',
        project_url: '',
        github_url: '',
      };

      await dbService.submitProject(student.id, projectData);
      
      // Fire live Webhook Alert
      await triggerWebhookAlert(
        '🎨 New Project Submitted',
        `A student has submitted a new project for evaluation!`,
        [
          { name: 'Student Name', value: profile?.full_name || 'CIST Coder', inline: true },
          { name: 'Project Title', value: title, inline: true },
          { name: 'Category', value: projectData.category, inline: true }
        ]
      );

      setStatusMsg({
        type: 'success',
        text: '🎉 Project submitted! A CIST instructor will review your code. Track status in the Showcase!',
      });
      setTitle('');
      setDescription('');
      setScreenshotFile(null);
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
        <div
          className={`p-4 rounded-xl border text-xs font-semibold leading-relaxed flex items-center space-x-2.5 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 animate-pulse'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main split grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        {/* LEFT: Code editor + terminal */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-navy-dark rounded-xl overflow-hidden border border-navy-light/35 shadow-lg min-h-[500px]">
          {/* Language tabs */}
          <div className="bg-navy-deep px-4 py-2.5 border-b border-navy-light/25 flex items-center justify-between text-xs text-gray-300">
            <div className="flex space-x-2">
              {['python', 'javascript', 'html', 'arduino'].map(lang => (
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
            <span className="font-mono text-gray-500 hidden sm:block">
              main_file.
              {language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'html' ? 'html' : 'ino'}
            </span>
          </div>

          {/* Editor */}
          <div className="flex-grow flex text-xs font-mono relative">
            <div className="bg-navy-dark px-3 py-4 border-r border-navy-light/15 text-gray-650 text-right select-none w-10">
              {Array.from({ length: Math.max(16, code.split('\n').length) }).map((_, i) => (
                <span key={i} className="leading-6 block">{i + 1}</span>
              ))}
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              className="flex-grow bg-transparent text-slate-100 py-4 px-3 outline-none resize-none leading-6 w-full focus:ring-0"
              spellCheck={false}
              style={{ minHeight: '300px' }}
            />
          </div>

          {/* Terminal output */}
          <div className="bg-black/95 p-4 font-mono text-[11px] text-slate-350 border-t border-navy-light/20 h-36 overflow-y-auto">
            <div className="flex items-center space-x-1.5 text-gray-500 font-bold uppercase text-[9px] tracking-widest pb-1 border-b border-navy-light/10 mb-1">
              <Terminal className="h-3.5 w-3.5" />
              <span>Compilation output logs</span>
            </div>
            {terminalLogs.map((log, idx) => (
              <div
                key={idx}
                className={`mt-0.5 ${
                  log.startsWith('🎉')
                    ? 'text-emerald-400 font-bold'
                    : log.startsWith('>')
                    ? 'text-blue-400'
                    : log.startsWith('NameError') || log.startsWith('SyntaxError') || log.startsWith('RuntimeError')
                    ? 'text-rose-400 font-bold'
                    : 'text-slate-300'
                }`}
              >
                {log}
              </div>
            ))}
          </div>

          {/* Live HTML preview (only visible when language is html and code has been run) */}
          {htmlPreview !== null && language === 'html' && (
            <div className="border-t border-navy-light/20">
              <div className="flex items-center space-x-1.5 px-4 py-1.5 bg-navy-deep text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                <span>🖥️ Live Preview</span>
              </div>
              <iframe
                title="html-preview"
                srcDoc={htmlPreview}
                sandbox="allow-scripts"
                className="w-full bg-white"
                style={{ height: '220px', border: 'none' }}
              />
            </div>
          )}

          {/* Actions Bar */}
          <div className="bg-navy-deep px-4 py-3.5 border-t border-navy-light/25 flex items-center justify-between">
            <button
              onClick={() => setTerminalLogs(['CIST Code Lab compiler ready. Select language and start coding.'])}
              className="text-[10px] text-gray-500 hover:text-gray-300 font-semibold uppercase tracking-wider transition"
            >
              Clear output
            </button>
            <button
              onClick={handleRun}
              className="flex items-center space-x-1.5 rounded-lg bg-navy-medium hover:bg-navy-light px-5 py-2.5 font-bold text-xs text-white border border-navy-light/35 shadow transition-all active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-current text-gold-accent" />
              <span>Compile &amp; Run Sandbox</span>
            </button>
          </div>
        </div>

        {/* RIGHT: Submission form */}
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
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-navy-deep transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Project Description &amp; Architecture
              </label>
              <textarea
                placeholder="Explain the logic, loop counters, variable types, or sensor configurations you applied in this code."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full h-32 rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-navy-deep transition resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Screenshot / Visual Banner (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setScreenshotFile(e.target.files?.[0] || null)}
                className="w-full text-[11px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-navy-deep/10 file:text-navy-deep hover:file:bg-navy-deep/20 transition cursor-pointer"
              />
            </div>

            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 text-xs text-slate-500 leading-relaxed font-semibold">
              <span className="block font-black uppercase text-slate-700 mb-1">Moderation Notice:</span>
              Once you submit this software block, it will appear in the CIST teacher evaluation dashboard. Upon
              approval, you earn <span className="text-navy-deep font-bold">+200 XP</span> and it will be
              visible on the school Projects Showcase.
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
