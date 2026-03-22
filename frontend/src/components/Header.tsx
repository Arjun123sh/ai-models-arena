import React, { useState, useRef, useEffect } from 'react';
import { Github, LogOut, ChevronDown, Check, Layers, Zap } from 'lucide-react';
import { AVAILABLE_MODELS } from '../models';

interface HeaderProps {
  prompt: string;
  setPrompt: (v: string) => void;
  onCompare: () => void;
  loading: boolean;
  session: any;
  onLogin: () => void;
  onLogout: () => void;
  selectedModels: string[];
  setSelectedModels: (m: string[]) => void;
}

// Group models by provider
const grouped = AVAILABLE_MODELS.reduce<Record<string, typeof AVAILABLE_MODELS>>((acc, m) => {
  if (!acc[m.provider]) acc[m.provider] = [];
  acc[m.provider].push(m);
  return acc;
}, {});

const Header: React.FC<HeaderProps> = ({
  prompt, setPrompt, onCompare, loading, session, onLogin, onLogout,
  selectedModels, setSelectedModels,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id: string) => {
    if (selectedModels.includes(id)) {
      if (selectedModels.length > 1) setSelectedModels(selectedModels.filter(m => m !== id));
    } else {
      setSelectedModels([...selectedModels, id]);
    }
  };

  const canRun = !loading && !!prompt.trim() && !!session;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div className="max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="glass rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-cyan-500 to-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:block text-sm font-bold text-white/70 tracking-tight">AI Arena</span>
          </div>

          <div className="w-px h-5 bg-white/10 shrink-0" />

          {/* Model selector */}
          <div className="relative shrink-0" ref={ref}>
            <button
              onClick={() => setOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-semibold text-white/80 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedModels.length} models</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform text-white/40 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute top-full left-0 mt-2 w-72 glass rounded-xl shadow-2xl p-3 overflow-hidden" style={{ zIndex: 100 }}>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {Object.entries(grouped).map(([provider, models]) => (
                    <div key={provider}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2 mb-1">{provider}</p>
                      {models.map(m => {
                        const on = selectedModels.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            onClick={() => toggle(m.id)}
                            className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color }} />
                              <span className={`text-sm font-medium transition-colors ${on ? 'text-white' : 'text-white/60'}`}>{m.name}</span>
                            </div>
                            {on && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: m.color }} />}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search input */}
          <input
            type="text"
            placeholder="Ask anything to compare across models..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canRun && onCompare()}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-white placeholder-white/25 text-sm py-1"
          />

          {/* Auth */}
          {!session ? (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white/80 transition-all cursor-pointer shrink-0"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:block">Sign in</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white">
                {session.user?.name?.charAt(0)?.toUpperCase() || 'G'}
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Run button */}
          <button
            onClick={onCompare}
            disabled={!canRun}
            className={`shrink-0 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              canRun
                ? 'bg-linear-to-r from-cyan-500 to-indigo-600 text-white hover:brightness-110 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] active:scale-95 cursor-pointer'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            {loading ? <div className="spinner" /> : 'Run ↵'}
          </button>
        </div>

        {/* Active models strip */}
        {selectedModels.length > 0 && (
          <div className="flex items-center gap-2 mt-2 px-2 overflow-x-auto pb-1">
            {selectedModels.map(id => {
              const m = AVAILABLE_MODELS.find(x => x.id === id);
              if (!m) return null;
              return (
                <button
                  key={id}
                  onClick={() => toggle(id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-all hover:opacity-70"
                  style={{ borderColor: m.color + '50', color: m.color, background: m.color + '15' }}
                >
                  <span>{m.name}</span>
                  <span className="opacity-50">×</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
