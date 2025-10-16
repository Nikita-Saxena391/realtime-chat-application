import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.SOCKET_PORT || 4000;

// Create HTTP server
const httpServer = createServer();

// Initialize Socket.io server
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000" }, // allow frontend
});

console.log("Starting socket server...");

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("message", async (payload) => {
    // Emit user message to all clients
    io.emit("message", payload);

    // Emit typing indicator for AI
    io.emit("typing", { sender: "ai", status: true });

    try {
      // Call OpenAI API
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // ✅ Corrected
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful AI chat assistant." },
            { role: "user", content: payload.text },
          ],
          max_tokens: 300,
        }),
      });

      const data = await resp.json();

      const aiText =
        data?.choices?.[0]?.message?.content ||
        "Sorry, I couldn't respond right now.";

      // Send AI message to clients
      io.emit("message", {
        sender: "ai",
        text: aiText,
        id: Date.now(),
      });
    } catch (err) {
      console.error("OpenAI error:", err);
      io.emit("message", {
        sender: "ai",
        text: "Error fetching AI reply.",
        id: Date.now(),
      });
    } finally {
      io.emit("typing", { sender: "ai", status: false });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
