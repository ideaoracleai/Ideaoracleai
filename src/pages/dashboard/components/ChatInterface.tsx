import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateDemoResponse, getRatingEmoji, getRatingLabel } from '../../../services/demoAI';
import { useSubscription } from '../../../hooks/useSubscription';

/**
 * Split markdown into logical blocks (paragraphs, headings, tables, lists etc.)
 * so typewriter reveals full blocks at a time instead of character-by-character.
 */
function splitIntoBlocks(text: string): string[] {
  const blocks: string[] = [];
  const lines = text.split('\n');
  let current = '';
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect table rows
    const isTableRow = /^\|.*\|$/.test(trimmed);
    const isSeparator = /^\|[\s\-:|]+\|$/.test(trimmed);

    if (isTableRow || isSeparator) {
      if (!inTable && current.trim()) {
        blocks.push(current.trim());
        current = '';
      }
      inTable = true;
      current += line + '\n';
      continue;
    }

    if (inTable) {
      // End of table
      blocks.push(current.trim());
      current = '';
      inTable = false;
    }

    // Empty line = block separator
    if (trimmed === '') {
      if (current.trim()) {
        blocks.push(current.trim());
        current = '';
      }
      continue;
    }

    // Headings get their own block
    if (trimmed.startsWith('#')) {
      if (current.trim()) {
        blocks.push(current.trim());
        current = '';
      }
      blocks.push(trimmed);
      continue;
    }

    // Horizontal rules
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      if (current.trim()) {
        blocks.push(current.trim());
        current = '';
      }
      blocks.push(trimmed);
      continue;
    }

    current += line + '\n';
  }

  if (current.trim()) {
    blocks.push(current.trim());
  }

  return blocks;
}

/* ── Typewriter: reveals content block by block with fade-in ── */
function TypewriterMarkdown({ content, speed = 120, onDone }: { content: string; speed?: number; onDone?: () => void }) {
  const blocks = useRef(splitIntoBlocks(content));
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    blocks.current = splitIntoBlocks(content);
    setVisibleCount(1);

    if (blocks.current.length <= 1) {
      onDone?.();
      return;
    }

    const timer = setInterval(() => {
      setVisibleCount(prev => {
        const next = prev + 1;
        if (next >= blocks.current.length) {
          clearInterval(timer);
          onDone?.();
          return blocks.current.length;
        }
        return next;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [content, speed]);

  const visibleText = blocks.current.slice(0, visibleCount).join('\n\n');
  return <MarkdownBody text={visibleText} />;
}

/* ── Shared markdown renderer with styled components + GFM (tables) ── */
function MarkdownBody({ text }: { text: string }) {
  return (
    <div className="prose-ai">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold text-white mt-5 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold text-white mt-4 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold text-[#C9A961] mt-4 mb-1.5">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-semibold text-[#C9A961] mt-3 mb-1">{children}</h4>,
          p: ({ children }) => <p className="mb-3 leading-relaxed text-gray-200">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
          ul: ({ children }) => <ul className="mb-3 ml-1 space-y-1.5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1.5">{children}</ol>,
          li: ({ children }) => (
            <li className="text-gray-300 flex items-start gap-2">
              <span className="text-[#C9A961] mt-1.5 text-[6px]">●</span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          hr: () => <hr className="border-[#3D3428]/50 my-4" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-[#3D3428]/40">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[#1a2030]">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-[#3D3428]/30">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-[#0F1419]/50 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-4 py-2.5 text-left text-[#C9A961] font-semibold text-xs uppercase tracking-wider">{children}</th>,
          td: ({ children }) => <td className="px-4 py-2.5 text-gray-300">{children}</td>,
          code: ({ children }) => <code className="bg-[#0F1419] text-[#C9A961] px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
          blockquote: ({ children }) => <blockquote className="border-l-2 border-[#C9A961] pl-4 my-3 text-gray-400 italic">{children}</blockquote>,
          a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#C9A961] underline hover:text-amber-300 transition-colors">{children}</a>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  rating?: 'good' | 'medium' | 'bad';
}

interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean;
}

interface ChatInterfaceProps {
  onBack?: () => void;
}

const STORAGE_KEY = 'chat_sessions';
const LAST_SESSION_KEY = 'last_session_id';
const CREDITS_PER_QUESTION = 30;

// Language mapping for Speech Recognition
const getRecognitionLanguage = (lang: string): string => {
  const langMap: Record<string, string> = {
    'de': 'de-DE',
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'it': 'it-IT',
    'pt': 'pt-PT',
    'ru': 'ru-RU',
    'zh': 'zh-CN',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'ar': 'ar-SA',
    'tr': 'tr-TR',
    'hi': 'hi-IN',
    'pl': 'pl-PL',
    'nl': 'nl-NL',
    'sv': 'sv-SE',
    'no': 'nb-NO',
    'vi': 'vi-VN',
    'th': 'th-TH',
    'id': 'id-ID',
    'sq': 'sq-AL'
  };
  return langMap[lang.split('-')[0]] || 'en-US';
};

export default function ChatInterface({ onBack }: ChatInterfaceProps) {
  const { t, i18n } = useTranslation();

  // Subscription Hook verwenden
  const { subscription, deductCredits, hasEnoughCredits } = useSubscription();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showSessionExportDropdown, setShowSessionExportDropdown] = useState<string | null>(null);
  const [renameSessionId, setRenameSessionId] = useState<string | null>(null);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Export single session as JSON
  const exportSessionAsJSON = (session: Session) => {
    const exportData = {
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messages: session.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        rating: m.rating
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${session.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('chat.exportSuccess', 'Export erfolgreich!'));
  };

  // Export single session as TXT
  const exportSessionAsTXT = (session: Session) => {
    let content = `${session.title}\n`;
    content += `${'='.repeat(50)}\n`;
    content += `${t('chat.createdAt', 'Erstellt')}: ${new Date(session.createdAt).toLocaleString()}\n`;
    content += `${t('chat.updatedAt', 'Aktualisiert')}: ${new Date(session.updatedAt).toLocaleString()}\n`;
    content += `${'='.repeat(50)}\n\n`;

    session.messages.forEach(m => {
      const role = m.role === 'user' ? t('chat.you', 'Du') : 'KI';
      const time = new Date(m.timestamp).toLocaleTimeString();
      content += `[${time}] ${role}:\n${m.content}\n`;
      if (m.rating) {
        content += `${t('chat.rating', 'Bewertung')}: ${getRatingLabel(m.rating)}\n`;
      }
      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${session.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('chat.exportSuccess', 'Export erfolgreich!'));
  };

  // Export all sessions as JSON
  const exportAllAsJSON = () => {
    if (sessions.length === 0) {
      showToast(t('chat.noSessionsToExport', 'Keine Chats zum Exportieren'), 'error');
      return;
    }

    const exportData = sessions.map(session => ({
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      isFavorite: session.isFavorite,
      messages: session.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        rating: m.rating
      }))
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alle-chats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportDropdown(false);
    showToast(t('chat.allExportSuccess', 'Alle Chats exportiert!'));
  };

  // Export all sessions as TXT
  const exportAllAsTXT = () => {
    if (sessions.length === 0) {
      showToast(t('chat.noSessionsToExport', 'Keine Chats zum Exportieren'), 'error');
      return;
    }

    let content = `${t('chat.allChats', 'Alle Chat-Verläufe')}\n`;
    content += `${t('chat.exportedOn', 'Exportiert am')}: ${new Date().toLocaleString()}\n`;
    content += `${t('chat.totalChats', 'Anzahl Chats')}: ${sessions.length}\n`;
    content += `${'='.repeat(60)}\n\n`;

    sessions.forEach((session, index) => {
      content += `\n${'#'.repeat(60)}\n`;
      content += `${t('chat.chat', 'Chat')} ${index + 1}: ${session.title}\n`;
      content += `${'#'.repeat(60)}\n`;
      content += `${t('chat.createdAt', 'Erstellt')}: ${new Date(session.createdAt).toLocaleString()}\n`;
      content += `${t('chat.messagesCount', 'Nachrichten')}: ${session.messages.length}\n`;
      content += `${'-'.repeat(40)}\n\n`;

      session.messages.forEach(m => {
        const role = m.role === 'user' ? t('chat.you', 'Du') : 'KI';
        const time = new Date(m.timestamp).toLocaleTimeString();
        content += `[${time}] ${role}:\n${m.content}\n`;
        if (m.rating) {
          content += `${t('chat.rating', 'Bewertung')}: ${getRatingLabel(m.rating)}\n`;
        }
        content += '\n';
      });
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alle-chats-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportDropdown(false);
    showToast(t('chat.allExportSuccess', 'Alle Chats exportiert!'));
  };

  // Delete all sessions
  const handleDeleteAll = () => {
    setSessions([]);
    setCurrentSessionId(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_SESSION_KEY);
    setShowDeleteAllConfirm(false);
    showToast(t('chat.allDeleted', 'Alle Chats gelöscht'));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
      setShowSessionExportDropdown(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check for Speech Recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Initialize Speech Recognition
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(t('chat.speechNotSupported', 'Spracherkennung wird von Ihrem Browser nicht unterstützt.'));
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = getRecognitionLanguage(i18n.language);
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setInputValue(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);

      if (event.error === 'not-allowed') {
        alert(t('chat.microphonePermissionDenied', 'Mikrofonzugriff wurde verweigert. Bitte erlauben Sie den Zugriff in Ihren Browsereinstellungen.'));
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const sessionsWithDates = parsed.map((s: Session) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          messages: s.messages.map(m => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
        setSessions(sessionsWithDates);

        // Load last opened session
        const lastSessionId = localStorage.getItem(LAST_SESSION_KEY);
        if (lastSessionId && sessionsWithDates.find((s: Session) => s.id === lastSessionId)) {
          setCurrentSessionId(lastSessionId);
        }
      } catch (e) {
        console.error('Failed to load sessions:', e);
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  // Save last opened session
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(LAST_SESSION_KEY, currentSessionId);
    }
  }, [currentSessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  const createNewSession = () => {
    const newSession: Session = {
      id: Date.now().toString(),
      title: t('chat.newConversation'),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isFavorite: false
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    setInputValue('');
  };

  const handleSendMessage = async () => {
    // Stop listening when sending
    if (isListening) {
      stopListening();
    }

    if (!inputValue.trim() || isTyping) return;

    // Credits prüfen und abziehen BEVOR die Nachricht gesendet wird
    if (!hasEnoughCredits(CREDITS_PER_QUESTION)) {
      setShowNoCreditsModal(true);
      return;
    }

    // Credits abziehen
    if (!deductCredits(CREDITS_PER_QUESTION)) {
      setShowNoCreditsModal(true);
      return;
    }

    let sessionId = currentSessionId;

    // Create new session if none exists
    if (!sessionId) {
      const newSession: Session = {
        id: Date.now().toString(),
        title: inputValue.trim().substring(0, 50) + (inputValue.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false
      };
      setSessions([newSession, ...sessions]);
      sessionId = newSession.id;
      setCurrentSessionId(sessionId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    const userInput = inputValue.trim();
    setInputValue('');

    // Add user message immediately
    setSessions(prevSessions => prevSessions.map(session => {
      if (session.id === sessionId) {
        const updatedMessages = [...session.messages, userMessage];
        const updatedTitle = session.messages.length === 0
          ? userInput.substring(0, 50) + (userInput.length > 50 ? '...' : '')
          : session.title;

        return {
          ...session,
          title: updatedTitle,
          messages: updatedMessages,
          updatedAt: new Date()
        };
      }
      return session;
    }));

    // Show typing indicator
    setIsTyping(true);

    try {
      // Get conversation history for context
      const currentSessionData = sessions.find(s => s.id === sessionId);
      const conversationHistory = currentSessionData?.messages.map(m => ({
        role: m.role,
        content: m.content
      })) || [];

      // Generate AI response (removed i18n.language parameter - now handled internally)
      const aiResponse = await generateDemoResponse(
        userInput,
        conversationHistory
      );

      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        rating: aiResponse.rating
      };

      setSessions(prevSessions => prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            messages: [...session.messages, aiMessage],
            updatedAt: new Date()
          };
        }
        return session;
      }));
    } catch (error) {
      console.error('AI response failed:', error);

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('chat.errorAiFailed'),
        timestamp: new Date(),
        rating: 'bad'
      };

      setSessions(prevSessions => prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            messages: [...session.messages, errorMessage],
            updatedAt: new Date()
          };
        }
        return session;
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openRenameModal = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setRenameSessionId(sessionId);
      setRenameValue(session.title);
      setShowRenameModal(true);
    }
  };

  const handleRename = () => {
    if (!renameSessionId || !renameValue.trim()) return;

    setSessions(sessions.map(session =>
      session.id === renameSessionId
        ? { ...session, title: renameValue.trim(), updatedAt: new Date() }
        : session
    ));

    setShowRenameModal(false);
    setRenameSessionId(null);
    setRenameValue('');
  };

  const openDeleteConfirm = (sessionId: string) => {
    setDeleteSessionId(sessionId);
    setShowDeleteConfirm(true);
  };

  const handleDelete = () => {
    if (!deleteSessionId) return;

    const updatedSessions = sessions.filter(s => s.id !== deleteSessionId);
    setSessions(updatedSessions);

    // If deleted session was current, clear current
    if (currentSessionId === deleteSessionId) {
      setCurrentSessionId(updatedSessions.length > 0 ? updatedSessions[0].id : null);
    }

    // Update localStorage
    if (updatedSessions.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    }

    setShowDeleteConfirm(false);
    setDeleteSessionId(null);
    showToast(t('chat.deleted', 'Chat gelöscht'));
  };

  const toggleFavorite = (sessionId: string) => {
    setSessions(sessions.map(session =>
      session.id === sessionId
        ? { ...session, isFavorite: !session.isFavorite, updatedAt: new Date() }
        : session
    ));
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sessions by date
  const groupedSessions = filteredSessions.reduce((acc, session) => {
    const today = new Date();
    const sessionDate = new Date(session.updatedAt);

    let group = 'older';
    const diffDays = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) group = 'today';
    else if (diffDays === 1) group = 'yesterday';
    else if (diffDays <= 7) group = 'week';
    else if (diffDays <= 30) group = 'month';

    if (!acc[group]) acc[group] = [];
    acc[group].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  return (
    <div className="fixed inset-0 lg:ml-64 bg-[#0F1419] flex">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in ${toast.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
          }`}>
          <i className={toast.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'}></i>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative inset-y-0 left-0 w-64 bg-[#1A1F26] border-r border-[#3D3428]/30 transition-transform duration-300 z-30 flex flex-col`}>

        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#3D3428]/30 space-y-3">
          <button
            onClick={createNewSession}
            className="w-full px-4 py-3 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#C9A961]/20 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            <i className="ri-add-line text-lg"></i>
            {t('chat.newConversation')}
          </button>

          {/* Search */}
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('chat.searchSessions', 'Search conversations...')}
              className="w-full pl-10 pr-3 py-2 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961]/30 transition-colors"
            />
          </div>

          {/* Export & Delete All Buttons */}
          {sessions.length > 0 && (
            <div className="flex gap-2">
              <div className="relative flex-1" ref={exportDropdownRef}>
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="w-full px-3 py-2 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-sm text-gray-300 hover:text-white hover:border-[#C9A961]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="ri-download-2-line"></i>
                  <span>{t('chat.exportAll', 'Exportieren')}</span>
                </button>

                {showExportDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg shadow-xl overflow-hidden z-50">
                    <button
                      onClick={exportAllAsJSON}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-[#0F1419] transition-all cursor-pointer flex items-center gap-2"
                    >
                      <i className="ri-braces-line text-[#C9A961]"></i>
                      <span>JSON</span>
                    </button>
                    <button
                      onClick={exportAllAsTXT}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-[#0F1419] transition-all cursor-pointer flex items-center gap-2"
                    >
                      <i className="ri-file-text-line text-[#C9A961]"></i>
                      <span>TXT</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                className="px-3 py-2 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-sm text-gray-300 hover:text-red-400 hover:border-red-400/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                title={t('chat.deleteAll', 'Alle löschen')}
              >
                <i className="ri-delete-bin-line"></i>
              </button>
            </div>
          )}
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-3">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              {searchQuery ? t('chat.noResults', 'No results found') : t('chat.noSessions', 'No conversations yet')}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedSessions).map(([group, groupSessions]) => (
                <div key={group}>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">
                    {group === 'today' && t('chat.today')}
                    {group === 'yesterday' && t('chat.yesterday', 'Yesterday')}
                    {group === 'week' && t('chat.thisWeek', 'This week')}
                    {group === 'month' && t('chat.thisMonth', 'This month')}
                    {group === 'older' && t('chat.older', 'Older')}
                  </div>
                  <div className="space-y-1">
                    {groupSessions.map(session => (
                      <div
                        key={session.id}
                        className={`relative group rounded-lg transition-all ${currentSessionId === session.id
                          ? 'bg-[#3D3428]/30'
                          : 'hover:bg-[#0F1419]'
                          }`}
                      >
                        <button
                          onClick={() => setCurrentSessionId(session.id)}
                          className="w-full text-left px-3 py-2.5 cursor-pointer"
                        >
                          <div className="flex items-start gap-2 pr-24">
                            <i className="ri-chat-3-line text-base mt-0.5 flex-shrink-0 text-gray-400"></i>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium truncate ${currentSessionId === session.id ? 'text-white' : 'text-gray-300'
                                }`}>
                                {session.title}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {session.messages.length} {t('chat.messages', 'messages')}
                              </div>
                            </div>
                            {session.isFavorite && (
                              <i className="ri-star-fill text-[#C9A961] text-xs absolute right-20 top-3"></i>
                            )}
                          </div>
                        </button>

                        {/* Action Buttons */}
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 bg-[#1A1F26] rounded-lg p-0.5 shadow-lg">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(session.id);
                            }}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#C9A961] hover:bg-[#0F1419] rounded transition-all cursor-pointer"
                            title={session.isFavorite ? t('chat.unfavorite', 'Favorit entfernen') : t('chat.favorite', 'Favorit hinzufügen')}
                          >
                            <i className={`text-sm ${session.isFavorite ? 'ri-star-fill' : 'ri-star-line'}`}></i>
                          </button>

                          {/* Export Dropdown for single session */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowSessionExportDropdown(showSessionExportDropdown === session.id ? null : session.id);
                              }}
                              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#C9A961] hover:bg-[#0F1419] rounded transition-all cursor-pointer"
                              title={t('chat.export', 'Exportieren')}
                            >
                              <i className="ri-download-2-line text-sm"></i>
                            </button>

                            {showSessionExportDropdown === session.id && (
                              <div className="absolute right-0 top-full mt-1 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg shadow-xl overflow-hidden z-50 min-w-[100px]">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    exportSessionAsJSON(session);
                                    setShowSessionExportDropdown(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-[#0F1419] transition-all cursor-pointer flex items-center gap-2"
                                >
                                  <i className="ri-braces-line text-[#C9A961]"></i>
                                  <span>JSON</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    exportSessionAsTXT(session);
                                    setShowSessionExportDropdown(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-[#0F1419] transition-all cursor-pointer flex items-center gap-2"
                                >
                                  <i className="ri-file-text-line text-[#C9A961]"></i>
                                  <span>TXT</span>
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openRenameModal(session.id);
                            }}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#0F1419] rounded transition-all cursor-pointer"
                            title={t('chat.renameConversation', 'Umbenennen')}
                          >
                            <i className="ri-edit-line text-sm"></i>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteConfirm(session.id);
                            }}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-[#0F1419] rounded transition-all cursor-pointer"
                            title={t('chat.deleteConversation', 'Löschen')}
                          >
                            <i className="ri-delete-bin-line text-sm"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#3D3428]/30">
          <button
            onClick={onBack}
            className="w-full px-4 py-2 text-gray-400 hover:text-white hover:bg-[#0F1419] rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 text-sm"
          >
            <i className="ri-arrow-left-line"></i>
            {t('dashboard.sidebar.overview')}
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 border-b border-[#3D3428]/30 flex items-center justify-between px-6 bg-[#1A1F26]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1A1F26] rounded-lg transition-all cursor-pointer"
            >
              <i className="ri-menu-line text-xl"></i>
            </button>
            <div>
              <h2 className="text-white font-semibold">{t('chat.title')}</h2>
              <p className="text-xs text-gray-400">{t('chat.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Credits pro Frage Info */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#0F1419] rounded-lg border border-[#3D3428]/30">
              <i className="ri-subtract-line text-gray-400 text-sm"></i>
              <span className="text-xs text-gray-400">{CREDITS_PER_QUESTION} Credits/Frage</span>
            </div>

            {/* Credits Anzeige */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${subscription.isUnlimited
              ? 'bg-amber-500/10 border border-amber-500/30'
              : subscription.credits < 100
                ? 'bg-red-500/10 border border-red-500/30'
                : 'bg-[#0F1419] border border-[#3D3428]/30'
              }`}>
              <i className={`ri-coins-line ${subscription.isUnlimited ? 'text-amber-400' : subscription.credits < 100 ? 'text-red-400' : 'text-[#C9A961]'
                }`}></i>
              <span className="text-gray-400 text-sm">{t('chat.creditsLabel')}:</span>
              {subscription.isUnlimited ? (
                <span className="text-amber-400 font-medium text-sm flex items-center gap-1">
                  <i className="ri-infinity-line"></i>
                  Unlimited
                </span>
              ) : (
                <span className={`font-medium text-sm ${subscription.credits < 100 ? 'text-red-400' : 'text-white'}`}>
                  {subscription.credits.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {!currentSession || currentSession.messages.length === 0 ? (
            /* Welcome Screen */
            <div className="h-full flex items-center justify-center p-6">
              <div className="max-w-2xl w-full text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="ri-sparkling-2-fill text-3xl text-[#0F1419]"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {t('chat.welcomeTitle')}
                </h3>
                <p className="text-gray-400 mb-8">
                  {t('chat.welcomeDesc')}
                </p>

                {/* Suggestion Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => setInputValue(t('chat.suggestion1'))}
                    className="p-4 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-left hover:border-[#C9A961]/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <i className="ri-search-line text-[#C9A961] text-xl mt-0.5"></i>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {t('chat.suggestion1')}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setInputValue(t('chat.suggestion2'))}
                    className="p-4 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-left hover:border-[#C9A961]/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <i className="ri-lightbulb-line text-[#C9A961] text-xl mt-0.5"></i>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {t('chat.suggestion2')}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setInputValue(t('chat.suggestion3'))}
                    className="p-4 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-left hover:border-[#C9A961]/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <i className="ri-line-chart-line text-[#C9A961] text-xl mt-0.5"></i>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {t('chat.suggestion3')}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setInputValue(t('chat.suggestion4'))}
                    className="p-4 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-left hover:border-[#C9A961]/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <i className="ri-focus-3-line text-[#C9A961] text-xl mt-0.5"></i>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {t('chat.suggestion4')}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="p-6 space-y-6">
              {currentSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-sparkling-2-fill text-[#0F1419]"></i>
                    </div>
                  )}
                  <div
                    className={`max-w-3xl ${message.role === 'user'
                      ? 'bg-[#C9A961] text-[#0F1419] rounded-2xl rounded-tr-sm'
                      : 'bg-[#1A1F26] text-white rounded-2xl rounded-tl-sm'
                      } px-5 py-4`}
                  >
                    <div className="text-sm leading-relaxed">
                      {message.role === 'assistant' ? (
                        /* Check if this is the newest assistant message — animate it */
                        message.id === currentSession?.messages.filter(m => m.role === 'assistant').slice(-1)[0]?.id && !isTyping
                          ? <TypewriterMarkdown content={message.content} speed={6} />
                          : <MarkdownBody text={message.content} />
                      ) : (
                        <span className="whitespace-pre-wrap">{message.content}</span>
                      )}
                    </div>
                    {message.role === 'assistant' && message.rating && (
                      <div className="mt-3 pt-3 border-t border-[#3D3428]/30 flex items-center gap-2">
                        <span className="text-lg">{getRatingEmoji(message.rating)}</span>
                        <span className="text-xs font-semibold text-gray-400">
                          {getRatingLabel(message.rating)}
                        </span>
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-[#3D3428] rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-user-3-fill text-white"></i>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-sparkling-2-fill text-[#0F1419]"></i>
                  </div>
                  <div className="max-w-3xl bg-[#1A1F26] text-white rounded-2xl rounded-tl-sm px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-[#C9A961] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-[#C9A961] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-[#C9A961] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span className="text-xs text-gray-400 ml-2">
                        {i18n.language.startsWith('de') ? 'KI schreibt...' :
                          i18n.language.startsWith('en') ? 'AI is typing...' :
                            i18n.language.startsWith('es') ? 'IA está escribiendo...' :
                              i18n.language.startsWith('fr') ? 'IA écrit...' :
                                i18n.language.startsWith('ru') ? 'ИИ пишет...' :
                                  i18n.language.startsWith('zh') ? 'AI 正在输入...' :
                                    i18n.language.startsWith('ja') ? 'AIが入力中...' :
                                      i18n.language.startsWith('ko') ? 'AI가 입력 중...' :
                                        i18n.language.startsWith('ar') ? 'الذكاء الاصطناعي يكتب...' :
                                          i18n.language.startsWith('tr') ? 'AI yazıyor...' :
                                            i18n.language.startsWith('hi') ? 'AI लिख रहा है...' :
                                              i18n.language.startsWith('pt') ? 'IA está digitando...' :
                                                i18n.language.startsWith('it') ? 'IA sta scrivendo...' :
                                                  i18n.language.startsWith('pl') ? 'AI pisze...' :
                                                    i18n.language.startsWith('nl') ? 'AI typt...' :
                                                      i18n.language.startsWith('sv') ? 'AI skriver...' :
                                                        i18n.language.startsWith('no') ? 'AI skriver...' :
                                                          i18n.language.startsWith('vi') ? 'AI đang nhập...' :
                                                            i18n.language.startsWith('th') ? 'AI กำลังพิมพ์...' :
                                                              i18n.language.startsWith('id') ? 'AI sedang mengetik...' :
                                                                i18n.language.startsWith('sq') ? 'AI po shkruan...' :
                                                                  'AI is typing...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-[#3D3428]/30 p-4 bg-[#1A1F26]">
          <div className="max-w-4xl mx-auto">
            {/* Warnung bei niedrigen Credits */}
            {!subscription.isUnlimited && subscription.credits < CREDITS_PER_QUESTION && (
              <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                <i className="ri-error-warning-line text-red-400 text-xl"></i>
                <div className="flex-1">
                  <p className="text-sm text-red-400 font-medium">Nicht genug Credits</p>
                  <p className="text-xs text-red-400/70">Du benötigst mindestens {CREDITS_PER_QUESTION} Credits pro Frage.</p>
                </div>
                <button
                  onClick={() => window.location.href = '/dashboard?view=credits'}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all cursor-pointer whitespace-nowrap"
                >
                  Upgrade
                </button>
              </div>
            )}

            {/* Warnung bei niedrigen Credits (unter 100) */}
            {!subscription.isUnlimited && subscription.credits >= CREDITS_PER_QUESTION && subscription.credits < 100 && (
              <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3">
                <i className="ri-alert-line text-amber-400 text-xl"></i>
                <div className="flex-1">
                  <p className="text-sm text-amber-400 font-medium">Credits werden knapp</p>
                  <p className="text-xs text-amber-400/70">Noch {Math.floor(subscription.credits / CREDITS_PER_QUESTION)} Fragen möglich.</p>
                </div>
              </div>
            )}

            <div className={`bg-[#0F1419] border rounded-xl p-3 transition-colors ${!subscription.isUnlimited && subscription.credits < CREDITS_PER_QUESTION
              ? 'border-red-500/30 opacity-50'
              : 'border-[#3D3428]/30 focus-within:border-[#C9A961]/30'
              }`}>
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? t('chat.listeningPlaceholder', 'Ich höre zu... Sprechen Sie jetzt.') : t('chat.inputPlaceholder')}
                rows={1}
                disabled={isTyping || (!subscription.isUnlimited && subscription.credits < CREDITS_PER_QUESTION)}
                className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-sm max-h-32 overflow-y-auto disabled:opacity-50"
                style={{ minHeight: '24px' }}
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#3D3428]/30">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startListening}
                    disabled={!speechSupported || isTyping || (!subscription.isUnlimited && subscription.credits < CREDITS_PER_QUESTION)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'text-gray-400 hover:text-white hover:bg-[#1A1F26]'
                      }`}
                    title={isListening ? t('chat.stopListening', 'Aufnahme stoppen') : t('chat.voice', 'Sprechen')}
                  >
                    <i className={isListening ? 'ri-stop-fill text-lg' : 'ri-mic-line text-lg'}></i>
                  </button>
                  {isListening && (
                    <span className="text-xs text-red-400 animate-pulse">
                      {t('chat.recording', 'Aufnahme läuft...')}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping || (!subscription.isUnlimited && subscription.credits < CREDITS_PER_QUESTION)}
                  className="px-4 py-2 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#C9A961]/20 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>{t('chat.send')}</span>
                  <i className="ri-send-plane-fill"></i>
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              {!subscription.isUnlimited && subscription.credits >= CREDITS_PER_QUESTION && (
                <span className="text-[#C9A961]">-{CREDITS_PER_QUESTION} Credits • </span>
              )}
              {t('chat.inputPlaceholder')}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1F26] rounded-xl p-6 max-w-md w-full border border-[#3D3428]/30">
            <h3 className="text-lg font-semibold text-white mb-4">
              {t('chat.renameConversation')}
            </h3>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-4 py-2 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961]/30 transition-colors mb-4"
              placeholder={t('chat.enterNewName', 'Enter new name...')}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setRenameSessionId(null);
                  setRenameValue('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-[#0F1419] rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >
                {t('chat.cancel')}
              </button>
              <button
                onClick={handleRename}
                disabled={!renameValue.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#C9A961]/20 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('chat.rename', 'Rename')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1F26] rounded-xl p-6 max-w-md w-full border border-[#3D3428]/30">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-error-warning-line text-red-400 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t('chat.deleteConversation')}
                </h3>
                <p className="text-sm text-gray-400">
                  {t('chat.deleteConfirmMessage', 'Are you sure you want to delete this conversation? This action cannot be undone.')}
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteSessionId(null);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-[#0F1419] rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >
                {t('chat.cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap"
              >
                {t('chat.delete', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirm Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1F26] rounded-xl p-6 max-w-md w-full border border-[#3D3428]/30">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-error-warning-line text-red-400 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t('chat.deleteAllTitle', 'Alle Chats löschen')}
                </h3>
                <p className="text-sm text-gray-400">
                  {t('chat.deleteAllMessage', 'Möchtest du wirklich alle Chats löschen? Diese Aktion kann nicht rückgängig gemacht werden.')}
                </p>
                <p className="text-sm text-[#C9A961] mt-2">
                  {sessions.length} {t('chat.chatsWillBeDeleted', 'Chat(s) werden gelöscht')}
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-[#0F1419] rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >
                {t('chat.cancel')}
              </button>
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                <i className="ri-delete-bin-line"></i>
                {t('chat.deleteAll', 'Alle löschen')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit History Modal */}
      {showNoCreditsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1F26] rounded-xl p-6 max-w-md w-full border border-[#3D3428]/30">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-coins-line text-red-400 text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Nicht genug Credits
                </h3>
                <p className="text-sm text-gray-400">
                  Du benötigst mindestens <span className="text-[#C9A961] font-semibold">{CREDITS_PER_QUESTION} Credits</span> pro Frage.
                  Dein aktuelles Guthaben: <span className="text-red-400 font-semibold">{subscription.credits} Credits</span>
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#0F1419] rounded-lg border border-[#3D3428]/30 mb-4">
              <p className="text-sm text-gray-400 mb-2">Aktueller Plan: <span className="text-white font-medium">{subscription.plan}</span></p>
              <p className="text-xs text-gray-500">
                Upgrade dein Paket für mehr Credits oder warte auf die monatliche Erneuerung.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNoCreditsModal(false)}
                className="flex-1 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#0F1419] rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >
                Schliessen
              </button>
              <button
                onClick={() => {
                  setShowNoCreditsModal(false);
                  window.location.href = '/dashboard?view=subscription';
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#C9A961]/20 transition-all cursor-pointer whitespace-nowrap"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}