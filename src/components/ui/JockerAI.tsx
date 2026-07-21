// src/components/ui/JockerAI.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, Sparkles, HelpCircle, Flame, ShieldAlert } from 'lucide-react';

interface Message {
  sender: 'jocker' | 'student';
  text: string;
}

const JOKES = [
  "Why do programmers wear glasses? Because they can't C#! HAHAHAHA!",
  "There are 10 types of people in the world: those who understand binary, and those who don't! HAHAHA!",
  "What is a programmer's favorite hangout place? Foo Bar! HAHAHA!",
  "Why did the computer go to the hospital? Because it had a virus! HAHAHA!",
  "Why do programmers prefer dark mode? Because light attracts bugs! HAHAHA!"
];

const RIDDLES = [
  "I have no eyes, but I see all statements. I have no mouth, but I tell you when your code is broken. What am I? (Hint: The Compiler! HAHAHA!)",
  "I repeat myself until I am exhausted, or until a condition makes me stop. If you are not careful, I will run forever! What am I? (Hint: A Loop! HAHAHA!)",
  "I hold values, strings, or booleans. I have a name, but my value can change anytime. What am I? (Hint: A Variable! HAHAHA!)"
];

export default function JockerAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const pathname = usePathname();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Floating button Drag & Move handlers
  const [position, setPosition] = useState({ right: 24, bottom: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, startRight: 24, startBottom: 24, hasMoved: false });

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startRight: position.right,
      startBottom: position.bottom,
      hasMoved: false
    };
    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    const touch = e.touches[0];
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startRight: position.right,
      startBottom: position.bottom,
      hasMoved: false
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.hasMoved = true;
      }
      const newRight = Math.max(12, Math.min(window.innerWidth - 70, dragRef.current.startRight - dx));
      const newBottom = Math.max(12, Math.min(window.innerHeight - 70, dragRef.current.startBottom - dy));
      setPosition({ right: newRight, bottom: newBottom });
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const dx = touch.clientX - dragRef.current.startX;
      const dy = touch.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.hasMoved = true;
      }
      const newRight = Math.max(12, Math.min(window.innerWidth - 70, dragRef.current.startRight - dx));
      const newBottom = Math.max(12, Math.min(window.innerHeight - 70, dragRef.current.startBottom - dy));
      setPosition({ right: newRight, bottom: newBottom });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const handleButtonClick = () => {
    if (!dragRef.current.hasMoved) {
      setIsOpen(!isOpen);
    }
  };

  // Initial greeting based on page context
  useEffect(() => {
    let greeting = "HAHAHA! Welcome to CIST CodeQuest, human friend! I'm JOCKER, your crazy coding companion! Ask me anything, or let me tell you a joke!";
    
    if (pathname.includes('/robotics-lab')) {
      greeting = "Oho! You are in the ROBOTICS LAB! Keep those virtual microcontrollers active! Don't let the robot escape and take over the CIST library! Need some coding sequences advice? Ask JOCKER! HAHAHA!";
    } else if (pathname.includes('/games')) {
      greeting = "GAMES ZONE! My favorite! Ready to guide the virtual robot to the target star or squash some syntax bugs? Click those level buttons, and let's go! HAHAHA!";
    } else if (pathname.includes('/community')) {
      greeting = "COMMUNITY CHAT! This looks just like Discord! Are you helping your classmates squash bugs? That is what real CIST heroes do! HAHAHA!";
    } else if (pathname.includes('/missions')) {
      greeting = "MISSION BOARD! Climb those levels, gain XP, and earn coins! What pathway are you learning today? Python? Logic? AI? JOCKER is ready to assist! HAHAHA!";
    }

    setMessages([
      { sender: 'jocker', text: greeting }
    ]);
  }, [pathname]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateJockerResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    if (q.includes('joke')) {
      const idx = Math.floor(Math.random() * JOKES.length);
      return `HAHAHA! Here is a chaotic one: ${JOKES[idx]}`;
    }
    
    if (q.includes('riddle')) {
      const idx = Math.floor(Math.random() * RIDDLES.length);
      return `A RIDDLE! Solve this, junior coder: ${RIDDLES[idx]}`;
    }

    if (q.includes('loop')) {
      return "A loop! The snake that eats its own tail! In Python, 'for i in range(5):' repeats 5 times! Just don't write a loop without an end or the CIST servers will catch fire! HAHAHA!";
    }

    if (q.includes('python')) {
      return "PY-THOOOOON! The code snake! Indentation is law! One space off, and BOOM! IndentationError! Always use 4 spaces for your loops and functions! HAHAHA!";
    }

    if (q.includes('variable')) {
      return "Variables! Magic boxes! Declare them like 'score = 100'. Give them good names, not 'x', 'y', 'z', or Jocker will mix them up! HAHAHA!";
    }

    if (q.includes('error') || q.includes('help') || q.includes('stuck')) {
      return "STUCK? HAHAHA! Syntax bugs are just flavor text! Look at your colons, check your indentations, or click the code template button! You can do it, human friend!";
    }

    if (q.includes('robot') || q.includes('maze')) {
      return "Lego robot maze! Use 'moveForward()', 'turnRight()', and 'turnLeft()'! Write functions to repeat patterns so you don't type a thousand lines! HAHAHA!";
    }

    if (q.includes('jocker') || q.includes('who are you')) {
      return "I'm JOCKER! The crazy coding clown! The jester of javascript, the compiler-crasher of CIST! I'm here to make coding fun and slightly chaotic! HAHAHA!";
    }

    // Default responses
    const defaults = [
      "Fascinating query, carbon-based life form! But can you translate that to binary? HAHAHA!",
      "My chaotic crystal ball says your syntax looks highly promising! Run it! HAHAHA!",
      "Keep pushing those keys! Every syntax error is just one step closer to CIST elite standing! HAHAHA!",
      "Code, sleep, repeat! That is the CIST CodeQuest code of conduct! HAHAHA!",
      "HAHAHA! Let's write some loops and make the compiler dizzy!"
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    const nextMessages = [...messages, { sender: 'student' as const, text: userText }];
    setMessages(nextMessages);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.slice(-12).map((message) => ({
            role: message.sender === 'student' ? 'user' : 'assistant',
            content: message.text
          }))
        })
      });

      if (!response.ok) throw new Error('AI chat unavailable');
      const data = await response.json() as { reply?: string };
      if (!data.reply) throw new Error('Empty AI response');

      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'jocker', text: data.reply as string }]);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'jocker', text: generateJockerResponse(userText) }]);
    }
  };

  return (
    <div 
      className="fixed z-[55] flex flex-col items-end"
      style={{
        right: `${position.right}px`,
        bottom: `${position.bottom}px`,
        transition: isDragging ? 'none' : 'right 0.2s ease, bottom 0.2s ease'
      }}
    >
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="w-80 h-96 bg-navy-medium border border-navy-light/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-slide-up text-white">
          {/* Header */}
          <div className="bg-navy-deep px-4 py-3 border-b border-navy-light/25 flex items-center justify-between shadow">
            <div className="flex items-center space-x-2">
              <img 
                src="/jocker_mascot.png" 
                alt="Jocker" 
                className="h-6 w-6 rounded-full object-cover bg-white border border-gold-accent/20" 
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://api.dicebear.com/7.x/pixel-art/svg?seed=jocker';
                }}
              />
              <div>
                <h4 className="font-extrabold text-xs text-slate-100 flex items-center space-x-1">
                  <span>Jocker</span>
                  <Sparkles className="h-3 w-3 text-gold-accent animate-pulse" />
                </h4>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block leading-none">Chaotic Buddy</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-450 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin bg-navy-dark/45">
            {messages.map((m, idx) => (
              <div 
                key={idx}
                className={`flex items-start space-x-2.5 max-w-[85%] ${
                  m.sender === 'student' ? 'ml-auto flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 border overflow-hidden ${
                  m.sender === 'jocker' ? 'bg-gold-accent/15 border-gold-accent/25' : 'bg-maple-red/25 border-maple-red/35'
                }`}>
                  {m.sender === 'jocker' ? (
                    <img 
                      src="/jocker_mascot.png" 
                      alt="Jocker" 
                      className="h-full w-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://api.dicebear.com/7.x/pixel-art/svg?seed=jocker';
                      }}
                    />
                  ) : (
                    <span className="text-xs">👤</span>
                  )}
                </div>
                <div className={`p-2.5 rounded-xl text-xs font-semibold leading-relaxed ${
                  m.sender === 'jocker' 
                    ? 'bg-navy-light/20 text-slate-200 border border-navy-light/10 rounded-tl-none' 
                    : 'bg-maple-red text-white rounded-tr-none shadow-md'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start space-x-2.5 max-w-[85%]">
                <div className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 border overflow-hidden bg-gold-accent/15 border-gold-accent/25">
                  <img 
                    src="/jocker_mascot.png" 
                    alt="Jocker" 
                    className="h-full w-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://api.dicebear.com/7.x/pixel-art/svg?seed=jocker';
                    }}
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-navy-light/20 border border-navy-light/10 text-xs font-bold text-gold-accent animate-pulse">
                  Jocker is laughing...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-2.5 border-t border-navy-light/25 bg-navy-deep flex space-x-2 items-center">
            <input
              type="text"
              placeholder="Ask 'joke', 'riddle', or coding help..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-xl bg-navy-dark border border-navy-light/20 py-2 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-accent transition"
              required
            />
            <button 
              type="submit"
              className="h-[34px] w-[34px] rounded-xl bg-gold-accent hover:bg-gold-light text-navy-dark flex items-center justify-center transition active:scale-90 shadow"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* FLOAT COMPANION ACTION TRIGGER */}
      <button
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleButtonClick}
        className="h-14 w-14 rounded-full bg-navy-deep border-2 border-gold-accent shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative group animate-bounce cursor-grab active:cursor-grabbing select-none"
        style={{ animationDuration: '4s' }}
        title="Jocker AI Companion"
      >
        <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-25"></span>
        <img 
          src="/jocker_mascot.png" 
          alt="Jocker Companion" 
          className="h-9 w-9 object-contain" 
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://api.dicebear.com/7.x/pixel-art/svg?seed=jocker';
          }}
        />
      </button>

    </div>
  );
}
