import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import { sendChat } from "../../services/chatService";
import useApi from "../../hooks/useApi";

// Renders **bold** segments from the model's markdown-style output.
// While text is still being typed, an unclosed ** is closed temporarily so
// raw asterisks never flash on screen.
const renderInline = (text, partial = false) => {
  if (partial) {
    text = text.replace(/(^|[^*])\*$/, "$1");
    if ((text.match(/\*\*/g) || []).length % 2) text += "**";
  }
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        part
      )
    );
};

const MessageBody = ({ text, partial = false }) =>
  text.split("\n").map((line, i) =>
    line.startsWith("* ") ? (
      <li key={i} className="ml-4 list-disc">
        {renderInline(line.slice(2), partial)}
      </li>
    ) : (
      <p key={i} className={line ? "" : "h-2"}>
        {renderInline(line, partial)}
      </p>
    )
  );

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Reveals `text` character by character. Time-based (not per-render) so the
// speed is steady, and scaled so long answers still finish in a few seconds.
function Typewriter({ text, onTick, onDone }) {
  const [count, setCount] = useState(
    prefersReducedMotion() ? text.length : 0
  );

  useEffect(() => {
    if (count >= text.length) {
      onDone();
      return;
    }
    const charsPerSec = Math.max(70, text.length / 3.5);
    const start = performance.now();
    let frame;
    const step = (now) => {
      const next = Math.min(
        text.length,
        Math.floor(((now - start) / 1000) * charsPerSec)
      );
      setCount(next);
      onTick();
      if (next < text.length) frame = requestAnimationFrame(step);
      else onDone();
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <>
      <MessageBody text={text.slice(0, count)} partial={count < text.length} />
      {count < text.length && (
        <span className="inline-block w-[2px] h-4 bg-gray-500 align-middle ml-0.5 animate-pulse" />
      )}
    </>
  );
}

const TypingDots = () => (
  <div className="flex items-center gap-1 h-5 px-1" aria-label="Assistant is typing">
    {[0, 150, 300].map((d) => (
      <span
        key={d}
        className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
        style={{ animationDelay: `${d}ms` }}
      />
    ))}
  </div>
);

function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your travel assistant. How can I help you today?",
    },
  ]);
  const [question, setQuestion] = useState("");

  const messagesEndRef = useRef(null);

  const { loading, request: sendQuestionApi } = useApi(sendChat);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const markDone = (idx) =>
    setMessages((prev) =>
      prev[idx]?.animate
        ? prev.map((m, i) => (i === idx ? { ...m, animate: false } : m))
        : prev
    );

  const handleSend = async () => {
    if (!question.trim() || loading) return;

    const userMessage = { role: "user", content: question.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");

    try {
      const response = await sendQuestionApi({
        data: { question: userMessage.content },
      });
      if (response?.answer) {
        const assistantMessage = {
          role: "assistant",
          content: response.answer,
          animate: true,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        toast.error("No answer returned from server.");
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          animate: true,
        },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-green-700 text-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <h2 className="text-base md:text-lg font-semibold">
          Travel Chatbot 🤖
        </h2>
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close chat"
              className="p-1 rounded-full hover:bg-green-600 transition cursor-pointer"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50 scrollbar-hide ">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-2 md:p-3 rounded-xl break-words ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.animate ? (
                <Typewriter
                  text={msg.content}
                  onTick={() => scrollToBottom("auto")}
                  onDone={() => markDone(idx)}
                />
              ) : (
                <MessageBody text={msg.content} />
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-xl rounded-bl-none p-2 md:p-3">
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 md:p-4 border-t border-gray-200 flex gap-2">
        <input
          type="text"
          placeholder="Type your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm md:text-base"
        />
        <button
          onClick={handleSend}
          className="bg-green-600 text-white p-2 md:p-3 rounded-full hover:bg-green-700 transition"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
