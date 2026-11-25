# Sala de aula ao vivo: correções, novidades e ajustes na Pionira

**Para:** Victor Miguez
**Data:** 25 de novembro de 2026
**Página dos alunos:** https://ginoterentimjr.github.io/sala-mba/
**Versão em validação:** https://ginoterentimjr.github.io/sala-mba/sala-teste.html
**Repositório:** `ginoterentimjr/sala-mba` (arquivos `index.html`, `sala-teste.html`, `aula/zoom.html`, `config.js`, pasta `fundos/`)

## 1. Resumo

| Item | Situação | Ação na Pionira |
|---|---|---|
| Lista de fundos de tela vazia no Zoom | Corrigido e publicado | Nenhuma |
| Fundos do MBA na lista do Zoom (36 imagens) | Publicado | Nenhuma |
| Imagem própria do aluno como fundo | Publicado | Nenhuma |
| Caderno da Aula (marcações, anotações, resumo dos últimos minutos, PDF pessoal) | Em validação | Nenhuma |
| Fila de mãos levantadas, com painel do professor | Em validação | Opcional: link do painel no Admin (seção 4.3) |
| Tela de espera com imagem da aula | Em validação | Campo "Imagem de espera" no Admin (seção 4.1) |
| Registro de presença | Em validação | Endereço que recebe a presença e identificação do aluno (seção 4.2) |
| Endereço de retorno do app Zoom "Pionira Live" | Alterado | Conferir o ambiente local (seção 5) |

Nenhum parâmetro existente mudou. O endereço que a Pionira monta hoje continua funcionando sem alteração. Os parâmetros novos descritos na seção 4 são definitivos: a validação em andamento trata do comportamento da página, e não do contrato com a Pionira.

## 2. O que foi corrigido

**Sintoma.** Na aula, em Vídeo, Escolher plano de fundo, a lista aparecia vazia. Só o desfoque funcionava.

**Causa.** A página tinha uma regra de estilo geral (`*{box-sizing:border-box;min-width:0}`) e regras por elemento (`button`, `input`, `label`) que alcançavam também as telas do Zoom. As miniaturas dos fundos ficavam com 3 pixels de largura.

**Correção.** As regras da antessala passaram a valer só dentro de `.antessala`. Na versão em validação, o Zoom fica em um quadro próprio (`aula/zoom.html`), sem nenhuma interferência de estilo da página.

## 3. O que há de novo, sem ação da Pionira

**Fundos do MBA.** A lista do Zoom traz o desfoque e 36 fundos do MBA, em três grupos: Elegante (17), Divertido (3) e Frase (16). As imagens ficam em `fundos/` e a relação em `fundos/lista.js`. Para incluir ou retirar um fundo, basta editar esse arquivo.

**Imagem própria.** Na antessala, o botão "Usar minha imagem" aceita JPG ou PNG de até 12 MB. O arquivo fica só no navegador do aluno e entra como primeira opção da lista.

**Caderno da Aula** (versão em validação). Painel ao lado do Zoom, pessoal de cada aluno:
- "Marcar este momento" (Alt + M) guarda os últimos 30 segundos de falas, com o horário;
- anotações próprias (Alt + N);
- "O que eu perdi?" mostra o que foi dito nos últimos 2, 5 ou 10 minutos;
- pausa automática quando o aluno entra em sala simultânea, e retomada na volta à sala principal;
- PDF pessoal no padrão do MBA, gerado no navegador;
- os cadernos ficam guardados no navegador do aluno (até 30) e podem ser reabertos na antessala, em "Meus cadernos".

O caderno registra as legendas do Zoom; por isso as legendas precisam estar ativas na reunião. Nada do caderno sai do navegador do aluno.

**Fila de mãos levantadas** (versão em validação). Aba do painel com as mãos levantadas na ordem de chegada, lida a cada segundo e meio a partir dos dados do próprio Zoom. O botão do painel levanta e baixa a mão do aluno. O professor pode abrir o modo painel (`?modo=painel`): a página entra sem câmera e sem microfone, com o nome "Fila de perguntas", e mostra só a fila, em letra grande.

**Tela de espera** (versão em validação). Quando o aluno entra antes de o professor abrir a sala, a página cobre a espera do Zoom com uma imagem em tela cheia, o título da aula e a mensagem de entrada automática. A entrada acontece sozinha quando a reunião começa. Se o Zoom recusar a entrada por a reunião não ter começado, a página tenta de novo a cada 20 segundos, por até 90 minutos.

**Limites do Zoom para páginas.**
- A lista de fundos é entregue ao Zoom na entrada. Para trocar a imagem própria durante a aula, o aluno recarrega a página.
- Fundos e caderno dependem de Chrome ou Edge no computador.
- A cada passagem por sala simultânea, o Zoom atribui ao participante uma identificação nova. A página usa a identificação permanente (`participantUUID`) para manter a fila estável.

## 4. Ajustes na Pionira

### 4.1 Campo "Imagem de espera"

**No Admin da aula**
- Novo campo opcional "Imagem de espera", ao lado do número da reunião.
- Envio de arquivo JPG ou PNG. Recomendação exibida ao professor: 1920 x 1080 pixels (16:9), até 2 MB.
- O arquivo fica no armazenamento da Pionira, em endereço público `https`.

**No endereço da sala.** Quando a aula tiver imagem definida, a Pionira acrescenta o parâmetro `espera`, com o endereço completo da imagem codificado por `encodeURIComponent`:

```
https://ginoterentimjr.github.io/sala-mba/?mn=NUMERO&pwd=SENHA&titulo=TITULO&quando=QUANDO&espera=ENDERECO_DA_IMAGEM#nome=NOME&email=EMAIL&aluno=TOKEN
```

Sem o parâmetro, vale a imagem padrão do MBA. A página aceita só endereços `https`. A imagem ocupa a tela inteira, com recorte centralizado, e o título fica em uma faixa no quinto inferior.

**Critérios de aceite**
1. Aula com imagem definida: ao entrar antes do início, o aluno vê a imagem escolhida e o título da aula.
2. Aula sem imagem definida: o aluno vê a imagem padrão do MBA.
3. Ao iniciar a reunião, o aluno em espera entra sem clicar.
4. Endereços de aula já emitidos continuam funcionando.

### 4.2 Registro de presença

**O que a página envia.** Uma requisição `POST` a cada evento: `entrada`, `pulso` (a cada 5 minutos) e `saida` (também ao fechar a aba). O corpo é JSON enviado como texto (`Content-Type: text/plain;charset=UTF-8`), para dispensar a verificação prévia de CORS e permitir o envio ao fechar a página (`navigator.sendBeacon`):

```json
{
  "versao": 1,
  "evento": "entrada",
  "momento": "2026-11-25T22:03:11.000Z",
  "sessao": "identificador aleatório da aba",
  "reuniao": "9924119720",
  "titulo": "Valor em Projetos",
  "aluno": { "nome": "Nome do aluno", "email": "aluno@empresa.com.br", "token": "TOKEN" },
  "minutosConectado": 42,
  "salasSimultaneas": 1,
  "maosLevantadas": 2,
  "momentosMarcados": 5,
  "anotacoes": 3
}
```

O conteúdo das anotações e das falas nunca é enviado: só as quantidades.

**O que a Pionira precisa fazer**
1. Criar o endereço que recebe a presença (por exemplo, `https://api.pionira.tec.br/aulas/presenca`), aceitando `POST` com corpo de texto contendo JSON, vindo da origem `https://ginoterentimjr.github.io`.
2. Incluir no fragmento do endereço da sala o parâmetro `aluno`, com um token assinado pela Pionira (sugestão: JWT HS256 com a identificação do aluno, a identificação da aula e validade de 24 horas). O fragmento (`#...`) não vai a nenhum servidor no carregamento da página.
3. Validar o token em cada requisição e usar dele a identificação do aluno; nome e e-mail do corpo servem só para exibição.
4. Consolidar por `sessao`: a última requisição de cada sessão traz o tempo conectado acumulado. Um aluno pode ter mais de uma sessão na mesma aula (recarregou a página, trocou de computador).
5. Informar o endereço criado para que ele entre em `config.js`, no campo `presenca`. Enquanto o campo estiver vazio, a página não envia nada.

Com o campo preenchido, a antessala passa a exibir ao aluno: "A Pionira registra a sua presença nesta aula: entrada, saída e tempo conectado. As anotações do caderno não são enviadas."

**Critérios de aceite**
1. Entrada, pulsos e saída de um aluno de teste aparecem na Pionira, na aula correta.
2. Requisição com token inválido ou vencido é recusada.
3. O tempo conectado consolidado bate com o tempo real de permanência, com tolerância de 5 minutos.

### 4.3 Painel do professor (opcional)

No Admin da aula, um link "Painel de mãos levantadas" com o endereço da sala acrescido de `&modo=painel`, sem o parâmetro `aluno`. O professor abre esse link em uma segunda janela, ao lado do Zoom.

## 5. Mudança no app Zoom "Pionira Live"

O app (General app, em desenvolvimento) recebeu ajustes para a sala de reuniões do Gino, que usa o mesmo app:

- **Endereço de retorno do OAuth:** `http://localhost:3000/zoom/oauth/callback` foi trocado por `http://127.0.0.1:3000/zoom/oauth/callback`, porque o Zoom deixou de aceitar `localhost` ao salvar a lista. Quem usa o fluxo OAuth em ambiente local deve abrir o endereço com `127.0.0.1`.
- **Lista de endereços permitidos:** inclusão de `https://ginoterentimjr.github.io/sala-mba/reunioes/`. Os endereços da Pionira foram mantidos.
- **Escopos acrescentados:** `user:read:zak`, `user:read:user`, `meeting:read:list_upcoming_meetings`, `meeting:read:meeting`, `meeting:write:meeting`.

O serviço de assinatura (`sala-mba-assinatura`, no Cloudflare) manteve o comportamento da rota usada pela sala de aula.
