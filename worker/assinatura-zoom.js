// Cloudflare Worker: gera a assinatura (JWT) do Zoom Meeting SDK para a sala de aula ao vivo.
// Variáveis do Worker (Settings > Variables and Secrets):
//   ZOOM_CLIENT_ID      (texto)   Client ID do app Meeting SDK
//   ZOOM_CLIENT_SECRET  (segredo) Client Secret do app Meeting SDK
//   ORIGENS             (texto)   endereços autorizados, separados por vírgula. Ex.: https://ginoterentimjr.github.io
//   REUNIOES            (texto, opcional) números de reunião autorizados, separados por vírgula
// Toda assinatura sai com papel de participante (role 0): ninguém entra como anfitrião por esta página.

export default {
  async fetch(request, env) {
    const origem = request.headers.get("Origin") || "";
    const origens = lista(env.ORIGENS);
    const autorizada = origens.length > 0 && origens.includes(origem);
    const cors = {
      "Access-Control-Allow-Origin": autorizada ? origem : origens[0] || "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin"
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return resposta({ error: "Use POST." }, 405, cors);
    if (!autorizada) return resposta({ error: "Origem não autorizada." }, 403, cors);
    if (!env.ZOOM_CLIENT_ID || !env.ZOOM_CLIENT_SECRET) return resposta({ error: "Worker sem credenciais do Zoom." }, 500, cors);

    let corpo;
    try { corpo = await request.json(); } catch (e) { return resposta({ error: "Pedido inválido." }, 400, cors); }
    const mn = String(corpo.meetingNumber || "").replace(/\D/g, "");
    if (!/^\d{9,12}$/.test(mn)) return resposta({ error: "Número de reunião inválido." }, 400, cors);
    const reunioes = lista(env.REUNIOES);
    if (reunioes.length && !reunioes.includes(mn)) return resposta({ error: "Reunião não autorizada nesta sala." }, 403, cors);

    const iat = Math.floor(Date.now() / 1000) - 30;
    const exp = iat + 60 * 60 * 2; // duas horas; o mínimo exigido pelo Zoom é meia hora
    const payload = { appKey: env.ZOOM_CLIENT_ID, mn, role: 0, iat, exp, tokenExp: exp, video_webrtc_mode: 1 };
    const signature = await jwt(payload, env.ZOOM_CLIENT_SECRET);
    return resposta({ signature, sdkKey: env.ZOOM_CLIENT_ID }, 200, cors);
  }
};

function lista(v) { return String(v || "").split(",").map(s => s.trim()).filter(Boolean); }

function resposta(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}

function b64url(bytes) {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function jwt(payload, segredo) {
  const enc = new TextEncoder();
  const cabecalho = b64url(enc.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const corpo = b64url(enc.encode(JSON.stringify(payload)));
  const chave = await crypto.subtle.importKey("raw", enc.encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const assinatura = await crypto.subtle.sign("HMAC", chave, enc.encode(`${cabecalho}.${corpo}`));
  return `${cabecalho}.${corpo}.${b64url(assinatura)}`;
}
