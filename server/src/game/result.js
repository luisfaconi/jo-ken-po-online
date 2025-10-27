import { CHOICES } from './constants.js';

const BEATS = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper'
};

export function isValidChoice(choice) {
  return CHOICES.includes(choice);
}

export function determineRoundOutcome(choiceA, choiceB) {
  if (!isValidChoice(choiceA) || !isValidChoice(choiceB)) {
    throw new Error(`Unsupported choices: ${choiceA} vs ${choiceB}`);
  }

  if (choiceA === choiceB) {
    return { result: 'draw' };
  }

  if (BEATS[choiceA] === choiceB) {
    return { result: 'a' };
  }

  return { result: 'b' };
}
