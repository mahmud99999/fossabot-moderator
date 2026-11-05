
const http = require("node:http");

const PORT = process.env.PORT || 3000;
const API_BASE = "https://api.fossabot.com/v2/customapi";

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
console.log("REQUEST:", req.method, req.url);
console.log("HAS TOKEN:", Boolean(req.headers["x-fossabot-customapitoken"]));
console.log("FOSSABOT HEADERS:", Object.keys(req.headers).filter(h => h.startsWith("x-fossabot-")));
  if (req.url === "/health") {
    res.writeHead(200);
    return res.end("OK");
  }

  if (req.url !== "/repeat") {
    res.writeHead(404);
    return res.end("1");
  }

  try {
    const token = req.headers["x-fossabot-customapitoken"];

    if (!token) {
      res.writeHead(200);
      return res.end("1");
    }

    // Проверяем запрос Fossabot
    const validation = await fetch(
      `${API_BASE}/validate/${encodeURIComponent(token)}`
    );

    if (!validation.ok) {
      res.writeHead(200);
      return res.end("1");
    }

    const result = await validation.json();
    const contextUrl = result.context_url;

    if (
      typeof contextUrl !== "string" ||
      !contextUrl.startsWith(`${API_BASE}/context/`)
    ) {
      res.writeHead(200);
      return res.end("1");
    }

    // Получаем контекст сообщения
    const response = await fetch(contextUrl);

    if (!response.ok) {
      res.writeHead(200);
      return res.end("1");
    }

    const context = await response.json();

    if (!context.message?.user) {
      res.writeHead(200);
      return res.end("1");
    }

    const roles = context.message.user.roles || [];

    const isModerator = roles.some(role =>
      ["moderator", "broadcaster"].includes(role.type)
    );

    // Обычный зритель всегда получает одну ссылку
    if (!isModerator) {
      res.writeHead(200);
      return res.end("1");
    }

    // Читаем число из сообщения, например !тг 7
    const message = context.message.content || "";
    const match = message.trim().match(/^!\S+(?:\s+(\d+))?/);

    let count = Number(match?.[1] || 1);

    if (!Number.isFinite(count)) count = 1;

    count = Math.max(1, Math.min(10, Math.floor(count)));

    res.writeHead(200);
    return res.end(String(count));

  } catch (error) {
    console.error("Fossabot API error:", error);
    res.writeHead(200);
    return res.end("1");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
