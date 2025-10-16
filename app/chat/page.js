"use client";

import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import MessageList from "@/components/MessageList";

let socket;

export default function page() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket = io("http://localhost:4000");

    const handleMessage = (msg) => setMessages((prev) => [...prev, msg]);
    const handleTyping = (status) => setTyping(status.status);

    socket.on("message", handleMessage);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("message", handleMessage);
      socket.off("typing", handleTyping);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = { sender: "user", type: "text", text: input, id: Date.now() };
    socket.emit("message", msg);
    setInput("");
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported.");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    if (!isRecording) {
      setIsRecording(true);
      recognition.start();

      recognition.onresult = (e) => {
        setInput(e.results[0][0].transcript);
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
    } else {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const readLatestAIMessage = () => {
    if (!("speechSynthesis" in window)) return alert("Text-to-speech not supported.");
    if (speechSynthesis.speaking) speechSynthesis.cancel();

    const aiMessages = messages.filter((msg) => msg.sender === "ai");
    if (!aiMessages.length) return;

    const latest = aiMessages[aiMessages.length - 1];
    const utterance = new SpeechSynthesisUtterance(latest.text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* WhatsApp-like Header */}
      <header className="whatsapp-header"> {/* <-- Green top header */}
        <div className="avatar"></div>
        <div className="title">
          <span className="name">AI Mitra</span>
          <span className="status">online</span>
        </div>
        <div className="actions">
          <button>📞</button>
          <button>⋮</button>
        </div>
      </header>

      {/* Chat Area with background image */}
      <main
        className="flex-1 overflow-y-auto p-4"
        style={{
          backgroundImage: 'url("/whatsapp.jpg")',
          backgroundSize: "cover",
          backgroundRepeat: "repeat",
          backgroundPosition: "top",
        }}
      >
        <MessageList messages={messages} />
        {typing && <div className="text-gray-200 italic mb-2 ml-2">AI is typing...</div>}
        <div ref={messagesEndRef} />
      </main>

      {/* Footer like WhatsApp */}
      <footer className="flex items-center gap-2 p-3 bg-white border-t shadow-md">
        <div className="flex w-full items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            className="flex-1 p-3 border rounded-full focus:outline-none text-lg"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={handleVoiceInput}
            className={`px-4 py-2 rounded-full font-semibold ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
          >
            {isRecording ? "🎙" : "🎤"}
          </button>
          <button
            onClick={sendMessage}
            className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700"
          >
            ➤
          </button>
        </div>
      </footer>
    </div>
  );
}
