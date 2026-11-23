// Cloudflare Worker: assinatura (JWT) do Zoom Meeting SDK para as salas de Gino Terentim.
//
// Variáveis do Worker (Settings > Variables and Secrets):
//   ZOOM_CLIENT_ID      (texto)   Client ID do app "Pionira Live"
//   ZOOM_CLIENT_SECRET  (segredo) Client Secret do app
//   ORIGENS             (texto)   endereços autorizados, separados por vírgula. Ex.: https://ginoterentimjr.github.io
//   REUNIOES            (texto, opcional) números de reunião autorizados na sala de aula, separados por vírgula
//   ANFITRIOES          (texto)   e-mails das contas do Zoom autorizadas a conduzir pela sala de reuniões, separados por vírgula
//
// Rotas:
//   POST /                      sala de aula (Pionira): assinatura de participante (role 0). Ninguém conduz por esta rota.
//   POST /anfitriao/sessao      sala de reuniões: troca o código de autorização do Zoom por uma sessão do anfitrião.
//   POST /anfitriao/renovar     renova a sessão.
//   POST /anfitriao/reunioes    lista as próximas reuniões do anfitrião.
//   POST /anfitriao/nova        cria uma reunião imediata.
//   POST /anfitriao/entrar      assinatura e ZAK para entrar: anfitrião (role 1) nas reuniões da própria conta, participante nas demais.
// As rotas /anfitriao exigem um token do Zoom de uma conta listada em ANFITRIOES: a identidade é conferida no próprio Zoom.

const API = "https://api.zoom.us/v2";

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
    const rota = new URL(request.url).pathname.replace(/\/+$/, "");

    try {
      if (rota === "") return await salaDeAula(corpo, env, cors);
      if (rota === "/anfitriao/sessao") return await sessao(corpo, env, cors);
      if (rota === "/anfitriao/renovar") return await renovar(corpo, env, cors);
      if (rota === "/anfitriao/reunioes") return await reunioes(corpo, env, cors);
      if (rota === "/anfitriao/nova") return await nova(corpo, env, cors);
      if (rota === "/anfitriao/entrar") return await entrar(corpo, env, cors);
      return resposta({ error: "Rota inexistente." }, 404, cors);
    } catch (e) {
      const status = e && e.status ? e.status : 500;
      return resposta({ error: (e && e.message) || "Falha no serviço." }, status, cors);
    }
  }
};

// ---------------------------------------------------------------- sala de aula (participante)
async function salaDeAula(corpo, env, cors) {
  const mn = numero(corpo.meetingNumber);
  if (!mn) return resposta({ error: "Número de reunião inválido." }, 400, cors);
  const permitidas = lista(env.REUNIOES);
  if (permitidas.length && !permitidas.includes(mn)) return resposta({ error: "Reunião não autorizada nesta sala." }, 403, cors);
  const signature = await assinatura(env, mn, 0);
  return resposta({ signature, sdkKey: env.ZOOM_CLIENT_ID }, 200, cors);
}

// ---------------------------------------------------------------- sala de reuniões (anfitrião)
async function sessao(corpo, env, cors) {
  const { code, redirect_uri, code_verifier } = corpo;
  if (!code || !redirect_uri) throw erro(400, "Código de autorização ausente.");
  if (!lista(env.ORIGENS).some(o => String(redirect_uri).startsWith(o + "/"))) throw erro(400, "Endereço de retorno não autorizado.");
  const dados = { grant_type: "authorization_code", code, redirect_uri };
  if (code_verifier) dados.code_verifier = code_verifier;
  const t = await token(env, dados);
  const eu = await anfitriao(env, t.access_token);
  return resposta(sessaoPublica(t, eu), 200, cors);
}

async function renovar(corpo, env, cors) {
  if (!corpo.refresh_token) throw erro(400, "Sessão ausente.");
  const t = await token(env, { grant_type: "refresh_token", refresh_token: corpo.refresh_token });
  const eu = await anfitriao(env, t.access_token);
  return resposta(sessaoPublica(t, eu), 200, cors);
}

async function reunioes(corpo, env, cors) {
  await anfitriao(env, corpo.access_token);
  let itens = [];
  const r = await zoom(corpo.access_token, "/users/me/upcoming_meetings");
  if (r.ok) itens = (r.dados.meetings || []);
  else {
    const r2 = await zoom(corpo.access_token, "/users/me/meetings?type=upcoming&page_size=30");
    if (!r2.ok) throw erro(502, "O Zoom não devolveu a lista de reuniões" + motivo(r2) + ".");
    itens = r2.dados.meetings || [];
  }
  const saida = itens.map(m => ({ id: String(m.id), topic: m.topic || "Reunião", start_time: m.start_time || "", duration: m.duration || 0, type: m.type }));
  return resposta({ meetings: saida }, 200, cors);
}

async function nova(corpo, env, cors) {
  await anfitriao(env, corpo.access_token);
  const topic = String(corpo.topic || "Reunião").slice(0, 120);
  const r = await zoom(corpo.access_token, "/users/me/meetings", {
    method: "POST",
    body: JSON.stringify({ topic, type: 1, settings: { join_before_host: false, waiting_room: true, auto_recording: "none" } })
  });
  if (!r.ok) throw erro(502, "O Zoom não criou a reunião" + motivo(r) + ".");
  const m = r.dados;
  return resposta({ id: String(m.id), topic: m.topic, password: m.password || "", join_url: m.join_url || "" }, 200, cors);
}

async function entrar(corpo, env, cors) {
  const eu = await anfitriao(env, corpo.access_token);
  const mn = numero(corpo.meetingNumber);
  if (!mn) throw erro(400, "Número de reunião inválido.");

  // A reunião é da própria conta? Então a entrada é de anfitrião; nas demais, de participante identificado.
  let role = 0, senha = String(corpo.password || ""), topic = "", convite = "";
  const r = await zoom(corpo.access_token, "/meetings/" + mn);
  if (r.ok) {
    topic = r.dados.topic || "";
    convite = r.dados.join_url || "";
    if (r.dados.password) senha = r.dados.password;
    if (r.dados.host_id && r.dados.host_id === eu.id) role = 1;
  }

  let zak = "";
  for (const caminho of ["/users/me/zak", "/users/me/token?type=zak"]) {
    const z = await zoom(corpo.access_token, caminho);
    if (z.ok && z.dados.token) { zak = z.dados.token; break; }
  }
  if (role === 1 && !zak) throw erro(502, "O Zoom não devolveu o token de anfitrião. Confira os escopos do app.");

  const signature = await assinatura(env, mn, role);
  return resposta({
    signature, sdkKey: env.ZOOM_CLIENT_ID, zak, role, meetingNumber: mn, password: senha, topic, join_url: convite,
    nome: eu.nome, email: eu.email
  }, 200, cors);
}

// ---------------------------------------------------------------- apoio
async function anfitriao(env, accessToken) {
  if (!accessToken) throw erro(401, "Sessão ausente. Entre de novo com o Zoom.");
  const r = await zoom(accessToken, "/users/me");
  if (!r.ok) throw erro(401, "Sessão expirada. Entre de novo com o Zoom.");
  const email = String(r.dados.email || "").toLowerCase();
  const permitidos = lista(env.ANFITRIOES).map(s => s.toLowerCase());
  if (!permitidos.length) throw erro(403, "Sala sem anfitriões cadastrados (variável ANFITRIOES do Worker).");
  if (!permitidos.includes(email)) throw erro(403, "Esta conta do Zoom não está autorizada a conduzir por esta sala.");
  const nome = r.dados.display_name || [r.dados.first_name, r.dados.last_name].filter(Boolean).join(" ") || email;
  return { id: r.dados.id, email, nome };
}

async function token(env, dados) {
  const r = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      "Authorization": "Basic " + btoa(env.ZOOM_CLIENT_ID + ":" + env.ZOOM_CLIENT_SECRET),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(dados).toString()
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw erro(401, "O Zoom recusou a autorização" + (j.reason ? ": " + j.reason : "") + ".");
  return j;
}

function sessaoPublica(t, eu) {
  return { access_token: t.access_token, refresh_token: t.refresh_token || "", expires_in: t.expires_in || 3600, nome: eu.nome, email: eu.email };
}

async function zoom(accessToken, caminho, opcoes = {}) {
  const r = await fetch(API + caminho, {
    ...opcoes,
    headers: { "Authorization": "Bearer " + accessToken, "Content-Type": "application/json", ...(opcoes.headers || {}) }
  });
  const dados = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, dados };
}

function motivo(r) { return r && r.dados && r.dados.message ? " (" + r.dados.message + ")" : ""; }

async function assinatura(env, mn, role) {
  const iat = Math.floor(Date.now() / 1000) - 30;
  const exp = iat + 60 * 60 * (role === 1 ? 6 : 2); // o mínimo exigido pelo Zoom é meia hora
  const payload = { appKey: env.ZOOM_CLIENT_ID, mn, role, iat, exp, tokenExp: exp, video_webrtc_mode: 1 };
  return jwt(payload, env.ZOOM_CLIENT_SECRET);
}

function numero(v) { const mn = String(v || "").replace(/\D/g, ""); return /^\d{9,12}$/.test(mn) ? mn : ""; }

function erro(status, mensagem) { const e = new Error(mensagem); e.status = status; return e; }

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
  const assinado = await crypto.subtle.sign("HMAC", chave, enc.encode(`${cabecalho}.${corpo}`));
  return `${cabecalho}.${corpo}.${b64url(assinado)}`;
}
