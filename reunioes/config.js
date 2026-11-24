// Configuração da sala de reuniões de Gino Terentim.
window.REUNIOES = {
  // Cloudflare Worker que confere a identidade no Zoom e gera a assinatura e o token de anfitrião.
  servico: "https://sala-mba-assinatura.gino-bd3.workers.dev",

  // Client ID do app "Pionira Live" no Zoom Marketplace. Pode ficar público: o segredo fica só no Worker.
  clientId: "yuecRhsgQFKht_XitDDt5Q",

  // Idioma da interface do Zoom e versão do Meeting SDK.
  idioma: "pt-PT",
  versaoSdk: "6.10.0",

  // Segundos anteriores ao clique que o botão "Marcar este momento" destaca na transcrição.
  janelaDestaque: 30,

  // Aviso enviado no chat da reunião quando a transcrição começa (reuniões conduzidas como anfitrião).
  avisoTranscricao: "Aviso: esta reunião está sendo transcrita para o registro da ata. Quem preferir que algum trecho fique fora do registro pode avisar a qualquer momento."
};
