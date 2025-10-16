export default function MessageList({ messages }) {
  return (
    <div className="space-y-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-2 rounded-lg max-w-xs self-start ${
            msg.sender === "user" ? "bg-blue-500 text-white self-end" : "text-black"
          }`}
          style={{
            backgroundColor: msg.sender === "ai" ? "bg-blue-500 text-white self-end" : undefined, // Light purple for AI
            fontSize: "1.1rem", // slightly bigger text
          }}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}
