# Sala de aula ao vivo · MBA Gestão Estratégica de Valor

Página que abre a reunião do Zoom dentro do navegador, com áudio, vídeo, chat, reações e compartilhamento de tela, para uso na Pionira.

## Endereço

https://ginoterentimjr.github.io/sala-mba/

Parâmetros opcionais do endereço, que têm prioridade sobre o `config.js`:

| Parâmetro | Uso | Exemplo |
|---|---|---|
| `mn` | número da reunião (só dígitos) | `?mn=81234567890` |
| `pwd` | senha da reunião | `&pwd=abc123` |
| `titulo` | título exibido na antessala | `&titulo=Aula%203` |
| `quando` | data e horário exibidos | `&quando=Sábado,%209h` |

## Arquivos

- `index.html`: antessala no padrão do MBA e carregamento do Zoom Meeting SDK (Client View).
- `config.js`: endereço do serviço de assinatura, Client ID e reunião padrão.
- `assets/`: logotipo e ícone.
- `worker/assinatura-zoom.js`: código do Cloudflare Worker `sala-mba-assinatura`, que gera a assinatura com papel de participante. O Client Secret fica apenas nas variáveis do Worker, nunca neste repositório.
