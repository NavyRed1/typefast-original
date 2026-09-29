import type { Difficulty, TextStyle } from './types';
import type { Rng } from './rng';

/** Word lists and sentence pools. Everything is plain ASCII so any keyboard layout can type it. */
export const EASY_WORDS = (
  'the be to of and a in that have it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us ' +
  'sword shield quest dragon magic castle forest gold flame storm hero potion crown tower ghost arrow spell knight cave river stone night light dark fire ice wind'
).split(' ');

export const MEDIUM_SENTENCES = [
  'The old bridge creaks whenever the wind blows across the river.',
  'A small fox slipped quietly through the tall golden grass.',
  'Every morning the baker opens the shop before the sun rises.',
  'We packed our bags and walked toward the mountains at dawn.',
  'The lantern flickered as the traveler entered the silent cave.',
  'She found a hidden door behind the dusty bookshelf.',
  'Rain tapped against the window while the fire crackled softly.',
  'The knight raised his shield and stepped into the dark forest.',
  'A gentle breeze carried the smell of fresh bread through the village.',
  'Please close the gate behind you so the sheep stay inside.',
  'The market was busy with merchants shouting about their finest goods.',
  'Our journey begins at the edge of the map where the road ends.',
  'He counted the silver coins twice before hiding them under the floor.',
  'The river sparkled in the light of the rising moon.',
  'Nobody in the tavern noticed the stranger slip out the back door.',
  'A tiny spark jumped from the campfire and landed in the grass.',
  'The wizard tapped his staff and the lanterns glowed all at once.',
  'They followed the trail of muddy footprints to the old mill.',
  'Fresh snow covered the rooftops and turned the whole town quiet.',
  'The map showed three paths, but only one led to the castle.',
  'Keep your eyes on the road and your hands steady on the reins.',
  'The blacksmith hammered the glowing metal until it took a sharp edge.',
  'Birds scattered from the trees as the distant bell began to ring.',
  'I would rather walk ten miles than wait here for another hour.',
  'The library was so quiet that every footstep echoed off the walls.',
  'A friendly merchant offered us water, bread, and a little advice.',
  'Deep below the mountain, crystals hummed with a soft blue light.',
  'The little boat rocked gently as the tide pulled it away from shore.',
  'Practice a little every day and your fingers will remember the rest.',
  'The archer drew back the string and held her breath for a moment.',
];

export const HARD_SENTENCES = [
  "The archaeologist meticulously catalogued each fragile artifact before the expedition's departure.",
  "Nevertheless, the council's decision was unanimous, and the treaty was ratified without hesitation.",
  'Bioluminescent organisms illuminated the subterranean cavern with an otherworldly turquoise radiance.',
  "The cartographer's ambitious atlas depicted uncharted archipelagos beyond the known horizon.",
  'Perseverance and meticulous preparation distinguish extraordinary adventurers from merely enthusiastic travelers.',
  "A labyrinthine network of tunnels concealed the sorcerer's legendary, long-forgotten laboratory.",
  'The physician diagnosed a peculiar fever caused by an exceptionally rare mountain fungus.',
  'Astronomers discovered that the luminous constellation was gradually drifting toward the eastern horizon.',
  'Her eloquent speech persuaded the skeptical assembly to reconsider the controversial proposal.',
  'Mechanical contraptions whirred and clattered throughout the workshop of the eccentric inventor.',
  'The voyage required exceptional navigation, considerable patience, and an unwavering sense of direction.',
  'Enchanted manuscripts, hidden beneath centuries of dust, described a forgotten civilization.',
  'Thunderous applause echoed through the amphitheater as the champion acknowledged the jubilant crowd.',
  'Cautiously, the apprentice examined the intricate mechanism, careful not to disturb its delicate gears.',
  'An unexpected avalanche obstructed the narrow passage and forced the caravan to improvise.',
  "The diplomat's carefully worded response defused the tension between the rival kingdoms.",
  'Phosphorescent mushrooms carpeted the cavern floor, casting a shimmering glow upon the ancient murals.',
  "The chemist's experimental potion produced an astonishing, if slightly alarming, crimson vapor.",
  'Generations of blacksmiths refined this technique, preserving knowledge through apprenticeship and ritual.',
  'Extraordinary courage is often revealed in ordinary moments of quiet, relentless determination.',
  'The peculiar rhythm of the machinery suggested an intricate, deliberately concealed pattern.',
  'Explorers documented spectacular waterfalls, treacherous ravines, and mysteriously vanishing footpaths.',
];

export const EXPERT_PARAGRAPHS = [
  'Long before the kingdom had a name, travelers followed the river north until it split into a hundred silver streams. Those who chose the widest path were never seen again, but those who chose the narrowest returned with stories that no one believed.',
  'A great typist is not the one who never makes a mistake, but the one who recovers gracefully. Each error is only a brief interruption, and rhythm returns as soon as the fingers settle back into their familiar home positions.',
  'The tower had stood empty for three hundred years, yet its windows glowed every night at precisely midnight. Nobody in the village dared to investigate, until a curious apprentice climbed the stairs and discovered a room full of sleeping clocks.',
  'When the volcano finally woke, it did not roar; it hummed. The sound rolled across the valley like a slow, patient song, and every creature that heard it understood that the mountain was simply clearing its throat before speaking.',
  'Inside the vault, beneath layers of dust and forgotten spells, lay a single brass key. It opened no door in the castle, and yet the king guarded it more fiercely than his crown, for it was the only thing his grandmother had ever given him.',
  'Speed comes from accuracy, and accuracy comes from patience. Slow down until every keystroke lands cleanly, then let the tempo rise on its own, and you will be surprised at how quickly the words begin to flow.',
  "The merchant's caravan crossed the desert by night, guided by stars that shifted subtly with every season. By dawn the travelers were exhausted, but the promise of cool water and shaded gardens kept their footsteps steady.",
  'In the heart of the city, a network of glowing cables pulsed beneath the pavement like veins. Engineers claimed it carried only electricity, but the street musicians swore that on quiet nights it hummed with distant voices.',
  'Nobody remembers who built the lighthouse, and nobody remembers who lit its lamp for the first time. Sailors only know that the beam has never failed, and that every ship following it has found a safe harbor.',
  'Deep in the forest, an enormous tree grows sideways along the ground, its branches twisting into knots and archways. Children say it once tried to follow the sun, and the whole forest bent to make room for it.',
];

export const PUNCT_LINES = [
  '"Wait," she whispered; "did you hear that?"',
  'First, gather herbs; second, boil water; third, stir slowly - never quickly!',
  "It's true: the mage's staff (a gift from her master) glows when danger's near.",
  '"No!" he cried. "Don\'t touch the crystal; it\'s cursed, isn\'t it?"',
  'Elves, dwarves, and men - all fought here; few, however, survived.',
  'Her list read: bread, cheese, apples; rope, candles, chalk; and one silver key.',
  '"Well... maybe," said the wizard, "but only if you\'re careful."',
  "Attack! Defend! Retreat? Choose wisely - the clock's ticking.",
  "Is it a trap? It's hard to say (the runes are faded); we'll proceed anyway.",
  "Warning: the bridge - old, weak, and slippery - can't hold two riders.",
  '"Fire, ice, lightning: pick one," the mage sneered; "I\'ll counter it all!"',
  'Well, well, well; what have we here? A traveler - unarmed, alone, and lost.',
  "Don't panic! Breathe in, breathe out; the spell's almost done.",
  'Chapter 3: "The Long Road" - where heroes fail, and legends begin.',
];

export const SYMBOL_LINES = [
  'if (hp <= 0) { return "defeated"; }',
  'const dmg = (atk * 1.5) - def;',
  '#quest @guild $250 gold 50% off!',
  'for (let i = 0; i < 10; i++) { hit(i); }',
  '<div class="boss">[HP: 100/100]</div>',
  'user@castle.dev | *** | ~/quests/main.ts',
  'x = [1, 2, 3].map(n => n * 2);',
  '{ "hero": "kira", "level": 12, "gold": 340 }',
  'a && b || !c ? "yes" : "no"',
  'sum += arr[i] % 7; // mod seven',
  '&& || == != <= >= => ++ -- ** //',
  'C:\\games\\typequest\\save.dat',
  '+++ [ATK] ==> {crit x2} <=== ---',
  'SELECT name, hp FROM bosses WHERE hp > 500;',
];

export const SPELLS = [
  'IGNIS MAXIMA VORTEX',
  'GLACIES PROFUNDA',
  'UMBRA SERPENS ABYSSUS',
  'FULGUR TEMPESTAS',
  'TERRA MOTUS AETERNUM',
  'LUX ORIENS SANCTUS',
  'NOCTIS VELUM CADIT',
  'VENTUS CELERITAS ARDEN',
  'SANGUIS LUNA RUBRA',
  'CHRONOS STASIS FRACTUM',
  'MORS SILENTIUM',
  'DRACO FLAMMA ASCENDIT',
];

function numberToken(rng: Rng): string {
  switch (rng.int(6)) {
    case 0:
      return String(rng.range(10, 999));
    case 1:
      return String(rng.range(1000, 99999));
    case 2: {
      const a = rng.range(2, 40);
      const b = rng.range(2, 40);
      return `${a} + ${b} = ${a + b}`;
    }
    case 3:
      return `${rng.range(1, 12)}:${String(rng.range(0, 59)).padStart(2, '0')}`;
    case 4:
      return `${rng.range(1, 9)}.${rng.range(10, 999)}`;
    default:
      return `${rng.range(10, 99)}%`;
  }
}

function numbersLine(rng: Rng): string {
  const n = rng.range(4, 6);
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(numberToken(rng));
  return out.join(' ');
}

function mixedLine(rng: Rng): string {
  const w = () => rng.pick(EASY_WORDS);
  const parts: string[] = [];
  const n = rng.range(4, 5);
  for (let i = 0; i < n; i++) {
    switch (rng.int(6)) {
      case 0:
        parts.push(`${w()}: ${rng.range(1, 99)}`);
        break;
      case 1:
        parts.push(`#${rng.range(100, 999)}`);
        break;
      case 2:
        parts.push(`${w()}-${w()}!`);
        break;
      case 3:
        parts.push(`$${rng.range(1, 99)}.${String(rng.range(0, 99)).padStart(2, '0')}`);
        break;
      case 4:
        parts.push(`(${w()})`);
        break;
      default:
        parts.push(`${w()}, ${w()};`);
    }
  }
  return parts.join(' ');
}

function wordsLine(rng: Rng, count: number): string {
  const out: string[] = [];
  let prev = '';
  while (out.length < count) {
    const w = rng.pick(EASY_WORDS);
    if (w === prev) continue;
    out.push(w);
    prev = w;
  }
  return out.join(' ');
}

function pool(diff: Difficulty, rng: Rng): string {
  switch (diff) {
    case 'easy':
      return wordsLine(rng, rng.range(5, 7));
    case 'medium':
      return rng.pick(MEDIUM_SENTENCES);
    case 'hard':
      return rng.pick(HARD_SENTENCES);
    case 'expert':
      return rng.pick(EXPERT_PARAGRAPHS);
  }
}

const HARDER: Record<Difficulty, Difficulty> = { easy: 'medium', medium: 'hard', hard: 'hard', expert: 'expert' };

/** Serve a passage for a text style. Retries a few times so the same text is not served twice in a row. */
export function generatePassage(style: TextStyle, diff: Difficulty, rng: Rng, avoid = ''): string {
  for (let attempt = 0; attempt < 5; attempt++) {
    const t = build(style, diff, rng);
    if (t !== avoid) return t;
  }
  return build(style, diff, rng);
}

function build(style: TextStyle, diff: Difficulty, rng: Rng): string {
  switch (style) {
    case 'base':
      return pool(diff, rng);
    case 'accuracy':
      return pool(HARDER[diff], rng);
    case 'short':
      return wordsLine(rng, rng.range(3, 4));
    case 'long':
      return rng.pick(EXPERT_PARAGRAPHS);
    case 'punct':
      return rng.pick(PUNCT_LINES);
    case 'numbers':
      return numbersLine(rng);
    case 'symbols':
      return rng.pick(SYMBOL_LINES);
    case 'mixed':
      return mixedLine(rng);
    case 'spell': {
      if (diff === 'easy') return rng.pick(SPELLS);
      return `${rng.pick(SPELLS)} ${rng.pick(SPELLS)}`;
    }
  }
}

/** Identical text for every racer. */
export function generateRace(diff: Difficulty, rng: Rng): string {
  switch (diff) {
    case 'easy':
      return wordsLine(rng, 10);
    case 'medium':
      return `${rng.pick(MEDIUM_SENTENCES)} ${rng.pick(MEDIUM_SENTENCES)}`;
    case 'hard':
      return `${rng.pick(HARD_SENTENCES)} ${rng.pick(HARD_SENTENCES)}`;
    case 'expert':
      return rng.pick(EXPERT_PARAGRAPHS);
  }
}

/** Short word(s) used to walk through the story world. */
export function generateStep(rng: Rng): string {
  const words = EASY_WORDS.filter((w) => w.length >= 3 && w.length <= 7);
  return rng.pick(words);
}
