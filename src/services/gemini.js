const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

export const callGemini = async (prompt) => {
  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error?.error?.message || 
      "Gemini API call failed")
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

export const buildJudgePrompt = (p1Pokemon, p2Pokemon, transcripts) => {
  return `
You are the DEBATTLE AI Judge — the most 
dramatic, fair, and entertaining battle 
commentator in existence.

You have just witnessed a fierce Pokémon 
debate between two players. 
Your job: decide who made the stronger case 
AND who would win the battle.

━━━━━━━━━━━━━━━━━━━━
PLAYER 1'S POKÉMON: ${p1Pokemon.name.toUpperCase()}
Type: ${p1Pokemon.type}
HP: ${p1Pokemon.stats.hp}
Attack: ${p1Pokemon.stats.attack}
Defense: ${p1Pokemon.stats.defense}
Special Attack: ${p1Pokemon.stats.specialAttack}
Special Defense: ${p1Pokemon.stats.specialDefense}
Speed: ${p1Pokemon.stats.speed}
Abilities: ${p1Pokemon.abilities}

PLAYER 1 OPENING ARGUMENT:
"${transcripts.p1Opening}"

PLAYER 1 DEBATE ARGUMENT:
"${transcripts.p1Debate}"

━━━━━━━━━━━━━━━━━━━━
PLAYER 2'S POKÉMON: ${p2Pokemon.name.toUpperCase()}
Type: ${p2Pokemon.type}
HP: ${p2Pokemon.stats.hp}
Attack: ${p2Pokemon.stats.attack}
Defense: ${p2Pokemon.stats.defense}
Special Attack: ${p2Pokemon.stats.specialAttack}
Special Defense: ${p2Pokemon.stats.specialDefense}
Speed: ${p2Pokemon.stats.speed}
Abilities: ${p2Pokemon.abilities}

PLAYER 2 OPENING ARGUMENT:
"${transcripts.p2Opening}"

PLAYER 2 DEBATE ARGUMENT:
"${transcripts.p2Debate}"

━━━━━━━━━━━━━━━━━━━━
YOUR RULING MUST BE A JSON OBJECT.
Return ONLY this JSON, nothing else,
no markdown, no backticks:

{
  "winner": "player1" or "player2",
  "winnerPokemon": "name of winning pokemon",
  "verdict": "2-3 sentences. Dramatic. Like a boxing commentator announcing the winner. Reference specific things players said.",
  "player1Feedback": "One sentence. Acknowledge their strongest point from the debate.",
  "player2Feedback": "One sentence. Acknowledge their strongest point from the debate.",
  "finishingMove": "A creative made-up move name that sealed the victory. Like 'Charizard's Inferno Verdict'.",
  "marginOfVictory": "close" or "dominant",
  "keyFactor": "One short phrase — the single thing that decided the battle. Like 'Superior Speed'."
}
  `
}
