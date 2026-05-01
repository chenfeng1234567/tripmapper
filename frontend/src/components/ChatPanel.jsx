import { useState, useRef, useEffect } from 'react';
import './ChatPanel.css';

const SUGGESTIONS = [
  'Add a local food market',
  'Remove museums',
  'What should I pack?',
  'Best time to visit each place',
];

export default function ChatPanel({ history, onSend, disabled }) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (expanded && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, expanded]);

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput('');
    setSending(true);
    setExpanded(true);
    await onSend(msg);
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className={`chat-panel ${expanded ? 'expanded' : ''}`}>
      {/* Header */}
      <button
        className="chat-header"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <div className="chat-header-left">
          <div className="chat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <span className="chat-title">Refine with AI</span>
            {history.length > 0 && (
              <span className="chat-count">{Math.ceil(history.length / 2)} msg{history.length > 2 ? 's' : ''}</span>
            )}
          </div>
        </div>
        <svg className={`chevron ${expanded ? 'up' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </button>

      {expanded && (
        <>
          {/* Messages */}
          <div className="chat-messages">
            {history.length === 0 ? (
              <div className="chat-empty">
                <p>Ask me to modify your itinerary or answer travel questions.</p>
                <div className="suggestions">
                  {SUGGESTIONS.map(s => (
                    <button key={s} className="suggestion-chip" onClick={() => handleSend(s)} disabled={sending}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              history.map((msg, i) => (
                <div key={i} className={`chat-msg ${msg.role}`}>
                  <div className="chat-bubble">{msg.content}</div>
                </div>
              ))
            )}
            {sending && (
              <div className="chat-msg assistant">
                <div className="chat-bubble typing">
                  <span/><span/><span/>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-row">
            <textarea
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask to modify or ask a question..."
              rows={1}
              disabled={sending || disabled}
            />
            <button
              className="chat-send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || sending || disabled}
              aria-label="Send"
            >
              {sending ? (
                <span className="send-spinner" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
