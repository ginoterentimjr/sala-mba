// Configuração da sala de aula ao vivo.
// Edite só os valores entre aspas. Os parâmetros do endereço (?mn=...&pwd=...&titulo=...) têm prioridade sobre estes.
window.SALA = {
  // Endereço do Cloudflare Worker que gera a assinatura do Zoom (veja o guia de instalação).
  assinatura: "https://sala-mba-assinatura.gino-bd3.workers.dev",

  // Client ID do app Meeting SDK no Zoom Marketplace. Pode ficar público: o segredo fica só no Worker.
  clientId: "yuecRhsgQFKht_XitDDt5Q",

  // Reunião padrão: número (só dígitos) e senha da reunião.
  reuniao: "",
  senha: "",

  // Textos da página.
  titulo: "Aula ao vivo",
  disciplina: "MBA Gestão Estratégica de Valor",
  quando: "",

  // Idioma da interface do Zoom.
  idioma: "pt-PT",

  // Versão do Meeting SDK do Zoom.
  versaoSdk: "6.10.0"
};
