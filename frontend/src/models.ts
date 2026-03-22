export interface ModelInfo {
  id: string;        // exact GitHub Models API id
  name: string;      // display name
  provider: string;
  color: string;
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  // OpenAI
  { id: 'gpt-4o',                       name: 'GPT-4o',             provider: 'OpenAI',    color: '#10b981' },
  { id: 'gpt-4o-mini',                  name: 'GPT-4o mini',        provider: 'OpenAI',    color: '#34d399' },
  { id: 'o1',                           name: 'o1',                 provider: 'OpenAI',    color: '#6ee7b7' },
  { id: 'o1-mini',                      name: 'o1-mini',            provider: 'OpenAI',    color: '#a7f3d0' },
  { id: 'o3-mini',                      name: 'o3-mini',            provider: 'OpenAI',    color: '#059669' },
  
  // Microsoft
  { id: 'phi-4',                        name: 'Phi-4',              provider: 'Microsoft', color: '#8b5cf6' },
  { id: 'phi-4-mini-instruct',          name: 'Phi-4 Mini',         provider: 'Microsoft', color: '#a78bfa' },
  { id: 'phi-4-reasoning',              name: 'Phi-4 Reasoning',    provider: 'Microsoft', color: '#c4b5fd' },

  // Meta
  { id: 'meta-llama-3.1-405b-instruct', name: 'Llama 3.1 405B',     provider: 'Meta',      color: '#ec4899' },
  { id: 'llama-3.3-70b-instruct',       name: 'Llama 3.3 70B',      provider: 'Meta',      color: '#db2777' },

  // Mistral
  { id: 'mistral-large-2411',           name: 'Mistral Large 2',    provider: 'Mistral',   color: '#f97316' },
  { id: 'codestral-2501',               name: 'Codestral 25.01',    provider: 'Mistral',   color: '#fb923c' },
  { id: 'mistral-small-2503',           name: 'Mistral Small',      provider: 'Mistral',   color: '#fdba74' },

  // DeepSeek
  { id: 'deepseek-v3-0324',             name: 'DeepSeek V3',        provider: 'DeepSeek',  color: '#06b6d4' },
  { id: 'deepseek-r1',                  name: 'DeepSeek R1',        provider: 'DeepSeek',  color: '#0891b2' },

  // xAI
  { id: 'grok-3',                       name: 'Grok-3',             provider: 'xAI',       color: '#ffffff' },
  { id: 'grok-3-mini',                  name: 'Grok-3 Mini',        provider: 'xAI',       color: '#e2e8f0' },

  // Cohere
  { id: 'cohere-command-r-plus-08-2024',name: 'Command R+',         provider: 'Cohere',    color: '#9333ea' },
  { id: 'cohere-command-r-08-2024',     name: 'Command R',          provider: 'Cohere',    color: '#a855f7' },
];

export const DEFAULT_MODELS = ['gpt-4o', 'deepseek-r1', 'phi-4', 'mistral-large-2411'];
