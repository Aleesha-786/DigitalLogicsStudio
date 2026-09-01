import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { MessageCircle, Minus, Send, Trash2 } from "lucide-react";
import { useAuth } from "../../../auth/context/AuthContext";
import { sendChatMessage } from "../../services/aiService";
import {
  COAL_TOPIC_OPTIONS,
  DLD_TOPIC_OPTIONS,
  courseFromPath,
  topicFromPath,
} from "../../utils/topicFromPath";
import "./BoolMentorWidget.css";
import { renderChatMessage } from "./formatChatMessage";
import {
  COURSE_STORAGE_KEY,
  LEVEL_OPTIONS,
  LEVEL_STORAGE_KEY,
  MAX_MESSAGE_LENGTH,
  QUICK_PROMPTS,
  TOPIC_STORAGE_KEY,
  generateId,
} from "./BoolMentorWidget.constants";

function getDefaultTopicForCourse(course) {
  return course === "coal"
    ? COAL_TOPIC_OPTIONS[0].value
    : DLD_TOPIC_OPTIONS[0].value;
}

function isTopicValidForCourse(topic, course) {
  const options = course === "coal" ? COAL_TOPIC_OPTIONS : DLD_TOPIC_OPTIONS;
  return options.some((option) => option.value === topic);
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "";
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/**
 * Small animated bot face used both on the closed launcher button and as the
 * panel-header avatar. Eyes blink and the arm gives a little wave on a loop —
 * all driven by CSS keyframes (see BoolMentorWidget.css) so there's no JS
 * timer to manage. Pass `small` to use the compact size that fits the
 * header avatar slot.
 */
const BotFaceIcon = React.memo(function BotFaceIcon({ small = false, className = "" }) {
  const gradientId = useId();
  const sizeClass = small ? " bool-mentor-bot-face--sm" : "";

  return (
    <span className={`bool-mentor-bot-face${sizeClass}${className ? ` ${className}` : ""}`} aria-hidden="true">
      <svg viewBox="0 0 64 64" className="bool-mentor-bot-svg">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>

        {/* antenna */}
        <line
          x1="32"
          y1="10"
          x2="32"
          y2="4"
          className="bool-mentor-bot-antenna"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="32" cy="4" r="2.6" className="bool-mentor-bot-antenna-dot" />

        {/* head */}
        <rect
          x="14"
          y="12"
          width="36"
          height="30"
          rx="10"
          className="bool-mentor-bot-head"
          fill={`url(#${gradientId})`}
        />

        {/* eyes */}
        <g className="bool-mentor-bot-eyes">
          <ellipse cx="25" cy="27" rx="3.2" ry="4" className="bool-mentor-bot-eye" />
          <ellipse cx="39" cy="27" rx="3.2" ry="4" className="bool-mentor-bot-eye" />
        </g>

        {/* smile */}
        <path
          d="M24 34 Q32 39 40 34"
          className="bool-mentor-bot-mouth"
          fill="none"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* waving arm */}
        <g className="bool-mentor-bot-arm">
          <path d="M48 30 Q56 28 58 20" strokeWidth="3" strokeLinecap="round" />
          <circle cx="58" cy="18" r="3.4" className="bool-mentor-bot-hand" />
        </g>
      </svg>
    </span>
  );
});
BotFaceIcon.displayName = "BotFaceIcon";

const HeaderActions = React.memo(function HeaderActions({ onClear, onMinimize }) {
  return (
    <div className="bool-mentor-panel__actions">
      <button
        type="button"
        className="bool-mentor-panel__icon-btn"
        onClick={onClear}
        aria-label="Clear chat"
        title="Clear chat"
      >
        <Trash2 size={15} />
      </button>
      <button
        type="button"
        className="bool-mentor-panel__icon-btn"
        onClick={onMinimize}
        aria-label="Minimize chat"
        title="Minimize"
      >
        <Minus size={15} />
      </button>
    </div>
  );
});
HeaderActions.displayName = "HeaderActions";

const PanelHeader = React.memo(function PanelHeader({ onClear, onMinimize }) {
  return (
    <header className="bool-mentor-panel__header">
      <BotFaceIcon small className="bool-mentor-panel__avatar" />
      <div className="bool-mentor-panel__title-wrap">
        <h2 className="bool-mentor-panel__title">BoolMentor</h2>
        <p className="bool-mentor-panel__subtitle">
          Digital Logic (DLD) &amp; Computer Organization &amp; Assembly
        </p>
      </div>
      <HeaderActions onClear={onClear} onMinimize={onMinimize} />
    </header>
  );
});
PanelHeader.displayName = "PanelHeader";

const PanelControls = React.memo(function PanelControls({
  level,
  onLevelChange,
  selectedCourse,
  onCourseChange,
  selectedTopic,
  onTopicChange,
  topicOptions,
}) {
  return (
    <div className="bool-mentor-panel__controls">
      <div className="bool-mentor-panel__control">
        <label htmlFor="bool-mentor-level">Level</label>
        <select
          id="bool-mentor-level"
          className="bool-mentor-panel__select"
          value={level}
          onChange={onLevelChange}
        >
          {LEVEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="bool-mentor-panel__control">
        <label htmlFor="bool-mentor-course">Course</label>
        <select
          id="bool-mentor-course"
          className="bool-mentor-panel__select"
          value={selectedCourse}
          onChange={onCourseChange}
        >
          <option value="dld">DLD</option>
          <option value="coal">COAL</option>
        </select>
      </div>
      <div className="bool-mentor-panel__control">
        <label htmlFor="bool-mentor-topic">Topic</label>
        <select
          id="bool-mentor-topic"
          className="bool-mentor-panel__select"
          value={selectedTopic}
          onChange={onTopicChange}
        >
          {topicOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});
PanelControls.displayName = "PanelControls";

const ChatMessageItem = React.memo(function ChatMessageItem({ message, onRetry }) {
  if (message.role === "typing") {
    return (
      <div className="bool-mentor-msg bool-mentor-msg--bot">
        <div className="bool-mentor-msg__bubble">
          <span className="bool-mentor-typing" aria-label="BoolMentor is typing">
            <span />
            <span />
            <span />
          </span>
        </div>
      </div>
    );
  }

  const isUser = message.role === "user";
  const isError = message.role === "error";

  return (
    <div
      className={`bool-mentor-msg ${isUser ? "bool-mentor-msg--user" : "bool-mentor-msg--bot"}${isError ? " bool-mentor-msg--error" : ""}`}
    >
      {isUser && (
        <div className="bool-mentor-msg__avatar" aria-hidden="true">
          👤
        </div>
      )}
      <div className="bool-mentor-msg__bubble">
        {isUser || isError ? message.text : renderChatMessage(message.text)}

        {/* Bug 6 fix: retry affordance on failed sends, using the stored
            original prompt so the user doesn't have to retype it. */}
        {isError && message.originalText && (
          <button
            type="button"
            className="bool-mentor-msg__retry"
            onClick={() => onRetry(message.originalText)}
          >
            ↻ Retry
          </button>
        )}

        {message.timestamp && !isError && (
          <span className="bool-mentor-msg__time">{formatTimestamp(message.timestamp)}</span>
        )}
      </div>
    </div>
  );
});
ChatMessageItem.displayName = "ChatMessageItem";

const SendButton = React.memo(function SendButton({ disabled }) {
  return (
    <button
      type="submit"
      className="bool-mentor-panel__send"
      disabled={disabled}
      aria-label="Send message"
    >
      <Send size={18} />
    </button>
  );
});
SendButton.displayName = "SendButton";

const BrandFooter = React.memo(function BrandFooter() {
  return (
    <p className="bool-mentor-panel__brand">
      <MessageCircle size={11} style={{ verticalAlign: "middle", marginRight: 4 }} />
      Digital Logic Studio · DLD &amp; COAL · AI Assistant
    </p>
  );
});
BrandFooter.displayName = "BrandFooter";

const ChatInput = React.memo(
  React.forwardRef(function ChatInput({ onSendMessage, isSending }, ref) {
    const [input, setInput] = useState("");
    const textareaRef = useRef(null);

    // Merge the forwarded ref with our own local ref so we can both expose
    // focus() to the parent (Bug 3) and auto-resize the textarea ourselves.
    const setRefs = useCallback(
      (node) => {
        textareaRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    // UX Enhancement: auto-resize the textarea as the user types instead of
    // scrolling inside a fixed-height box.
    useEffect(() => {
      const node = textareaRef.current;
      if (!node) return;
      node.style.height = "auto";
      node.style.height = `${Math.min(node.scrollHeight, 140)}px`;
    }, [input]);

    const trySend = useCallback(() => {
      const trimmed = input.trim();
      if (trimmed && !isSending) {
        onSendMessage(trimmed);
        setInput("");
      }
    }, [input, onSendMessage, isSending]);

    const handleSubmit = useCallback(
      (event) => {
        event.preventDefault();
        trySend();
      },
      [trySend],
    );

    const handleKeyDown = useCallback(
      (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          trySend();
        }
      },
      [trySend],
    );

    const isOverLimit = input.length > MAX_MESSAGE_LENGTH;
    const isSendDisabled = isSending || !input.trim() || isOverLimit;

    return (
      <form onSubmit={handleSubmit}>
        <div className="bool-mentor-panel__input-row">
          <textarea
            ref={setRefs}
            className="bool-mentor-panel__input"
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about DLD, COAL, circuits, or assembly…"
            disabled={isSending}
            aria-label="Chat message"
            maxLength={MAX_MESSAGE_LENGTH + 200}
          />
          <SendButton disabled={isSendDisabled} />
        </div>
        {input.length > MAX_MESSAGE_LENGTH * 0.8 && (
          <div
            className={`bool-mentor-panel__char-count${isOverLimit ? " bool-mentor-panel__char-count--warn" : ""}`}
          >
            {input.length} / {MAX_MESSAGE_LENGTH}
          </div>
        )}
      </form>
    );
  }),
);
ChatInput.displayName = "ChatInput";

function BoolMentorWidgetInner() {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const hasInitializedRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [recentTopics, setRecentTopics] = useState([]);
  const [level, setLevel] = useState(() => {
    if (typeof window === "undefined") return "intermediate";
    return window.localStorage.getItem(LEVEL_STORAGE_KEY) || "intermediate";
  });
  const [selectedCourse, setSelectedCourse] = useState(() => {
    if (typeof window === "undefined") return "dld";
    return window.localStorage.getItem(COURSE_STORAGE_KEY) || "dld";
  });
  const [selectedTopic, setSelectedTopic] = useState(() => {
    if (typeof window === "undefined") return "boolean-algebra";
    return window.localStorage.getItem(TOPIC_STORAGE_KEY) || "boolean-algebra";
  });

  const topicOptions = selectedCourse === "coal" ? COAL_TOPIC_OPTIONS : DLD_TOPIC_OPTIONS;

  const learnerName = user?.name?.trim() || "Learner";

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    const pathCourse = courseFromPath(currentPath);
    const pathTopic = topicFromPath(currentPath);

    if (pathCourse) setSelectedCourse(pathCourse);
    if (pathTopic) setSelectedTopic(pathTopic);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LEVEL_STORAGE_KEY, level);
  }, [level]);

  useEffect(() => {
    window.localStorage.setItem(COURSE_STORAGE_KEY, selectedCourse);
  }, [selectedCourse]);

  useEffect(() => {
    window.localStorage.setItem(TOPIC_STORAGE_KEY, selectedTopic);
  }, [selectedTopic]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    setRecentTopics((prev) => {
      if (prev[0] === selectedTopic) return prev;
      const next = [selectedTopic, ...prev.filter((topic) => topic !== selectedTopic)];
      return next.slice(0, 3);
    });
  }, [selectedTopic]);

  // ── Bug 3 fix: focus management ────────────────────────────────────────
  // Auto-focus the input as soon as the panel opens, instead of leaving
  // focus on the (now hidden) launcher button.
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Escape closes the panel, same as clicking Minimize.
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleLevelChange = useCallback((event) => {
    setLevel(event.target.value);
  }, []);

  const handleTopicChange = useCallback((event) => {
    setSelectedTopic(event.target.value);
  }, []);

  const handleCourseChange = useCallback(
    (event) => {
      const nextCourse = event.target.value;
      setSelectedCourse(nextCourse);
      if (!isTopicValidForCourse(selectedTopic, nextCourse)) {
        setSelectedTopic(getDefaultTopicForCourse(nextCourse));
      }
    },
    [selectedTopic],
  );

  // Restore focus to the launcher button once the panel closes, so keyboard
  // users land back where they started instead of losing their place.
  const handleMinimize = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      launcherRef.current?.focus();
    }, 0);
  }, []);

  const buildContext = useMemo(
    () => ({
      name: learnerName,
      currentCourse: selectedCourse === "coal" ? "COAL" : "DLS",
      currentTopic: selectedTopic,
      recentTopics,
      learnerLevel: level,
      difficulty: level,
    }),
    [learnerName, selectedCourse, selectedTopic, recentTopics, level],
  );

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim().slice(0, MAX_MESSAGE_LENGTH);
      if (!trimmed || isSending) return;

      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: "user", text: trimmed, timestamp: Date.now() },
      ]);
      setIsSending(true);

      const typingId = generateId();
      setMessages((prev) => [...prev, { id: typingId, role: "typing" }]);

      // Bug 4 fix companion: online/offline guard so a network drop gives a
      // clear message instead of a generic fetch failure.
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        setMessages((prev) =>
          prev
            .filter((message) => message.id !== typingId)
            .concat({
              id: generateId(),
              role: "error",
              text: "You're offline. Reconnect and try again.",
              originalText: trimmed,
            }),
        );
        setIsSending(false);
        return;
      }

      try {
        const { data } = await sendChatMessage(trimmed, buildContext);

        // Validate the response shape before trusting it.
        const reply = typeof data?.reply === "string" && data.reply.trim() ? data.reply : null;

        setMessages((prev) =>
          prev
            .filter((message) => message.id !== typingId)
            .concat({
              id: generateId(),
              role: "bot",
              text: reply || "No response received.",
              timestamp: Date.now(),
            }),
        );
      } catch (error) {
        const isNetworkError =
          error?.message === "Network Error" || error?.code === "ERR_NETWORK";

        setMessages((prev) =>
          prev
            .filter((message) => message.id !== typingId)
            .concat({
              id: generateId(),
              role: "error",
              text: isNetworkError
                ? "Could not reach DLS Mentor. Check your connection and try again."
                : error?.message || "Could not reach DLS Mentor. Make sure the AI service is running.",
              originalText: trimmed,
            }),
        );
      } finally {
        setIsSending(false);
      }
    },
    [buildContext, isSending],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    inputRef.current?.focus();
  }, []);

  // ── Bug 5 fix ─────────────────────────────────────────────────────────
  // This is a client-only widget, so skip rendering entirely on the server
  // rather than relying on a separate isPrerendering() helper whose
  // server/client behaviour could drift and cause a hydration mismatch.
  if (typeof window === "undefined") {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        ref={launcherRef}
        type="button"
        className="bool-mentor-launcher"
        onClick={() => setIsOpen(true)}
        aria-label="Open BoolMentor chat"
        aria-expanded="false"
        title="BoolMentor"
      >
        <BotFaceIcon />
      </button>
    );
  }

  const showWelcome = messages.length === 0;

  return (
    <section className="bool-mentor-panel" aria-label="BoolMentor Chat" aria-hidden="false">
      <PanelHeader onClear={clearChat} onMinimize={handleMinimize} />

      <PanelControls
        level={level}
        onLevelChange={handleLevelChange}
        selectedCourse={selectedCourse}
        onCourseChange={handleCourseChange}
        selectedTopic={selectedTopic}
        onTopicChange={handleTopicChange}
        topicOptions={topicOptions}
      />

      {/* Bug 4 fix: announce new messages to screen readers as they arrive. */}
      <div
        className="bool-mentor-panel__messages"
        role="log"
        aria-live="polite"
        aria-atomic="false"
      >
        {showWelcome && (
          <>
            <div className="bool-mentor-welcome">
              <p>
                Hi{user?.name ? ` ${user.name}` : ""}! Ask me about <strong>DLD</strong> (digital logic)
                or <strong>COAL</strong> (computer organization & assembly) — pick your course above,
                or try a quick prompt.
              </p>
            </div>
            <div className="bool-mentor-quick-prompts">
              <span className="bool-mentor-quick-prompts__label">Quick prompts</span>
              <div className="bool-mentor-quick-prompts__grid">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.text}
                    type="button"
                    className="bool-mentor-quick-prompt"
                    onClick={() => sendMessage(prompt.text)}
                    disabled={isSending}
                  >
                    <span
                      className={`bool-mentor-prompt-tag bool-mentor-prompt-tag--${prompt.tag.toLowerCase()}`}
                    >
                      {prompt.tag}
                    </span>
                    {prompt.text}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {messages.map((message) => (
          <ChatMessageItem key={message.id} message={message} onRetry={sendMessage} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <footer className="bool-mentor-panel__footer">
        <ChatInput ref={inputRef} onSendMessage={sendMessage} isSending={isSending} />
        <BrandFooter />
      </footer>
    </section>
  );
}

BoolMentorWidgetInner.displayName = "BoolMentorWidgetInner";

export default React.memo(BoolMentorWidgetInner);
