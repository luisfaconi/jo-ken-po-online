# Jo-Ken-Po Online

Projeto full stack para um jogo **Jo-Ken-Po** (Pedra, Papel e Tesoura) com backend em Node.js e frontend em Vue 3 + Tailwind. Tudo roda em tempo real via Socket.IO e foi pensado para evoluir com facilidade.

## Arquitetura

- **Backend (`server/`)**: Express + Socket.IO cuidando do lobby, fila e salas (melhor de cinco).
- **Frontend (`client/`)**: Aplicacao Vue 3 com Vite, Tailwind e Socket.IO Client. Interface responsiva e leve.
- **Workspaces npm**: scripts centralizados no `package.json` da raiz para orquestrar cliente e servidor.

## Pre-requisitos

- Node.js 18+ (recomendado 20.x)
- npm 9+

## Instalacao

```bash
npm install
```

Esse comando instala as dependencias do servidor e do cliente.

## Ambiente

O cliente aponta por padrao para `http://localhost:4000`. Para trocar:

```bash
cd client
echo VITE_SERVER_URL=http://seu-servidor:porta > .env.local
```

## Desenvolvimento

Use dois terminais:

1. **Servidor**
   ```bash
   npm run dev:server
   ```
   Sobe o backend em `localhost:4000`.

2. **Cliente**
   ```bash
   npm run dev:client
   ```
   Abre o Vue (Vite) em `localhost:5173`.

Ou rode tudo junto a partir da raiz:

```bash
npm run dev
```

## Build de producao

```bash
npm run build
```

- `npm run build:server`: placeholder (nenhum artefato gerado).
- `npm run build:client`: gera `client/dist` (bundle Vue + Tailwind).

## Fluxo do jogo

1. Jogadores entram na fila via Socket.IO.
2. Quando dois jogadores estao prontos, o servidor cria uma sala (`GameRoom`) melhor de 5.
3. Cada rodada termina quando ambos escolhem. O servidor calcula o vencedor, atualiza o placar e emite `roundResult`.
4. A interface Vue mostra placar, escolhas, status da fila e mensagem final ao encerrar a partida.
5. Se alguem desconectar, o outro recebe `opponentLeft` e pode voltar a fila rapidamente.

## Pontos de extensao

- **Novas regras**: ajuste `server/src/game/constants.js` e os textos exibidos na UI.
- **Matchmaking / ranking**: expanda o `LobbyManager` com filtros ou pontuacao.
- **Feedback visual**: use Tailwind para criar componentes extras (historico de rodadas, chat, etc.).
- **Internacionalizacao**: centralize os textos da app Vue para trocar de idioma.

## Scripts uteis

| Comando              | Descricao                                             |
| -------------------- | ----------------------------------------------------- |
| `npm run dev`        | Roda servidor e cliente em paralelo                   |
| `npm run dev:server` | Somente backend (porta 4000)                          |
| `npm run dev:client` | Somente frontend (porta 5173)                         |
| `npm run build`      | Build (Vue + placeholder backend)                     |
| `npm run start`      | Executa apenas o backend (modo producao)              |

---

Duvidas, bugs ou ideias? Abra uma issue ou continue a conversa. Bons duelos!
