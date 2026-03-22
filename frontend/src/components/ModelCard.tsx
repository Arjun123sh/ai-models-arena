import React from 'react';
import { Activity, Hash, AlertTriangle, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ModelCardProps {
  modelName: string;
  modelId: string;
  providerColor: string;
  content: string;
  latency: number;
  tokens: number;
  isThinking: boolean;
  error?: string;
}

const ModelCard: React.FC<ModelCardProps> = ({
  modelName, providerColor, content, latency, tokens, isThinking, error
}) => {
  const hasResult = !isThinking && (content || error);

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Accent top bar */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${providerColor}, ${providerColor}44)` }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: providerColor + '20' }}>
            <Bot className="w-4 h-4" style={{ color: providerColor }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white/90 leading-none">{modelName}</h3>
            {isThinking && (
              <p className="text-[10px] text-white/40 mt-0.5 animate-pulse">Thinking...</p>
            )}
          </div>
        </div>

        {isThinking && (
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: providerColor,
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-4 overflow-y-auto min-h-[240px] max-h-[380px] scrollbar-thin">
        {isThinking ? (
          <div className="space-y-3 pt-2">
            <div className="skeleton h-3.5 w-3/4" />
            <div className="skeleton h-3.5 w-full" />
            <div className="skeleton h-3.5 w-5/6" />
            <div className="skeleton h-3.5 w-2/3" />
            <div className="skeleton h-3.5 w-full" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 pt-6">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-red-400/80 text-xs text-center leading-relaxed max-w-[200px]">{error}</p>
          </div>
        ) : content ? (
          <div className="markdown-content prose prose-invert prose-sm max-w-none text-white/75 text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-white/15 text-sm italic">
            Awaiting prompt
          </div>
        )}
      </div>

      {/* Footer stats */}
      {hasResult && !error && (
        <div className="flex items-center gap-4 px-5 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Activity className="w-3 h-3" />
            <span>{latency > 0 ? <span style={{ color: providerColor }}>{latency}ms</span> : '--'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Hash className="w-3 h-3" />
            <span>{tokens > 0 ? <span style={{ color: providerColor }}>{tokens} tok</span> : '--'}</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .markdown-content pre {
          background: rgba(0,0,0,0.3) !important;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 12px !important;
          margin: 12px 0 !important;
          overflow-x: auto;
        }
        .markdown-content code {
          background: rgba(255,255,255,0.05);
          padding: 2px 4px;
          border-radius: 4px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }
        .markdown-content p { margin-bottom: 8px; }
        .markdown-content ul, .markdown-content ol { margin-left: 20px; margin-bottom: 8px; }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 { 
          color: white; 
          font-weight: 700; 
          margin-top: 16px; 
          margin-bottom: 8px; 
        }
      `}</style>
    </div>
  );
};

export default ModelCard;
