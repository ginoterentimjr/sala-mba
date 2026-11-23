# Sala de aula ao vivo · MBA Gestão Estratégica de Valor

Página que abre a reunião do Zoom dentro do navegador, com áudio, vídeo, chat, reações e compartilhamento de tela, para uso na Pionira.

## Endereço

https://ginoterentimjr.github.io/sala-mba/

Parâmetros opcionais do endereço, que têm prioridade sobre o `config.js`:

| Parâmetro | Uso | Exemplo |
|---|---|---|
| `marca` | `mba` (padrão) ou `rl` (Gino Terentim · Rethinking Learning) | `?marca=rl` |
| `mn` | número da reunião (só dígitos) | `?mn=81234567890` |
| `pwd` | senha da reunião | `&pwd=abc123` |
| `titulo` | título exibido na antessala | `&titulo=Aula%203` |
| `quando` | data e horário exibidos | `&quando=Sábado,%209h` |

Nome e e-mail do aluno logado vão no fragmento do endereço, que não é enviado a nenhum servidor: `#nome=Maria%20Clara%20Souza&email=maria%40exemplo.com.br`. Com o nome presente, o aluno entra com um clique.

## Arquivos

- `index.html`: antessala nas duas marcas (MBA e Rethinking Learning) e carregamento do Zoom Meeting SDK (Client View).
- `config.js`: endereço do serviço de assinatura, Client ID, marca padrão e reunião padrão.
- `assets/`: logotipo e ícone.
- `worker/assinatura-zoom.js`: código do Cloudflare Worker `sala-mba-assinatura`, que gera a assinatura com papel de participante. O Client Secret fica apenas nas variáveis do Worker, nunca neste repositório.

## Sala de reuniões (`reunioes/`)

https://ginoterentimjr.github.io/sala-mba/reunioes/

Página de Gino Terentim · Rethinking Learning para conduzir reuniões no Zoom dentro do navegador, com papel de anfitrião, transcrição ao vivo, marcação de momentos importantes, anotações no minuto da conversa e o documento "Transcrição com anotações" (PDF, Word, texto e dados).

- `reunioes/index.html`: antessala (entrada com a conta do Zoom, agenda, reunião imediata, acompanhamento de reunião em outro aplicativo), painel de transcrição e anotações, e geração do documento.
- `reunioes/zoom.html`: quadro com o Zoom Meeting SDK (client view), que devolve as legendas ao painel.
- `reunioes/config.js`: endereço do serviço, Client ID e versão do SDK.
- `worker/assinatura-zoom.js`: as rotas `/anfitriao/*` conferem a identidade no Zoom (OAuth) e só atendem as contas listadas na variável `ANFITRIOES`.

No app do Zoom ("Pionira Live"), o endereço acima precisa estar em Redirect URL e na lista de endereços permitidos, com os escopos de usuário, ZAK e reuniões.
