import React, { useEffect, useState, useRef } from 'react';
import { MessageSquareIcon, FileTextIcon, InfoIcon, ArrowUpIcon, ArrowDownIcon, RefreshCwIcon, KeyboardIcon } from 'lucide-react';
export function App() {
  // State for entries
  const [entries, setEntries] = useState<Entry[]>([]);
  // State for current mode (chat or edit)
  const [mode, setMode] = useState<'chat' | 'edit'>('chat');
  // State for input in chat mode
  const [input, setInput] = useState('');
  // State for selected entry index
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number | null>(null);
  // State for showing details
  const [showDetails, setShowDetails] = useState(false);
  // State for showing keyboard shortcuts
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  // Ref for input element
  const inputRef = useRef<HTMLInputElement>(null);
  // Ref for app container
  const appRef = useRef<HTMLDivElement>(null);
  // Entry interface
  interface Entry {
    id: string;
    content: string;
    type: string;
    timestamp: Date;
    updatedAt?: Date;
    indent: number;
    parentId?: string;
  }
  // Parse entry input to extract type and content
  const parseEntryInput = (input: string): {
    type: string;
    content: string;
  } => {
    const match = input.match(/^(\w+)::(.*)$/);
    if (match) {
      return {
        type: match[1],
        content: match[2].trim()
      };
    }
    return {
      type: 'log',
      content: input
    };
  };
  // Add new entry
  const addEntry = () => {
    if (!input.trim()) return;
    const {
      type,
      content
    } = parseEntryInput(input);
    const newEntry: Entry = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: new Date(),
      indent: selectedEntryIndex !== null ? entries[selectedEntryIndex].indent // Use the same indent level as the selected entry
      : 0,
      parentId: selectedEntryIndex !== null ? entries[selectedEntryIndex].id : undefined
    };
    // Insert after selected entry or at the end
    if (selectedEntryIndex !== null) {
      const newEntries = [...entries];
      newEntries.splice(selectedEntryIndex + 1, 0, newEntry);
      setEntries(newEntries);
      setSelectedEntryIndex(selectedEntryIndex + 1);
    } else {
      setEntries([...entries, newEntry]);
      setSelectedEntryIndex(entries.length);
    }
    setInput('');
  };
  // Handle key down events for input
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl+E to toggle mode
    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault();
      setMode(mode === 'chat' ? 'edit' : 'chat');
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      addEntry();
    } else if (e.key === 'Escape') {
      setSelectedEntryIndex(null);
      setInput('');
    } else if (e.altKey) {
      if (e.key === 'ArrowUp' && entries.length > 0) {
        e.preventDefault();
        setSelectedEntryIndex(prev => prev === null ? entries.length - 1 : Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown' && entries.length > 0) {
        e.preventDefault();
        setSelectedEntryIndex(prev => prev === null ? 0 : Math.min(entries.length - 1, prev + 1));
      }
    } else if (e.key === 'Tab' && selectedEntryIndex !== null) {
      // Handle Tab for indentation
      e.preventDefault();
      const newEntries = [...entries];
      const entry = newEntries[selectedEntryIndex];
      if (e.shiftKey) {
        // Shift+Tab decreases indentation
        entry.indent = Math.max(0, entry.indent - 1);
      } else {
        // Tab increases indentation
        entry.indent = Math.min(6, entry.indent + 1);
      }
      setEntries(newEntries);
    }
  };
  // Global keyboard handler
  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    // Skip if we're in an input field
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
      return;
    }
    if (e.altKey) {
      if (e.key === 'ArrowUp' && entries.length > 0) {
        e.preventDefault();
        setSelectedEntryIndex(prev => prev === null ? entries.length - 1 : Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown' && entries.length > 0) {
        e.preventDefault();
        setSelectedEntryIndex(prev => prev === null ? 0 : Math.min(entries.length - 1, prev + 1));
      }
    } else if (e.ctrlKey && e.key === 'e') {
      e.preventDefault();
      setMode(mode === 'chat' ? 'edit' : 'chat');
    } else if (e.key === 'k' && e.ctrlKey) {
      e.preventDefault();
      setShowKeyboardShortcuts(!showKeyboardShortcuts);
    } else if (e.key === 'Tab' && selectedEntryIndex !== null) {
      // Handle Tab for indentation
      e.preventDefault();
      const newEntries = [...entries];
      const entry = newEntries[selectedEntryIndex];
      if (e.shiftKey) {
        // Shift+Tab decreases indentation
        entry.indent = Math.max(0, entry.indent - 1);
      } else {
        // Tab increases indentation
        entry.indent = Math.min(6, entry.indent + 1);
      }
      setEntries(newEntries);
    }
  };
  // Handle indentation
  const handleIndent = (index: number, increase: boolean) => {
    const newEntries = [...entries];
    const entry = newEntries[index];
    if (increase) {
      entry.indent = Math.min(6, entry.indent + 1);
    } else {
      entry.indent = Math.max(0, entry.indent - 1);
    }
    setEntries(newEntries);
  };
  // Format entry content with type information
  const formatEntryContent = (entry: Entry) => {
    if (showDetails) {
      return <div>
          <span className="text-terminal-green">{entry.type}::</span>{' '}
          {entry.content}
          <div className="text-xs text-terminal-gray mt-1">
            {entry.timestamp.toLocaleTimeString()} · ID:{' '}
            {entry.id.substring(0, 6)}
          </div>
        </div>;
    }
    return <div>
        {entry.type !== 'log' && <span className="text-terminal-green">{entry.type}::</span>}{' '}
        {entry.content}
      </div>;
  };
  // Focus input when switching to chat mode
  useEffect(() => {
    if (mode === 'chat' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);
  // Add global keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [entries, selectedEntryIndex, mode, showKeyboardShortcuts]);
  return <div ref={appRef} className="flex flex-col w-full min-h-screen bg-terminal-black text-terminal-white font-mono" tabIndex={0} onKeyDown={e => {
    // Add a direct keydown handler to the main container
    if (e.key === 'Tab' && selectedEntryIndex !== null) {
      e.preventDefault();
      const newEntries = [...entries];
      const entry = newEntries[selectedEntryIndex];
      if (e.shiftKey) {
        // Shift+Tab decreases indentation
        entry.indent = Math.max(0, entry.indent - 1);
      } else {
        // Tab increases indentation
        entry.indent = Math.min(6, entry.indent + 1);
      }
      setEntries(newEntries);
    }
  }}>
      {/* Header */}
      <header className="p-4 border-b border-terminal-border">
        <h1 className="text-4xl font-bold text-terminal-green">
          Hybrid
          <br />
          Notes
        </h1>
        <p className="text-terminal-gray mt-2">
          Chat mode for quick logging • <br />
          Edit mode for full control
        </p>
        {/* Mode toggle buttons */}
        <div className="flex mt-4 gap-2">
          <button className={`flex items-center gap-2 px-4 py-2 rounded ${mode === 'chat' ? 'bg-terminal-green text-terminal-black' : 'bg-terminal-green/20 text-terminal-white'}`} onClick={() => setMode('chat')}>
            <MessageSquareIcon size={18} />
            Log
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 rounded ${mode === 'edit' ? 'bg-terminal-green text-terminal-black' : 'bg-terminal-green/20 text-terminal-white'}`} onClick={() => setMode('edit')}>
            <FileTextIcon size={18} />
            Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded bg-terminal-gray/20 text-terminal-white" onClick={() => setShowDetails(!showDetails)}>
            <InfoIcon size={18} />
            Details
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded bg-terminal-gray/20 text-terminal-white" onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)} title="Show keyboard shortcuts (Ctrl+K)">
            <KeyboardIcon size={18} />
            Keys
          </button>
        </div>
      </header>
      {/* Keyboard shortcuts modal */}
      {showKeyboardShortcuts && <div className="fixed inset-0 bg-terminal-black/80 flex items-center justify-center z-50">
          <div className="bg-terminal-black border border-terminal-border rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold text-terminal-green mb-4">
              Keyboard Shortcuts
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-terminal-white">Alt + ↑</span>
                <span className="text-terminal-gray">
                  Select previous entry
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-white">Alt + ↓</span>
                <span className="text-terminal-gray">Select next entry</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-white">Tab</span>
                <span className="text-terminal-gray">
                  Indent selected entry
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-white">Shift + Tab</span>
                <span className="text-terminal-gray">
                  Outdent selected entry
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-white">Ctrl + E</span>
                <span className="text-terminal-gray">Toggle between modes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-white">Enter</span>
                <span className="text-terminal-gray">Add new entry</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-white">Esc</span>
                <span className="text-terminal-gray">
                  Clear selection & input
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-white">Ctrl + K</span>
                <span className="text-terminal-gray">
                  Show/hide this dialog
                </span>
              </div>
            </div>
            <button className="mt-6 w-full py-2 bg-terminal-green text-terminal-black rounded" onClick={() => setShowKeyboardShortcuts(false)}>
              Close
            </button>
          </div>
        </div>}
      {/* Main content */}
      <main className="flex-1 p-4">
        {/* Structured view */}
        <div className="bg-terminal-black/50 border border-terminal-border rounded-lg p-4 mb-4">
          <h2 className="text-2xl font-bold mb-4">Structured View</h2>
          {entries.length > 0 ? <div className="space-y-2">
              {entries.map((entry, index) => <div key={entry.id} className={`py-1 border-l-2 ${selectedEntryIndex === index ? 'border-terminal-green bg-terminal-green/10' : 'border-transparent'}`} style={{
            paddingLeft: `${entry.indent * 16}px`
          }} onClick={() => setSelectedEntryIndex(index)}>
                  {formatEntryContent(entry)}
                  {mode === 'edit' && selectedEntryIndex === index && <div className="flex gap-2 mt-1">
                      <button className="text-xs bg-terminal-gray/20 px-2 py-1 rounded" onClick={e => {
                e.stopPropagation();
                handleIndent(index, false);
              }}>
                        Unindent
                      </button>
                      <button className="text-xs bg-terminal-gray/20 px-2 py-1 rounded" onClick={e => {
                e.stopPropagation();
                handleIndent(index, true);
              }}>
                        Indent
                      </button>
                    </div>}
                </div>)}
            </div> : <p className="text-terminal-gray">
              No entries yet. Switch to Chat mode to start logging thoughts.
            </p>}
        </div>
        {/* Chat input */}
        {mode === 'chat' && <div className="flex items-center gap-2 bg-terminal-black/30 border border-terminal-border rounded-lg p-2">
            <span className="text-terminal-green">/</span>
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleInputKeyDown} placeholder="Type here... (use type:: for custom types)" className="flex-1 bg-transparent border-none outline-none text-terminal-white" />
            <div className="flex gap-2">
              <button className="text-terminal-gray hover:text-terminal-white" onClick={() => setSelectedEntryIndex(prev => prev === null ? 0 : Math.min(entries.length - 1, prev + 1))} title="Next entry (Alt+↓)">
                <ArrowDownIcon size={18} />
              </button>
              <button className="text-terminal-gray hover:text-terminal-white" onClick={() => setSelectedEntryIndex(prev => prev === null ? entries.length - 1 : Math.max(0, prev - 1))} title="Previous entry (Alt+↑)">
                <ArrowUpIcon size={18} />
              </button>
              <button className="text-terminal-gray hover:text-terminal-white" onClick={() => setInput('')} title="Clear input">
                <RefreshCwIcon size={18} />
              </button>
            </div>
          </div>}
      </main>
      {/* Status bar */}
      <footer className="p-2 border-t border-terminal-border text-xs text-terminal-gray flex justify-between">
        <div>Mode: {mode.toUpperCase()}</div>
        <div>
          {selectedEntryIndex !== null ? `Selected: Entry #${selectedEntryIndex + 1}` : 'No selection'}
        </div>
        <div>Alt+↑/↓ to navigate • Ctrl+K for shortcuts</div>
      </footer>
    </div>;
}