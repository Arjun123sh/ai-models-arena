import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import ModelCard from './components/ModelCard';
import { AVAILABLE_MODELS, DEFAULT_MODELS } from './models';

interface ComparisonResult {
  model_name: string;
  content: string;
  latency: number;
  tokens: number;
  error?: string;
}

const BACKEND = 'http://localhost:8000';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('github_token'));
  const [session, setSession] = useState<any>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>(DEFAULT_MODELS);
  const [results, setResults] = useState<ComparisonResult[]>([]);

  // Sync results placeholders whenever model selection changes
  useEffect(() => {
    setResults(prev => {
      const existingMap = new Map(prev.map(r => [r.model_name, r]));
      return selectedModels.map(id => existingMap.get(id) ?? { model_name: id, content: '', latency: 0, tokens: 0 });
    });
  }, [selectedModels]);

  // Grab token from URL after OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('github_token', urlToken);
      setToken(urlToken);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Build session from token
  useEffect(() => {
    if (token) {
      // Fetch the GitHub user's info
      fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(user => {
          if (user) {
            setSession({ user: { name: user.login, image: user.avatar_url }, accessToken: token });
          } else {
            setSession({ user: { name: 'GitHub User', image: null }, accessToken: token });
          }
        })
        .catch(() => setSession({ user: { name: 'GitHub User', image: null }, accessToken: token }));
    } else {
      setSession(null);
    }
  }, [token]);

  const handleLogin = () => { window.location.href = `${BACKEND}/login/github`; };
  const handleLogout = () => { localStorage.removeItem('github_token'); setToken(null); };

  const handleCompare = async () => {
    if (!prompt.trim() || !token) return;
    setLoading(true);
    // Optimistically reset content
    setResults(selectedModels.map(id => ({ model_name: id, content: '', latency: 0, tokens: 0 })));

    try {
      const { data } = await axios.post<ComparisonResult[]>(
        `${BACKEND}/compare`,
        { user_prompt: prompt, models: selectedModels },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setResults(data);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Request failed';
      setResults(selectedModels.map(id => ({ model_name: id, content: '', latency: 0, tokens: 0, error: msg })));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%]  w-[600px] h-[600px] rounded-full blur-[140px] bg-cyan-700/15   animate-drift" />
        <div className="absolute bottom-[5%]  right-[3%] w-[700px] h-[700px] rounded-full blur-[160px] bg-indigo-700/15 animate-drift-slow" />
        <div className="absolute top-[50%] left-[40%] w-[400px] h-[400px] rounded-full blur-[120px] bg-violet-700/10 animate-drift" />
      </div>

      {/* Header */}
      <Header
        prompt={prompt} setPrompt={setPrompt}
        onCompare={handleCompare} loading={loading}
        session={session} onLogin={handleLogin} onLogout={handleLogout}
        selectedModels={selectedModels} setSelectedModels={setSelectedModels}
      />

      {/* Card grid — pushed below the floating header */}
      <div className="relative z-10 pt-28 pb-16 px-4 max-w-7xl mx-auto">
        {selectedModels.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-white/20">
            <p className="text-lg">Select at least one model to get started</p>
          </div>
        ) : (
          <div className={`grid gap-5 ${
            selectedModels.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' :
            selectedModels.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto' :
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {results.map(res => {
              const info = AVAILABLE_MODELS.find(m => m.id === res.model_name);
              return (
                <ModelCard
                  key={res.model_name}
                  modelId={res.model_name}
                  modelName={info?.name ?? res.model_name}
                  providerColor={info?.color ?? '#6366f1'}
                  content={res.content}
                  latency={res.latency}
                  tokens={res.tokens}
                  isThinking={loading}
                  error={res.error}
                />
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && results.length > 0 && results.every(r => !r.content && !r.error) && (
          <p className="text-center text-white/20 text-sm mt-12">
            Type a prompt above and press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/40 text-xs font-mono">Enter</kbd> or <strong>Run ↵</strong>
          </p>
        )}
      </div>
    </main>
  );
}
