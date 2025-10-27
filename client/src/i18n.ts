import { computed, reactive } from 'vue';

export type LocaleCode = 'en' | 'pt' | 'es';

type Messages = Record<string, any>;

const LOCALE_STORAGE_KEY = 'jokenpo:locale';
const FALLBACK_LOCALE: LocaleCode = 'en';

const messages: Record<LocaleCode, Messages> = {
  en: {
    localeLabel: 'English',
    common: {
      awaiting: 'Waiting...',
      rock: 'Rock',
      paper: 'Paper',
      scissors: 'Scissors',
      rockShort: 'R',
      paperShort: 'P',
      scissorsShort: 'S',
      you: 'You',
      opponent: 'Opponent',
      vs: 'vs',
      round: 'Round {round}',
      score: '{you} x {opponent}',
      bestOf: 'Best of {count}',
      pointsToWin: 'First to {count} point(s) wins the battle.',
      lobby: 'Lobby',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close',
      backToLobby: 'Back to lobby',
      searchNewMatch: 'Search new match',
      enterQueue: 'Enter queue',
      return: 'Return'
    },
    status: {
      connecting: 'Connecting to the server...',
      idle: 'Ready to enter the queue.',
      queue: 'Searching for an opponent...',
      matched: 'Match is live! Make your move.',
      'opponent-left': 'Opponent left the match.',
      disconnected: 'Connection lost. Trying to recover...',
      completed: 'Match finished!',
      unknown: 'Unknown status'
    },
    info: {
      queue: 'You can cancel the search at any moment.',
      matchedIdle: 'Select Rock, Paper or Scissors to play.',
      matchedPending: 'You picked {choice}. Waiting for the opponent...',
      opponentLeft: 'Your opponent left. Click "Search new match" to return to the queue.',
      idle: 'Click "Enter queue" to challenge another player.',
      completed: 'Game over! Nice fight.',
      empty: ''
    },
    choices: {
      prompt: 'Choose your move',
      pending: 'You picked {choice}. Waiting for the opponent...'
    },
    lobby: {
      hallBadge: 'Main hall',
      headline: 'Ready for the next duel?',
      description:
        'Join the queue and let the system automatically find a rival. Once matched, you will be taken to a dedicated arena.',
      roomsLabel: 'Rooms in play',
      live: 'live',
      statusAbbrev: 'ST',
      status: 'Status',
      howAbbrev: 'HOW',
      howItWorks: 'How it works',
      bestOf: 'Best of 5 rounds',
      step1: 'Enter the queue and wait for matchmaking.',
      step2: 'Pick Rock, Paper or Scissors as soon as the round begins.',
      step3: 'The first player to reach {points} points wins the match.',
      queueList: 'Current queue: {count} player(s) waiting.',
      queueAdvice: 'Wait in the queue while we find another player.',
      queueFollowUp: 'You will jump straight to the arena when a room opens.',
      roomId: 'Identifier: {id}',
      opponentLabel: 'Opponent: {label}',
      fastRounds: 'Short rounds, fast pace.'
    },
    queueOverlay: {
      searching: 'Searching for an opponent',
      headline: 'Hang tight! We are finding the perfect table.',
      players: 'Players in queue: {count}. Once someone accepts, you will join the arena automatically.',
      meanwhile: 'Meanwhile:',
      tipConnection: 'Check that your connection is stable.',
      tipStrategy: 'Review your go-to strategy quickly.',
      tipCancel: 'Cancel and come back later if you prefer.',
      cancel: 'Cancel search'
    },
    opponentOverlay: {
      eyebrow: 'Opponent disconnected',
      headline: 'Your rival left the match.',
      note:
        'The room was closed so you do not get stuck waiting. You keep your points and can requeue at any moment.',
      back: 'Back to lobby'
    },
    game: {
      room: 'Room #{code}',
      roomsOnline: '{count} room{suffix} playing now',
      format: 'Format',
      status: 'Status',
      round: 'Round',
      waitingFirstRound: 'Waiting for the first round...',
      roomInfoTitle: 'Room',
      roomId: 'Identifier: {id}',
      opponent: 'Opponent: {label}',
      fastNote: 'Short rounds, fast rhythm.',
      pointer: 'Your turn!',
      roundResult: {
        win: 'You won the round',
        lose: 'You lost the round',
        draw: 'Draw'
      },
      currentRound: 'Current round: {current} / {total}'
    },
    roundSummary: {
      youPlayed: 'You played <strong>{you}</strong> and the opponent <strong>{opponent}</strong>.',
      scoreboard: {
        you: 'You',
        opponent: 'Opponent'
      },
      win: {
        badge: 'Round win',
        title: 'You won this round!',
        noteFinish: 'Match is heading to the final result.',
        noteOnePoint: 'Only 1 point left to win!',
        noteMany: '{count} point(s) to go to close the game.',
        actionMatchPoint: 'See final score',
        actionContinue: 'Next round'
      },
      lose: {
        badge: 'Round lost',
        title: 'The point went to your rival.',
        noteMatchPoint: 'They can finish the match next round. React fast!',
        noteKeepAlive: 'You must respond now to stay alive.',
        noteDefault: 'You can still turn it around: {count} point(s) from victory.',
        action: 'Answer next round'
      },
      draw: {
        badge: 'Draw',
        title: 'Balanced round.',
        note: 'Everything is open. Adjust your plan and try again.',
        action: 'Repeat round'
      },
      continue: 'Continue'
    },
    matchSummary: {
      win: 'Victory!',
      lose: 'Defeat',
      finalScore: 'Final score: You {you} x {opponent} Opponent',
      bestOf: 'Best of {count} - returning to the lobby shortly...',
      backNow: 'Return now'
    },
    errors: {
      reconnecting: 'Still connecting to the server.',
      connectionLost: 'Connection to the server was lost.',
      matchRunning: 'You are already in a match.',
      timeout: 'Time is up. Round restarted.'
    },
    language: {
      label: 'Language',
      english: 'English',
      portuguese: 'Portugues',
      spanish: 'Espanol'
    }
  },
  pt: {
    localeLabel: 'Portugues',
    common: {
      awaiting: 'Aguardando...',
      rock: 'Pedra',
      paper: 'Papel',
      scissors: 'Tesoura',
      rockShort: 'R',
      paperShort: 'P',
      scissorsShort: 'S',
      you: 'Voce',
      opponent: 'Oponente',
      vs: 'vs',
      round: 'Rodada {round}',
      score: '{you} x {opponent}',
      bestOf: 'Melhor de {count}',
      pointsToWin: 'Primeiro a {count} ponto(s) vence a batalha.',
      lobby: 'Lobby',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      close: 'Fechar',
      backToLobby: 'Voltar ao lobby',
      searchNewMatch: 'Buscar nova partida',
      enterQueue: 'Entrar na fila',
      return: 'Voltar'
    },
    status: {
      connecting: 'Conectando ao servidor...',
      idle: 'Pronto para entrar na fila.',
      queue: 'Procurando adversario...',
      matched: 'Partida ativa! Faca sua jogada.',
      'opponent-left': 'Oponente saiu da partida.',
      disconnected: 'Conexao perdida. Tentando recuperar...',
      completed: 'Partida concluida!',
      unknown: 'Status desconhecido'
    },
    info: {
      queue: 'Voce pode cancelar a busca a qualquer momento.',
      matchedIdle: 'Selecione Pedra, Papel ou Tesoura para jogar.',
      matchedPending: 'Voce escolheu {choice}. Aguardando o oponente...',
      opponentLeft: 'Seu oponente saiu. Clique em "Buscar nova partida" para voltar a fila.',
      idle: 'Clique em "Entrar na fila" para desafiar outro jogador.',
      completed: 'Fim de jogo! Parabens pela partida.',
      empty: ''
    },
    choices: {
      prompt: 'Escolha sua jogada',
      pending: 'Voce escolheu {choice}. Aguardando o oponente...'
    },
    lobby: {
      hallBadge: 'Hall principal',
      headline: 'Pronto para o proximo duelo?',
      description:
        'Entre na fila e deixe o sistema encontrar automaticamente um adversario. Assim que parear, voce vai direto para a arena.',
      roomsLabel: 'Salas em jogo',
      live: 'ao vivo',
      statusAbbrev: 'ST',
      status: 'Status',
      howAbbrev: 'COM',
      howItWorks: 'Como funciona',
      bestOf: 'Partidas melhor de 5',
      step1: 'Entre na fila e aguarde o pareamento.',
      step2: 'Escolha Pedra, Papel ou Tesoura assim que a rodada abrir.',
      step3: 'Quem fizer {points} pontos primeiro vence a partida.',
      queueList: 'Fila atual: {count} jogador(es) aguardando.',
      queueAdvice: 'Aguarde na fila enquanto encontramos outro jogador.',
      queueFollowUp: 'Assim que a sala abrir, voce segue direto para a arena.',
      roomId: 'Identificador: {id}',
      opponentLabel: 'Oponente: {label}',
      fastRounds: 'Rodadas curtas, ritmo acelerado.'
    },
    queueOverlay: {
      searching: 'Buscando adversario',
      headline: 'Aguente firme! Estamos encontrando a melhor mesa.',
      players: 'Jogadores na fila: {count}. Assim que um oponente aceitar, voce vai direto para a arena.',
      meanwhile: 'Enquanto isso:',
      tipConnection: 'Verifique se sua conexao esta estavel.',
      tipStrategy: 'Recapitule rapidamente sua estrategia favorita.',
      tipCancel: 'Se preferir, cancele e volte mais tarde.',
      cancel: 'Cancelar busca'
    },
    opponentOverlay: {
      eyebrow: 'Oponente desconectado',
      headline: 'Seu adversario saiu da partida.',
      note:
        'A sala foi encerrada para voce nao ficar esperando. Nenhum ponto foi perdido e voce pode voltar a fila quando quiser.',
      back: 'Voltar ao lobby'
    },
    game: {
      room: 'Sala #{code}',
      roomsOnline: '{count} sala{suffix} em jogo agora',
      format: 'Formato',
      status: 'Status',
      round: 'Rodada',
      waitingFirstRound: 'Aguardando a primeira rodada...',
      roomInfoTitle: 'Sala',
      roomId: 'Identificador: {id}',
      opponent: 'Oponente: {label}',
      fastNote: 'Rodadas curtas, ritmo acelerado.',
      pointer: 'Sua vez!',
      roundResult: {
        win: 'Voce venceu a rodada',
        lose: 'Voce perdeu a rodada',
        draw: 'Empate'
      },
      currentRound: 'Rodada atual: {current} / {total}'
    },
    roundSummary: {
      youPlayed: 'Voce jogou <strong>{you}</strong> e o oponente <strong>{opponent}</strong>.',
      scoreboard: {
        you: 'Voce',
        opponent: 'Oponente'
      },
      win: {
        badge: 'Vitoria na rodada',
        title: 'Voce venceu esta disputa!',
        noteFinish: 'Partida encaminhada para o resultado final.',
        noteOnePoint: 'Falta apenas 1 ponto para vencer!',
        noteMany: 'Faltam {count} ponto(s) para fechar o jogo.',
        actionMatchPoint: 'Ver placar final',
        actionContinue: 'Proxima rodada'
      },
      lose: {
        badge: 'Rodada perdida',
        title: 'O ponto ficou com o adversario.',
        noteMatchPoint: 'O oponente pode decidir na proxima. Reaja rapido!',
        noteKeepAlive: 'Voce precisa responder agora para manter a disputa viva.',
        noteDefault: 'Ainda da para virar: faltam {count} ponto(s) para alcancar a vitoria.',
        action: 'Responder na proxima'
      },
      draw: {
        badge: 'Empate',
        title: 'Rodada equilibrada.',
        note: 'Tudo em aberto. Ajuste a estrategia e tente novamente.',
        action: 'Repetir rodada'
      },
      continue: 'Continuar'
    },
    matchSummary: {
      win: 'Vitoria!',
      lose: 'Derrota',
      finalScore: 'Placar final: Voce {you} x {opponent} Oponente',
      bestOf: 'Melhor de {count} - retornando ao lobby em instantes...',
      backNow: 'Voltar agora'
    },
    errors: {
      reconnecting: 'Ainda conectando ao servidor.',
      connectionLost: 'Conexao com o servidor perdida.',
      matchRunning: 'Voce ja esta em uma partida.',
      timeout: 'Tempo esgotado. Rodada reiniciada.'
    },
    language: {
      label: 'Idioma',
      english: 'Ingles',
      portuguese: 'Portugues',
      spanish: 'Espanhol'
    }
  },
  es: {
    localeLabel: 'Espanol',
    common: {
      awaiting: 'Esperando...',
      rock: 'Piedra',
      paper: 'Papel',
      scissors: 'Tijera',
      rockShort: 'R',
      paperShort: 'P',
      scissorsShort: 'S',
      you: 'Tu',
      opponent: 'Oponente',
      vs: 'vs',
      round: 'Ronda {round}',
      score: '{you} x {opponent}',
      bestOf: 'Mejor de {count}',
      pointsToWin: 'El primero a {count} punto(s) gana la batalla.',
      lobby: 'Lobby',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      close: 'Cerrar',
      backToLobby: 'Volver al lobby',
      searchNewMatch: 'Buscar nueva partida',
      enterQueue: 'Entrar a la cola',
      return: 'Volver'
    },
    status: {
      connecting: 'Conectando al servidor...',
      idle: 'Listo para entrar a la cola.',
      queue: 'Buscando oponente...',
      matched: 'Partida en curso! Haz tu jugada.',
      'opponent-left': 'El oponente abandono la partida.',
      disconnected: 'Conexion perdida. Intentando recuperar...',
      completed: 'Partida finalizada!',
      unknown: 'Estado desconocido'
    },
    info: {
      queue: 'Puedes cancelar la busqueda en cualquier momento.',
      matchedIdle: 'Selecciona Piedra, Papel o Tijera para jugar.',
      matchedPending: 'Elegiste {choice}. Esperando al oponente...',
      opponentLeft: 'Tu oponente salio. Pulsa "Buscar nueva partida" para volver a la cola.',
      idle: 'Pulsa "Entrar a la cola" para desafiar a otro jugador.',
      completed: 'Fin del juego! Buena partida.',
      empty: ''
    },
    choices: {
      prompt: 'Elige tu jugada',
      pending: 'Elegiste {choice}. Esperando al oponente...'
    },
    lobby: {
      hallBadge: 'Salon principal',
      headline: 'Listo para el proximo duelo?',
      description:
        'Entra a la cola y deja que el sistema encuentre automaticamente un rival. Cuando haya match iras directo a la arena.',
      roomsLabel: 'Salas en juego',
      live: 'en vivo',
      statusAbbrev: 'ST',
      status: 'Estado',
      howAbbrev: 'COM',
      howItWorks: 'Como funciona',
      bestOf: 'Partidas mejor de 5',
      step1: 'Entra a la cola y espera el emparejamiento.',
      step2: 'Elige Piedra, Papel o Tijera apenas inicie la ronda.',
      step3: 'Quien consiga {points} puntos primero gana la partida.',
      queueList: 'Cola actual: {count} jugador(es) esperando.',
      queueAdvice: 'Espera mientras encontramos otro jugador.',
      queueFollowUp: 'Cuando abra una sala, iras directo a la arena.',
      roomId: 'Identificador: {id}',
      opponentLabel: 'Oponente: {label}',
      fastRounds: 'Rondas cortas, ritmo acelerado.'
    },
    queueOverlay: {
      searching: 'Buscando oponente',
      headline: 'Resiste! Estamos encontrando la mesa ideal.',
      players: 'Jugadores en cola: {count}. Cuando acepten el reto entraras automaticamente.',
      meanwhile: 'Mientras tanto:',
      tipConnection: 'Revisa que tu conexion sea estable.',
      tipStrategy: 'Repasa rapido tu estrategia favorita.',
      tipCancel: 'Si prefieres, cancela y vuelve luego.',
      cancel: 'Cancelar busqueda'
    },
    opponentOverlay: {
      eyebrow: 'Oponente desconectado',
      headline: 'Tu rival salio de la partida.',
      note:
        'La sala se cerro para que no quedes esperando. No pierdes puntos y puedes volver a la cola cuando quieras.',
      back: 'Volver al lobby'
    },
    game: {
      room: 'Sala #{code}',
      roomsOnline: '{count} sala{suffix} jugando ahora',
      format: 'Formato',
      status: 'Estado',
      round: 'Ronda',
      waitingFirstRound: 'Esperando la primera ronda...',
      roomInfoTitle: 'Sala',
      roomId: 'Identificador: {id}',
      opponent: 'Oponente: {label}',
      fastNote: 'Rondas cortas, ritmo veloz.',
      pointer: 'Tu turno!',
      roundResult: {
        win: 'Ganaste la ronda',
        lose: 'Perdiste la ronda',
        draw: 'Empate'
      },
      currentRound: 'Ronda actual: {current} / {total}'
    },
    roundSummary: {
      youPlayed: 'Jugaste <strong>{you}</strong> y el oponente <strong>{opponent}</strong>.',
      scoreboard: {
        you: 'Tu',
        opponent: 'Oponente'
      },
      win: {
        badge: 'Ronda ganada',
        title: 'Ganaste esta ronda!',
        noteFinish: 'La partida se acerca al final.',
        noteOnePoint: 'Solo falta 1 punto para ganar!',
        noteMany: 'Quedan {count} punto(s) para cerrar el juego.',
        actionMatchPoint: 'Ver marcador final',
        actionContinue: 'Siguiente ronda'
      },
      lose: {
        badge: 'Ronda perdida',
        title: 'El punto fue para tu rival.',
        noteMatchPoint: 'Puede definir la partida en la siguiente. Reacciona rapido!',
        noteKeepAlive: 'Debes responder ahora para seguir con vida.',
        noteDefault: 'Puedes remontar: faltan {count} punto(s) para alcanzar la victoria.',
        action: 'Responder en la siguiente'
      },
      draw: {
        badge: 'Empate',
        title: 'Ronda equilibrada.',
        note: 'Todo abierto. Ajusta el plan e intenta de nuevo.',
        action: 'Repetir ronda'
      },
      continue: 'Continuar'
    },
    matchSummary: {
      win: 'Victoria!',
      lose: 'Derrota',
      finalScore: 'Marcador final: Tu {you} x {opponent} Oponente',
      bestOf: 'Mejor de {count} - regresando al lobby en instantes...',
      backNow: 'Volver ahora'
    },
    errors: {
      reconnecting: 'Aun conectando al servidor.',
      connectionLost: 'Se perdio la conexion con el servidor.',
      matchRunning: 'Ya estas en una partida.',
      timeout: 'Tiempo agotado. Ronda reiniciada.'
    },
    language: {
      label: 'Idioma',
      english: 'Ingles',
      portuguese: 'Portugues',
      spanish: 'Espanol'
    }
  }
};

const localeOptions: Array<{ code: LocaleCode; label: string }> = [
  { code: 'pt', label: messages.pt.localeLabel },
  { code: 'en', label: messages.en.localeLabel },
  { code: 'es', label: messages.es.localeLabel }
];

const state = reactive({
  locale: detectInitialLocale()
});

function detectInitialLocale(): LocaleCode {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage?.getItem(LOCALE_STORAGE_KEY);
    if (stored && isLocale(stored)) {
      return stored;
    }

    const lang = window.navigator?.language ?? '';
    if (lang.toLowerCase().startsWith('pt')) {
      return 'pt';
    }
    if (lang.toLowerCase().startsWith('es')) {
      return 'es';
    }
  }
  return FALLBACK_LOCALE;
}

function isLocale(value: string): value is LocaleCode {
  return value === 'en' || value === 'pt' || value === 'es';
}

function resolveMessage(path: string, locale: LocaleCode): any {
  const segments = path.split('.');
  let current: any = messages[locale];

  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment];
    } else {
      current = undefined;
      break;
    }
  }

  if (current === undefined && locale !== FALLBACK_LOCALE) {
    return resolveMessage(path, FALLBACK_LOCALE);
  }

  return current;
}

function formatMessage(template: unknown, params?: Record<string, unknown>): string {
  if (typeof template !== 'string') {
    return typeof template === 'number' ? String(template) : '';
  }

  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = params[key];
    if (value === undefined || value === null) {
      return '';
    }
    return String(value);
  });
}

export function translate(path: string, params?: Record<string, unknown>): string {
  const message = resolveMessage(path, state.locale);
  return formatMessage(message, params);
}

export function setLocale(locale: LocaleCode) {
  if (!isLocale(locale)) {
    return;
  }
  state.locale = locale;
  if (typeof window !== 'undefined') {
    window.localStorage?.setItem(LOCALE_STORAGE_KEY, locale);
  }
}

export function useI18n() {
  const locale = computed(() => state.locale);
  const availableLocales = computed(() => localeOptions);

  function t(path: string, params?: Record<string, unknown>) {
    return translate(path, params);
  }

  return {
    locale,
    availableLocales,
    setLocale,
    t
  };
}

export function getLocale(): LocaleCode {
  return state.locale;
}

export function getAvailableLocales() {
  return localeOptions;
}

export type ChoiceKeyTranslation = 'rock' | 'paper' | 'scissors';

export function translateChoiceLabel(choice?: ChoiceKeyTranslation | null) {
  if (!choice) {
    return '--';
  }
  return translate(`common.${choice}`);
}

export function translateChoiceShort(choice: ChoiceKeyTranslation) {
  return translate(`common.${choice}Short`);
}
