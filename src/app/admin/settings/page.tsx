// src/app/admin/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Shield, Sliders, AlertCircle, Save, BellRing, Play } from 'lucide-react';
import { triggerWebhookAlert } from '@/utils/webhook';

export default function AdminSettingsPage() {
  const [levelMultiplier, setLevelMultiplier] = useState(1.5);
  const [wordBlacklist, setWordBlacklist] = useState('badword1, badword2, spam, cheat, exploit');
  const [allowSubmission, setAllowSubmission] = useState(true);
  const [moderationEnabled, setModerationEnabled] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<string[]>([]);
  
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const settingsRaw = localStorage.getItem('cist_cq_settings');
    const logsRaw = localStorage.getItem('cist_cq_webhook_logs');
    
    setTimeout(() => {
      if (settingsRaw) {
        try {
          const parsed = JSON.parse(settingsRaw);
          setLevelMultiplier(parsed.levelMultiplier ?? 1.5);
          setWordBlacklist(parsed.wordBlacklist ?? 'badword1, badword2, spam, cheat, exploit');
          setAllowSubmission(parsed.allowSubmission ?? true);
          setModerationEnabled(parsed.moderationEnabled ?? true);
          setWebhookUrl(parsed.webhookUrl ?? '');
          setWebhookEnabled(parsed.webhookEnabled ?? false);
        } catch {}
      }
      if (logsRaw) {
        try {
          setWebhookLogs(JSON.parse(logsRaw));
        } catch {}
      }
    }, 0);
  }, []);

  const loadLogs = () => {
    if (typeof window === 'undefined') return;
    const logsRaw = localStorage.getItem('cist_cq_webhook_logs');
    if (logsRaw) {
      try {
        setWebhookLogs(JSON.parse(logsRaw));
      } catch {}
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const settingsObj = {
      levelMultiplier,
      wordBlacklist,
      allowSubmission,
      moderationEnabled,
      webhookUrl,
      webhookEnabled
    };

    setTimeout(() => {
      localStorage.setItem('cist_cq_settings', JSON.stringify(settingsObj));
      setLoading(false);
      setMsg('🎉 Success! Platform configurations updated successfully.');
      setTimeout(() => setMsg(''), 4000);
    }, 800);
  };

  const handleSendTest = async () => {
    // Save settings first so the utility gets the latest values
    const settingsObj = {
      levelMultiplier,
      wordBlacklist,
      allowSubmission,
      moderationEnabled,
      webhookUrl,
      webhookEnabled
    };
    localStorage.setItem('cist_cq_settings', JSON.stringify(settingsObj));

    setMsg('🧪 Sending test webhook alert...');
    await triggerWebhookAlert(
      '🧪 Webhook Connection Test',
      'This is a manual configuration test alert sent from the CIST CodeQuest control deck.',
      [
        { name: 'Environment', value: 'Mock Local Sandbox', inline: true },
        { name: 'Dispatched By', value: 'System Admin', inline: true }
      ]
    );
    setMsg('🎉 Success! Test webhook connection executed.');
    loadLogs();
    setTimeout(() => setMsg(''), 4000);
  };

  return (
    <div className="space-y-6 text-xs font-semibold text-slate-700">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
          <Settings className="h-6 w-6 text-navy-deep" />
          <span>System Settings & Safety</span>
        </h2>
        <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
          Configure security blacklists, adjust gamified XP scales, and toggle portal visibility
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-xl border border-emerald-250 bg-emerald-50 text-xs text-emerald-850 font-bold flex items-center space-x-2.5 animate-pulse">
          <AlertCircle className="h-5 w-5" />
          <span>{msg}</span>
        </div>
      )}

      {/* Settings Options form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2 items-start">
          
          {/* Box 1: Platform safety configuration */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-black text-sm uppercase text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Shield className="h-4.5 w-4.5 text-maple-red" />
              <span>Classroom Safety & Moderation</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Profanity Keyword Blacklist (Comma separated)</label>
                <textarea
                  value={wordBlacklist}
                  onChange={(e) => setWordBlacklist(e.target.value)}
                  className="w-full h-20 rounded-lg border border-slate-250 bg-slate-50 p-2.5 text-xs text-slate-850 resize-none font-mono"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2.5 text-slate-700 font-bold">
                  <input
                    type="checkbox"
                    checked={moderationEnabled}
                    onChange={(e) => setModerationEnabled(e.target.checked)}
                    className="rounded border-slate-350 text-navy-deep focus:ring-0"
                  />
                  <span>Mandatory post & project approval reviews (Recommended)</span>
                </label>
                <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed pl-6">
                  When active, all student community forum messages and showcase items start in pending status.
                </p>
              </div>
            </div>
          </div>

          {/* Box 2: Gamification configurations */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-black text-sm uppercase text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Sliders className="h-4.5 w-4.5 text-gold-accent" />
              <span>Gamification & XP Mechanics</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">XP Level-up scale multiplier ({levelMultiplier}x)</label>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={levelMultiplier}
                  onChange={(e) => setLevelMultiplier(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-navy-deep"
                />
                <div className="flex justify-between text-[10px] text-slate-450 mt-1 font-bold">
                  <span>1.0x (Fast level up)</span>
                  <span>2.5x (Slow level up)</span>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2.5 text-slate-700 font-bold">
                  <input
                    type="checkbox"
                    checked={allowSubmission}
                    onChange={(e) => setAllowSubmission(e.target.checked)}
                    className="rounded border-slate-350 text-navy-deep focus:ring-0"
                  />
                  <span>Allow project submissions during weekends</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Box 3: Webhook Integrations */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-black text-sm uppercase text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <BellRing className="h-4.5 w-4.5 text-navy-medium animate-pulse" />
            <span>Discord / Slack Webhook Integration</span>
          </h3>

          <div className="grid gap-6 md:grid-cols-2 items-start">
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2.5 text-slate-700 font-bold">
                  <input
                    type="checkbox"
                    checked={webhookEnabled}
                    onChange={(e) => setWebhookEnabled(e.target.checked)}
                    className="rounded border-slate-350 text-navy-deep focus:ring-0"
                  />
                  <span>Enable Real-time Webhook Alerts</span>
                </label>
                <p className="text-[10px] text-slate-400 mt-1 font-medium pl-6">
                  Fires Discord webhook events when students upload showcase items or request leaderboard entries.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Webhook Endpoint URL</label>
                <input
                  type="text"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-250 bg-slate-50 p-2.5 text-xs text-slate-850 font-mono"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleSendTest}
                  className="flex items-center space-x-1.5 rounded-lg border border-navy-light text-navy-light hover:bg-navy-light/10 px-4 py-2.5 font-bold transition active:scale-95 text-xs cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Test Connection</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-1.5 rounded-lg bg-navy-deep hover:bg-maple-red px-5 py-2.5 text-xs font-bold text-white shadow transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>

            {/* Webhook Logs */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-450 uppercase">Recent Webhook Execution Logs</label>
              <div className="h-36 overflow-y-auto border border-slate-200 bg-slate-50 rounded-lg p-2.5 font-mono text-[9px] text-slate-500 space-y-1.5">
                {webhookLogs.length === 0 ? (
                  <p className="italic text-slate-400">No recent events logged.</p>
                ) : (
                  webhookLogs.map((log, idx) => (
                    <div key={idx} className="border-b border-slate-100 pb-1 leading-relaxed">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
