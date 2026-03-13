import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Terminal as TerminalIcon, Wifi } from 'lucide-react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { mockProjects } from '@/lib/mock-data';

// ─── Mock command processor ───────────────────────────────────────────────────
const MOCK_FILES = [
  'deploy.sh', 'config.yaml', 'docker-compose.yml',
  'README.md', '.env.production', 'terraform.tfvars',
  'logs/', 'scripts/', 'certs/',
];

const MOCK_PROCESSES = [
  '  PID TTY          TIME CMD',
  '    1 pts/0    00:00:00 bash',
  '   42 pts/0    00:00:01 node',
  '   88 pts/0    00:00:00 nginx',
  '  143 pts/0    00:00:00 ps',
];

const MOCK_DISK = [
  'Filesystem      Size  Used Avail Use% Mounted on',
  '/dev/xvda1       30G   12G   17G  42% /',
  'tmpfs           1.0G     0  1.0G   0% /dev/shm',
  '/dev/xvdb       100G   48G   52G  48% /data',
];

function processCommand(cmd: string, username: string): string[] {
  const trimmed = cmd.trim();
  if (trimmed === '') return [];

  switch (trimmed) {
    case 'help':
      return [
        '',
        '\x1b[32mAvailable commands:\x1b[0m',
        '  help     — show this help message',
        '  ls       — list files in current directory',
        '  pwd      — print working directory',
        '  whoami   — print current user',
        '  date     — print current date and time',
        '  uptime   — show system uptime',
        '  ps       — list running processes',
        '  df       — show disk usage',
        '  clear    — clear the terminal',
        '',
      ];
    case 'ls':
    case 'ls -la':
    case 'ls -l':
      return [
        '',
        ...MOCK_FILES.map((f) =>
          f.endsWith('/')
            ? `\x1b[34mdrwxr-xr-x  2 ${username} ${username}  4096 Mar 12 09:41 ${f}\x1b[0m`
            : `-rw-r--r--  1 ${username} ${username}  1024 Mar 12 09:41 \x1b[37m${f}\x1b[0m`
        ),
        '',
      ];
    case 'pwd':
      return [`/home/${username}`];
    case 'whoami':
      return [username];
    case 'date':
      return [new Date().toString()];
    case 'uptime':
      return [` ${new Date().toLocaleTimeString()}  up 14 days,  6:42,  1 user,  load average: 0.12, 0.08, 0.05`];
    case 'ps':
    case 'ps aux':
      return ['', ...MOCK_PROCESSES, ''];
    case 'df':
    case 'df -h':
      return ['', ...MOCK_DISK, ''];
    case 'clear':
      return ['__CLEAR__'];
    default:
      if (trimmed.startsWith('cd ')) {
        return [`bash: cd: ${trimmed.slice(3)}: No such file or directory`];
      }
      if (trimmed.startsWith('cat ')) {
        return [`bash: cat: ${trimmed.slice(4)}: Permission denied`];
      }
      return [`bash: ${trimmed}: command not found`];
  }
}

export default function TerminalPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const termRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const inputRef = useRef<string>('');
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef<number>(-1);

  const project = mockProjects.find((p) => p.id === projectId);
  const username = project?.jumpserver_username ?? 'jumpserver';
  const projectName = project?.name ?? 'unknown';

  useEffect(() => {
    if (!termRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#020408',
        foreground: '#00FF41',
        cursor: '#00FF41',
        cursorAccent: '#020408',
        selectionBackground: '#00FF4133',
        black: '#020408',
        brightBlack: '#1a2a1a',
        red: '#ff5555',
        brightRed: '#ff6e6e',
        green: '#00FF41',
        brightGreen: '#69ff85',
        yellow: '#f1fa8c',
        brightYellow: '#ffffa5',
        blue: '#7ec8e3',
        brightBlue: '#b0d9e8',
        magenta: '#bd93f9',
        brightMagenta: '#caa9fa',
        cyan: '#8be9fd',
        brightCyan: '#a4ffff',
        white: '#c0c0c0',
        brightWhite: '#ffffff',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      fontSize: 14,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(termRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitRef.current = fitAddon;

    // ─── Welcome banner ───────────────────────────────────────────────────────
    const g = '\x1b[32m';  // signal-green
    const d = '\x1b[90m';  // dim
    const r = '\x1b[0m';   // reset
    const b = '\x1b[1m';   // bold

    term.writeln(`${g}${b}`);
    term.writeln(`  ███╗   ██╗ ██████╗ ██████╗ ██████╗ ██╗  ██╗`);
    term.writeln(`  ████╗  ██║██╔════╝██╔═══██╗██╔══██╗╚██╗██╔╝`);
    term.writeln(`  ██╔██╗ ██║██║     ██║   ██║██║  ██║ ╚███╔╝ `);
    term.writeln(`  ██║╚██╗██║██║     ██║   ██║██║  ██║ ██╔██╗ `);
    term.writeln(`  ██║ ╚████║╚██████╗╚██████╔╝██████╔╝██╔╝ ██╗`);
    term.writeln(`  ╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝${r}`);
    term.writeln('');
    term.writeln(`${g}  Project: ${b}${projectName}${r}`);
    term.writeln(`${d}  Session: ${username}@jumpserver — ${new Date().toUTCString()}${r}`);
    term.writeln(`${d}  WebSocket SSH — configure jumpserver URL in project settings${r}`);
    term.writeln('');
    term.writeln(`${g}  Type \x1b[1mhelp\x1b[22m for available commands.${r}`);
    term.writeln('');

    const writePrompt = () => {
      term.write(`${g}${username}@${projectName.toLowerCase().replace(/\s+/g, '-')}${r}:${d}~${r}$ `);
    };

    writePrompt();

    // ─── Key handler ─────────────────────────────────────────────────────────
    term.onKey(({ key, domEvent }) => {
      const code = domEvent.key;

      if (code === 'Enter') {
        const cmd = inputRef.current;
        term.writeln('');

        if (cmd.trim()) {
          historyRef.current = [cmd, ...historyRef.current.slice(0, 49)];
          historyIdxRef.current = -1;

          const lines = processCommand(cmd, username);

          if (lines[0] === '__CLEAR__') {
            term.clear();
          } else {
            for (const line of lines) {
              term.writeln(line);
            }
          }
        }

        inputRef.current = '';
        writePrompt();
      } else if (code === 'Backspace') {
        if (inputRef.current.length > 0) {
          inputRef.current = inputRef.current.slice(0, -1);
          term.write('\b \b');
        }
      } else if (code === 'ArrowUp') {
        if (historyRef.current.length > 0) {
          historyIdxRef.current = Math.min(
            historyIdxRef.current + 1,
            historyRef.current.length - 1
          );
          const entry = historyRef.current[historyIdxRef.current] ?? '';
          // Clear current input
          term.write('\b \b'.repeat(inputRef.current.length));
          inputRef.current = entry;
          term.write(entry);
        }
      } else if (code === 'ArrowDown') {
        if (historyIdxRef.current > 0) {
          historyIdxRef.current -= 1;
          const entry = historyRef.current[historyIdxRef.current] ?? '';
          term.write('\b \b'.repeat(inputRef.current.length));
          inputRef.current = entry;
          term.write(entry);
        } else if (historyIdxRef.current === 0) {
          historyIdxRef.current = -1;
          term.write('\b \b'.repeat(inputRef.current.length));
          inputRef.current = '';
        }
      } else if (code === 'Tab') {
        // Simple tab completion for known commands
        const cmds = ['help', 'ls', 'pwd', 'whoami', 'date', 'uptime', 'ps', 'df', 'clear'];
        const partial = inputRef.current;
        const match = cmds.find((c) => c.startsWith(partial) && c !== partial);
        if (match) {
          const completion = match.slice(partial.length);
          inputRef.current = match;
          term.write(completion);
        }
        domEvent.preventDefault();
      } else if (code === 'c' && domEvent.ctrlKey) {
        term.writeln('^C');
        inputRef.current = '';
        writePrompt();
      } else if (code === 'l' && domEvent.ctrlKey) {
        term.clear();
        inputRef.current = '';
        writePrompt();
      } else if (key.length === 1 && !domEvent.ctrlKey && !domEvent.altKey && !domEvent.metaKey) {
        inputRef.current += key;
        term.write(key);
      }
    });

    // ─── Resize observer ─────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch (_) {
        // ignore
      }
    });

    if (termRef.current) {
      ro.observe(termRef.current);
    }

    return () => {
      ro.disconnect();
      term.dispose();
      xtermRef.current = null;
      fitRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (!project) {
    return (
      <div className="min-h-screen bg-signal-bg flex items-center justify-center text-signal-text-muted font-mono">
        Project not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-signal-bg font-mono overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-signal-surface border-b border-signal-border">
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="text-signal-green" />
          <span className="text-signal-text text-sm font-semibold">
            Terminal —{' '}
            <span className="text-signal-green">
              {projectName}@{username}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-signal-text-muted">
          <Wifi size={13} className="text-signal-green" />
          <span>WebSocket SSH ready — configure jumpserver URL in project settings</span>
        </div>
      </div>

      {/* Terminal Container */}
      <div
        ref={termRef}
        className="flex-1 overflow-hidden"
        style={{ background: '#020408', padding: '8px' }}
      />
    </div>
  );
}
