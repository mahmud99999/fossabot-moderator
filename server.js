
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
console.log("VALIDATION STATUS:", validation.status);
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
console.log("CONTEXT STATUS:", response.status);
    if (!response.ok) {
      res.writeHead(200);
      return res.end("1");
    }

    const context = await response.json();
console.log("MESSAGE:", context.message?.content);
console.log("ROLES:", (context.message?.user?.roles || []).map(role => role.type));
    console.log("ROLES DETAIL:", JSON.stringify(context.message?.user?.roles || []));
    console.log("USER DETAIL:", JSON.stringify(context.message?.user || {}));
    if (!context.message?.user) {
      res.writeHead(200);
      return res.end("1");
    }

    
    const moderatorLogins = new Set([
      "akechii666",
      "alonz_",
      "aura_i_",
      "bloodrain1221",
      "brooosk1",
      "cemka_23",
      "csjambo",
      "ct0m",
      "deko",
      "denzyof",
      "fearcs2",
      "fedos1ch",
      "fossabot",
      "fpssssssssssssssssssss",
      "g0oosuu",
      "hypenoise_art",
      "hypetried",
      "igor16fed",
      "k1zyao_o",
      "kashl1d",
      "korya_mc",
      "m3wsu",
      "mefchik_00",
      "monzoyoyo",
      "mus1khaha1221",
      "niewsz",
      "oskasnothappy",
      "polzaaaaa",
      "quefix_",
      "ryujincs1",
      "sdaim_",
      "sn3pffahaha",
      "spiritdozz",
      "strogo",
      "vvw_ra666",
      "weirdo6x9",
      "zweih1221"
      "keliencs"
    ]);

    const userLogin = (context.message.user.login || "").toLowerCase();
    const isModerator = moderatorLogins.has(userLogin);

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
