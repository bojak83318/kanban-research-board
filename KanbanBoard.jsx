import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Upload,
  Star,
  GitBranch,
  Clock,
  ExternalLink,
  AlertCircle,
  Search,
  Layout,
  Tag
} from 'lucide-react';
import { parseCSV } from './csvParsing';

// --- Constants & Utilities ---

const COLORS = {
  Python: 'bg-blue-600',
  Rust: 'bg-orange-600',
  Go: 'bg-cyan-600',
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-500',
  Swift: 'bg-red-500',
  'C++': 'bg-pink-600',
  Shell: 'bg-gray-600',
  default: 'bg-slate-600'
};

const INITIAL_CSV = `Repo Name,URL,Stars,Days Since Update,Primary Language,Category,Brief Description
awesome-claude-skills,https://github.com/ComposioHQ/awesome-claude-skills,32666,2,Python,Skill Collection,"A curated list of awesome Claude Skills, resources, and tools for customizing Claude AI workflows"
ui-ux-pro-max-skill,https://github.com/nextlevelbuilder/ui-ux-pro-max-skill,29620,0,Python,Skill,An AI SKILL that provide design intelligence for building professional UI/UX multiple platforms
Antigravity-Manager,https://github.com/lbjlaq/Antigravity-Manager,22107,0,Rust,Account Manager,Professional Antigravity Account Manager & Switcher. One-click seamless account switching for Antigravity Tools.
planning-with-files,https://github.com/OthmanAdi/planning-with-files,13409,0,Python,Skill,Claude Code skill implementing Manus-style persistent markdown planning
CLIProxyAPI,https://github.com/router-for-me/CLIProxyAPI,9807,0,Go,API Proxy,"Wrap Gemini CLI, Antigravity, ChatGPT Codex, Claude Code as OpenAI/Gemini/Claude compatible API service"
antigravity-awesome-skills,https://github.com/sickn33/antigravity-awesome-skills,7931,0,Python,Skill Collection,The Ultimate Collection of 700+ Agentic Skills for Claude Code/Antigravity/Cursor
opencode-antigravity-auth,https://github.com/NoeFabris/opencode-antigravity-auth,7876,2,TypeScript,Auth Plugin,Enable Opencode to authenticate against Antigravity via OAuth for gemini-3-pro and claude-opus-4-5
awesome-agent-skills,https://github.com/VoltAgent/awesome-agent-skills,6445,0,N/A,Skill Collection,"Claude Code Skills and 300+ agent skills compatible with Codex, Antigravity, Gemini CLI, Cursor"
antigravity-kit,https://github.com/vudovn/antigravity-kit,4370,1,TypeScript,Dev Toolkit,Toolkit for Antigravity IDE developers
AIClient-2-API,https://github.com/justlovemaki/AIClient-2-API,3705,0,JavaScript,API Proxy,"Simulates Gemini CLI, Antigravity, Qwen Code, Kiro client requests as OpenAI compatible API"
gcli2api,https://github.com/su-kaka/gcli2api,3691,1,Python,API Proxy,Convert GeminiCLI and Antigravity to OpenAI/GEMINI/Claude API interface
quotio,https://github.com/nguyenphutrong/quotio,3458,2,Swift,Quota Manager,"macOS menu bar app unifying Claude, Gemini, OpenAI, Qwen, Antigravity with quota tracking"
OpenMemory,https://github.com/CaviraOSS/OpenMemory,3237,12,TypeScript,MCP Server,Local persistent memory store for LLM applications including Antigravity
vscode-antigravity-cockpit,https://github.com/jlcodes99/vscode-antigravity-cockpit,2720,0,TypeScript,VS Code Extension,VS Code extension for monitoring Google Antigravity AI quotas
antigravity-claude-proxy,https://github.com/badrisnarayanan/antigravity-claude-proxy,2656,0,JavaScript,API Proxy,Proxy exposing Antigravity claude/gemini models for use in Claude Code and OpenClaw
AntigravityQuotaWatcher,https://github.com/wusimpl/AntigravityQuotaWatcher,2088,10,TypeScript,Quota Monitor,Google Antigravity AI model quota monitoring plugin
sub2api,https://github.com/Wei-Shaw/sub2api,1527,0,Go,API Proxy,"Unified API service for Claude, OpenAI, Gemini, Antigravity subscriptions"
antigravity-proxy,https://github.com/yuaotian/antigravity-proxy,1446,4,C++,Proxy Tool,Transparent proxy injector for Antigravity. Force SOCKS5/HTTP proxy without TUN mode on Windows
oh-my-opencode-slim,https://github.com/alvinunreal/oh-my-opencode-slim,1347,1,TypeScript,Agent,Slimmed oh-my-opencode fork optimized for Antigravity integration
proxycast,https://github.com/aiclientproxy/proxycast,1204,0,Rust,Agent,Creative AI agent supporting Antigravity
agent-skills,https://github.com/tech-leads-club/agent-skills,1134,0,TypeScript,Skill Collection,"Reusable packaged instructions for Antigravity, Claude Code, Cursor, GitHub Copilot"
proxypal,https://github.com/heyhuynhgiabuu/proxypal,870,0,TypeScript,Desktop App,Desktop app wrapping CLIProxyAPI with clean UI for managing AI subscriptions
antigravity-workspace-template,https://github.com/study8677/antigravity-workspace-template,852,9,Python,Template,Ultimate starter kit for Antigravity IDE optimized for Gemini 3 and Deep Think mode
AntigravityManager,https://github.com/Draculabo/AntigravityManager,701,0,TypeScript,Account Manager,Electron-based application to manage accounts and processes for Antigravity
cockpit-tools,https://github.com/jlcodes99/cockpit-tools,363,0,TypeScript,Account Manager,"Universal AI IDE Account Manager supporting Antigravity, Codex, GitHub Copilot multi-account management"
open-antigravity,https://github.com/ishandutta2007/open-antigravity,228,0,JavaScript,Alternative,Opensource equivalent of Google's Antigravity
antigravity-ide,https://github.com/Dokhacgiakhoa/antigravity-ide,194,0,Python,CLI Tool,Google AntiGravity IDE for Vibe Coding CLI tool
CodeFreeMax,https://github.com/ssmDo/CodeFreeMax,145,0,Shell,API Proxy,"Convert Kiro, Antigravity, Warp, Orchids, Grok IDEs to OpenAI/Claude/Augment Code API format"`;

// --- Components ---

const RepoCard = ({ item, onDragStart }) => {
  const langColor = COLORS[item.language] || COLORS.default;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      className="bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-700 cursor-move hover:border-slate-500 transition-all group relative"
      data-testid={`repo-card-${item.id}`} // Added for E2E testing
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-slate-100 text-sm leading-tight pr-6 break-words" data-testid="card-title">
          {item.name}
        </h3>
        {item.isPriority && (
          <span className="absolute top-3 right-3 text-red-400" title="High Priority: Matches Proxy/Auth/Rotation" data-testid="priority-icon">
            <AlertCircle size={16} />
          </span>
        )}
      </div>

      <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
        {item.description}
      </p>

      <div className="flex flex-wrap gap-2 items-center text-xs text-slate-300">
        <span className={`px-2 py-0.5 rounded-full text-white font-medium ${langColor} bg-opacity-90`}>
          {item.language}
        </span>

        <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
          <Star size={10} className="text-yellow-400" />
          <span>{(item.stars / 1000).toFixed(1)}k</span>
        </div>

        <div className="flex items-center gap-1 text-slate-500" title="Days since update">
          <Clock size={10} />
          <span>{item.updated}d</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-700/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{item.category}</span>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-slate-700"
          title="Open Repository"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};

const Column = ({ title, id, items, onDrop, onDragOver, onDragStart, count }) => {
  return (
    <div
      className="flex-1 min-w-[300px] flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-800/50 overflow-hidden"
      onDrop={(e) => onDrop(e, id)}
      onDragOver={onDragOver}
      data-testid={`kanban-column-${id}`} // Added for E2E testing
    >
      <div className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10 flex justify-between items-center">
        <h2 className="font-bold text-slate-200 flex items-center gap-2">
          {title}
          <span
            className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full border border-slate-700"
            data-testid={`column-count-${id}`}
          >
            {count}
          </span>
        </h2>
        {id === 'todo' && (
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" title="High Priority Items First" />
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {items.map((item) => (
          <RepoCard key={item.id} item={item} onDragStart={onDragStart} />
        ))}
        {items.length === 0 && (
          <div className="h-24 border-2 border-dashed border-slate-800 rounded-lg flex items-center justify-center text-slate-600 text-sm">
            Drop items here
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  // State
  const [columns, setColumns] = useState({
    todo: [],
    inProgress: [],
    done: []
  });
  const [draggedItem, setDraggedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialization
  useEffect(() => {
    const items = parseCSV(INITIAL_CSV);
    setColumns(prev => ({ ...prev, todo: items }));
    setIsLoading(false);
  }, []);

  // --- Handlers ---

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Remove from all columns
    const newColumns = {
      todo: columns.todo.filter(i => i.id !== draggedItem.id),
      inProgress: columns.inProgress.filter(i => i.id !== draggedItem.id),
      done: columns.done.filter(i => i.id !== draggedItem.id),
    };

    // Add to target column (at top if priority, otherwise bottom)
    // Actually for Kanban, usually drop at bottom, but user wants to tackle priorities
    if (targetColId === 'todo' && draggedItem.isPriority) {
      newColumns[targetColId] = [draggedItem, ...newColumns[targetColId]];
    } else {
      newColumns[targetColId] = [...newColumns[targetColId], draggedItem];
    }

    setColumns(newColumns);
    setDraggedItem(null);
  };

  // --- Obsidian Integration ---

  const generateMarkdown = () => {
    const formatDate = new Date().toISOString().split('T')[0];
    let md = `# Antigravity Tool Research - ${formatDate}\n\n`;

    // Helper to render items
    const renderList = (items) => {
      if (!items.length) return '';
      return items.map(item => {
        const priorityTag = item.isPriority ? ' #priority/high' : '';
        const langTag = ` #lang/${item.language.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        const stars = `(⭐${(item.stars / 1000).toFixed(1)}k)`;
        return `- [ ] [${item.name}](${item.url}) - ${item.description} ${stars}${langTag}${priorityTag}`;
      }).join('\n');
    };

    md += `## To Explore\n${renderList(columns.todo)}\n\n`;
    md += `## In Progress\n${renderList(columns.inProgress)}\n\n`;
    md += `## Done\n${renderList(columns.done)}\n\n`;

    return md;
  };

  const handleExport = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'antigravity-board.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n');

      const newCols = { todo: [], inProgress: [], done: [] };
      let currentCol = null;

      lines.forEach(line => {
        const trimLine = line.trim();
        if (trimLine.startsWith('## To Explore')) currentCol = 'todo';
        else if (trimLine.startsWith('## In Progress')) currentCol = 'inProgress';
        else if (trimLine.startsWith('## Done')) currentCol = 'done';
        else if (currentCol && trimLine.startsWith('- [ ] [')) {
          // Parse Markdown Link: - [ ] [Name](Url) - Desc
          const match = trimLine.match(/\[(.*?)\]\((.*?)\)\s*-\s*(.*)/);
          if (match) {
            const name = match[1];
            const url = match[2];
            const rest = match[3]; // Description + tags

            // Extract metadata if possible, otherwise use reasonable defaults
            const isPriority = rest.includes('#priority/high');
            const description = rest.split('#')[0].trim(); // simple strip tags

            newCols[currentCol].push({
              id: `imported-${Math.random().toString(36).substr(2, 9)}`,
              name,
              url,
              description,
              stars: 0, // Metadata lost in basic markdown unless we serialize json into it
              updated: 0,
              language: 'N/A', // Would need smarter parsing to recover these
              category: 'Imported',
              isPriority
            });
          }
        }
      });

      if (confirm('This will replace your current board. Continue?')) {
        setColumns(newCols);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-white">
            <Layout className="text-blue-500" />
            Antigravity Research Board
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Managing proxies, rotation tools, and skills. <span className="text-red-400 font-medium">Red dots</span> indicate priority items.
          </p>
        </div>

        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 cursor-pointer text-sm font-medium transition-colors">
            <Upload size={16} className="text-slate-400" />
            Import Obsidian
            <input type="file" accept=".md" onChange={handleImport} className="hidden" />
          </label>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          >
            <Download size={16} />
            Export to Obsidian
          </button>
        </div>
      </header>

      {/* Board */}
      <main className="h-[calc(100vh-85px)] p-6 overflow-x-auto">
        <div className="flex gap-6 h-full min-w-max md:min-w-0">
          <Column
            title="To Explore"
            id="todo"
            items={columns.todo}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            count={columns.todo.length}
          />
          <Column
            title="In Progress"
            id="inProgress"
            items={columns.inProgress}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            count={columns.inProgress.length}
          />
          <Column
            title="Done"
            id="done"
            items={columns.done}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            count={columns.done.length}
          />
        </div>
      </main>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.8);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 1);
        }
      `}</style>
    </div>
  );
}
