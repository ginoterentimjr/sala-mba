// Configuração da sala de aula ao vivo.
// Edite só os valores entre aspas. Os parâmetros do endereço (?marca=...&mn=...&pwd=...&titulo=...&quando=...) têm prioridade sobre estes.
// Nome e e-mail do aluno chegam pelo fragmento do endereço: #nome=...&email=...
window.SALA = {
  // Endereço do Cloudflare Worker que gera a assinatura do Zoom (veja a especificação de implantação).
  assinatura: "https://sala-mba-assinatura.gino-bd3.workers.dev",

  // Client ID do app Meeting SDK no Zoom Marketplace. Pode ficar público: o segredo fica só no Worker.
  clientId: "yuecRhsgQFKht_XitDDt5Q",

  // Reunião padrão: número (só dígitos) e senha da reunião.
  reuniao: "",
  senha: "",

  // Marca padrão da página: "mba" (MBA Gestão Estratégica de Valor) ou "rl" (Gino Terentim · Rethinking Learning).
  // O parâmetro ?marca= do endereço tem prioridade.
  marca: "mba",

  // Textos da página.
  titulo: "Aula ao vivo",
  quando: "",

  // Idioma da interface do Zoom.
  idioma: "pt-PT",

  // Versão do Meeting SDK do Zoom.
  versaoSdk: "6.10.0"
};
