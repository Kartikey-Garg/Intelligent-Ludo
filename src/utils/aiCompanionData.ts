import { PlayerColor, AIPersonality, AIDifficulty } from '../types/ludo';

export const AI_PERSONALITIES: Record<PlayerColor, AIPersonality> = {
  RED: {
    id: 'red_agent',
    name: 'Sunny',
    avatar: '🌞',
    title: 'Friendly Companion',
    greeting: "Hello there! Ready for a fun, relaxing game of Ludo? Let's enjoy!",
    difficulty: 'FRIENDLY'
  },
  GREEN: {
    id: 'green_agent',
    name: 'Captain Swift',
    avatar: '🦊',
    title: 'Tactical Specialist',
    greeting: "Ahoy! Let's see who can maneuver their tokens into home first!",
    difficulty: 'STRATEGIC'
  },
  YELLOW: {
    id: 'yellow_agent',
    name: 'Professor Ludo',
    avatar: '👴',
    title: 'Grandmaster AI',
    greeting: "Greetings! A game of strategy keeps the mind sharp and young. Let us play!",
    difficulty: 'GRANDMASTER'
  },
  BLUE: {
    id: 'blue_agent',
    name: 'Buddy',
    avatar: '🐶',
    title: 'Playful Agent',
    greeting: "Woof woof! Let's roll some sixes today!",
    difficulty: 'FRIENDLY'
  }
};

export const BANTER_RESPONSES = {
  ROLL_SIX: [
    "A 6! Fantastic luck! 🎉",
    "Wow, a 6! Unlocking token now!",
    "Bingo! A 6 gives an extra roll!"
  ],
  CAPTURE: [
    "Ooh! Good catch! Back to the yard! ⚔️",
    "Nice capture! That gives a bonus turn!",
    "Strategically played! Sending token home!"
  ],
  SAFE_LANDING: [
    "Phew! Safely parked on the Star square! ⭐",
    "Smart move landing on the safe spot!",
    "Protected on the star! Safe from captures."
  ],
  HOME: [
    "Hooray! Another token reached Home! 🏆",
    "Awesome! Token made it safely home!",
    "One step closer to victory!"
  ],
  HUMAN_GOOD_MOVE: [
    "Great move! You're playing so well!",
    "Ah, impressive strategy! I need to be careful!",
    "Nice one! That was a smart decision!"
  ]
};

/**
 * Text to Speech Voice Synthesizer using Web Speech API
 */
export function speakText(text: string, enabled: boolean) {
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    // Ignore speech errors gracefully
  }
}
