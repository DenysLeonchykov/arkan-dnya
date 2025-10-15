export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Страница статуса для проверки в браузере
    if (request.method === "GET") {
      const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>dailyarkan</title></head>
<body style="font-family:system-ui;background:#0b0b0b;color:#eaeaea;padding:24px">
<h1>✅ Daily Arkan Relay</h1>
<p>Воркер запущен. Ожидаю <code>POST</code> с JSON: { date, time, name, createdAt, tz, userAgent }.</p>
</body></html>`;
      return new Response(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (request.method !== "POST")
      return new Response("Method not allowed", { status: 405 });

    try {
      const body = await request.json();
      const text = [
        "🧙‍♂️ Новая запись «Аркан Дня»",
        `Дата: ${body.date}`,
        `Время: ${body.time}`,
        `Имя: ${body.name}`,
        body.createdAt ? `Создано: ${body.createdAt}` : "",
        body.tz ? `TZ: ${body.tz}` : "",
      ].filter(Boolean).join("\n");

      const resp = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.CHAT_ID,
          text,
          disable_web_page_preview: true
        }),
      });

      const ok = resp.ok;
      const data = await resp.json().catch(() => ({}));
      return new Response(JSON.stringify({ ok, data }), {
        status: ok ? 200 : 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: String(e) }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};
