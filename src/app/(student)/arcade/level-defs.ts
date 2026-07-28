// src/app/(student)/arcade/level-defs.ts

export interface Obstacle {
  x: number;
  type: 'hole' | 'crate' | 'water' | 'spikes' | 'enemy' | 'breakable' | 'falling';
}

export type BlockType = 
  | 'forward' 
  | 'backward' 
  | 'turn_left' 
  | 'turn_right' 
  | 'jump' 
  | 'repeat_2' 
  | 'repeat_3' 
  | 'repeat_4' 
  | 'repeat_5'
  | 'if_blocked';

export interface LevelDef {
  id: number;
  grade: number;
  name: string;
  instructions: string;
  mapLength: number;
  startPos: number;
  bananaPos: number[]; // X coordinates of bananas
  chestPos: number;
  obstacles: Obstacle[];
  allowedBlocks: BlockType[];
  maxSlots: number;
  starThresholds: number[]; // [3 stars max commands, 2 stars max commands, 1 star max commands]
}

export const GRADE_NAMES = [
  "Sequencing Basics",      // Grade 1
  "Turns & Direction",     // Grade 2
  "Jumping Heights",       // Grade 3
  "Simple Repeat Loops",   // Grade 4
  "Double Repeats",        // Grade 5
  "Multiple Bananas",      // Grade 6
  "Holes & Hazards",       // Grade 7
  "Crates & Climbs",       // Grade 8
  "Conditionals (If)",     // Grade 9
  "Nested Combinations",   // Grade 10
  "Looping Challenges",    // Grade 11
  "Master Algorithms"      // Grade 12
];

const EDUCATIONAL_LEVEL_NAMES: Record<number, string[]> = {
  2: ['Puzzle Pieces', 'Animal Match', 'Trait Match', 'Block Shapes', 'Connect Blocks', 'Picture Puzzle', 'Sequence Puzzle', 'Advanced Match', 'Puzzle Review', 'Puzzle Master'],
  3: ['First Steps', 'Turn Right', 'Repeat Moves', 'Avoid the Wall', 'Find a Shortcut', 'Nested Path', 'If Path', 'Loop Maze', 'Smart Maze', 'Maze Master'],
  4: ['Fly East', 'Fly North', 'Compare Position', 'If or Else', 'Two Conditions', 'Nested Decisions', 'Target Fruit', 'Avoid Danger', 'Complex Route', 'Bird Master'],
  5: ['Draw a Line', 'Make a Square', 'Triangle Art', 'Repeat Shape', 'Color Pattern', 'Nested Loops', 'Spiral', 'Star Design', 'Original Art', 'Turtle Master'],
  6: ['Move an Object', 'Change Size', 'Use Time', 'Coordinates', 'Animate a Line', 'Equation Motion', 'Scene Timing', 'Layered Movie', 'Original Animation', 'Movie Premiere'],
  7: ['Play a Note', 'Make a Beat', 'Repeat Rhythm', 'Musical Phrase', 'Use a Function', 'Harmony', 'Nested Music', 'Compose a Theme', 'Original Song', 'Music Master'],
  8: ['Meet the Pond', 'Blocks and Code', 'Move and Turn', 'Scan the World', 'Functions', 'Conditions', 'Variables', 'Target Practice', 'Text Transition', 'Tutor Master'],
  9: ['Pond Basics', 'Find a Target', 'Defend', 'Attack Strategy', 'Use Sensors', 'Efficient Code', 'Adaptive Strategy', 'Tournament Prep', 'Smart Duck', 'Pond Champion'],
  10: ['Choose a Sprite', 'Motion', 'Looks', 'Events', 'Sound', 'Loops', 'Variables', 'Interactions', 'Build a Game', 'Share a Project'],
  11: ['Algorithms', 'Binary Search', 'Sorting', 'Data Structures', 'Efficiency', 'Big O', 'Stacks', 'Queues', 'Recursion', 'CS Final'],
  12: ['HTML Structure', 'Formatting Text', 'Links and Images', 'CSS Styling', 'Responsive Layout', 'JavaScript Basics', 'DOM Events', 'Web Apps', 'Accessibility', 'Portfolio Website'],
};

export function getLevelsForGrade(grade: number): LevelDef[] {
  const levels: LevelDef[] = [];
  const startId = (grade - 1) * 10 + 1;

  for (let i = 0; i < 10; i++) {
    const levelNum = i + 1;
    const id = startId + i;

    // Default configuration values
    let name = `Level ${grade}-${levelNum}`;
    let instructions = "Grab the bananas and open the chest!";
    const mapLength = 12;
    let startPos = 2;
    let bananaPos: number[] = [];
    let chestPos = 8;
    let obstacles: Obstacle[] = [];
    let allowedBlocks: BlockType[] = ['forward'];
    let maxSlots = 10;
    let starThresholds = [3, 4, 6];

    // Grade-specific progression
    switch (grade) {
      case 1: // Monkey Sequencing: movement, obstacles, clouds, conditions, and loops
        allowedBlocks = ['forward', 'backward'];
        if (levelNum === 1) {
          name = "First Steps";
          instructions = "Click 'Step Forward' 3 times to reach the treasure chest!";
          startPos = 2;
          chestPos = 5;
          bananaPos = [];
          starThresholds = [3, 4, 5];
        } else if (levelNum === 2) {
          name = "The First Banana";
          instructions = "Get the banana on the way to the chest!";
          startPos = 2;
          bananaPos = [4];
          chestPos = 6;
          starThresholds = [4, 5, 6];
        } else if (levelNum === 3) {
          name = "Take a Step Back";
          instructions = "Walk backward to get the banana first, then go forward to the chest!";
          startPos = 3;
          bananaPos = [1];
          chestPos = 6;
          starThresholds = [6, 7, 8];
        } else if (levelNum === 4) {
          name = "Jump the Spikes";
          instructions = "The spikes are dangerous! Jump over them, then reach the flag.";
          startPos = 1;
          obstacles = [{ x: 2, type: 'spikes' }];
          bananaPos = [3];
          chestPos = 5;
          allowedBlocks = ['forward', 'jump'];
          maxSlots = 5;
          starThresholds = [3, 4, 5];
        } else if (levelNum === 5) {
          name = "Crate Climber";
          instructions = "Jump onto the crate, collect the banana, and continue to the flag!";
          startPos = 1;
          obstacles = [{ x: 3, type: 'crate' }];
          bananaPos = [3, 5];
          chestPos = 6;
          allowedBlocks = ['forward', 'jump'];
          maxSlots = 6;
          starThresholds = [4, 5, 6];
        } else if (levelNum === 6) {
          name = "Repeat the Route";
          instructions = "Use Repeat blocks to travel farther with fewer commands.";
          startPos = 1;
          bananaPos = [3, 5];
          chestPos = 7;
          allowedBlocks = ['forward', 'repeat_2', 'repeat_3'];
          maxSlots = 4;
          starThresholds = [2, 3, 4];
        } else if (levelNum === 7) {
          name = "Looping Jumps";
          instructions = "Three hazards, one smart loop! Set Repeat 3 to Jump, then reach the flag.";
          startPos = 1;
          obstacles = [{ x: 2, type: 'hole' }, { x: 4, type: 'water' }, { x: 6, type: 'spikes' }];
          bananaPos = [3, 5, 7];
          chestPos = 8;
          allowedBlocks = ['forward', 'jump', 'repeat_3'];
          maxSlots = 4;
          starThresholds = [2, 3, 4];
        } else if (levelNum === 8) {
          name = "Jungle Obstacle Course";
          instructions = "Leap over the crate and water, then clear the final crate before the flag.";
          startPos = 1;
          obstacles = [{ x: 2, type: 'crate' }, { x: 4, type: 'water' }, { x: 7, type: 'crate' }];
          bananaPos = [3, 5, 7];
          chestPos = 9;
          allowedBlocks = ['forward', 'jump', 'repeat_3'];
          maxSlots = 5;
          starThresholds = [3, 4, 5];
        } else if (levelNum === 9) {
          name = "Smart Monkey";
          instructions = "Use If Blocked: the monkey jumps when danger is ahead and walks when the path is clear.";
          startPos = 1;
          obstacles = [{ x: 2, type: 'crate' }, { x: 4, type: 'spikes' }, { x: 6, type: 'enemy' }];
          bananaPos = [3, 5, 7];
          chestPos = 8;
          allowedBlocks = ['forward', 'jump', 'if_blocked'];
          maxSlots = 5;
          starThresholds = [4, 5, 6];
        } else {
          name = "Monkey Sequencing Finale";
          instructions = "Combine jump loops and movement loops to cross every biome and reach the final flag!";
          startPos = 1;
          obstacles = [{ x: 2, type: 'spikes' }, { x: 4, type: 'water' }, { x: 6, type: 'enemy' }, { x: 8, type: 'hole' }, { x: 9, type: 'crate' }];
          bananaPos = [3, 5, 7, 9];
          chestPos = 11;
          allowedBlocks = ['forward', 'backward', 'jump', 'if_blocked', 'repeat_2', 'repeat_3', 'repeat_4', 'repeat_5'];
          maxSlots = 4;
          starThresholds = [2, 3, 4];
        }
        break;

      case 2: // Turns & Direction
        allowedBlocks = ['forward', 'backward', 'turn_left', 'turn_right'];
        if (levelNum === 1) {
          name = "Turn Around";
          instructions = "You are facing right, but the chest is behind you. Turn left and walk to it!";
          startPos = 6;
          chestPos = 2;
          starThresholds = [5, 6, 7];
        } else if (levelNum === 2) {
          name = "Banana Behind";
          instructions = "Turn around to get the banana, then turn back and run to the chest!";
          startPos = 3;
          bananaPos = [1];
          chestPos = 7;
          starThresholds = [7, 8, 10];
        } else {
          name = `Direction Pivot ${levelNum}`;
          startPos = 4;
          bananaPos = [levelNum % 2 === 0 ? 1 : 7];
          chestPos = levelNum % 2 === 0 ? 9 : 2;
          starThresholds = [8, 10, 12];
        }
        break;

      case 3: // Jumping Heights (jump block introduced)
        allowedBlocks = ['forward', 'jump'];
        if (levelNum === 1) {
          name = "Mind the Gap";
          instructions = "Use the 'Jump' block to cross the empty pit!";
          startPos = 2;
          obstacles = [{ x: 4, type: 'hole' }];
          chestPos = 6;
          starThresholds = [3, 4, 5];
        } else if (levelNum === 2) {
          name = "High Banana";
          instructions = "Jump to grab the banana high in the air, then walk to the chest!";
          startPos = 2;
          bananaPos = [4]; // banana is in the air, requires jump at x=3 or x=2 to land
          chestPos = 7;
          starThresholds = [4, 5, 6];
        } else if (levelNum === 3) {
          name = "Crate Block";
          instructions = "Jump on top of the crate to climb over it!";
          startPos = 2;
          obstacles = [{ x: 4, type: 'crate' }];
          chestPos = 6;
          starThresholds = [3, 4, 5];
        } else {
          name = `Obstacle Jump ${levelNum}`;
          startPos = 1;
          obstacles = [{ x: 3 + (levelNum % 3), type: levelNum % 2 === 0 ? 'crate' : 'hole' }];
          bananaPos = [3 + (levelNum % 3)];
          chestPos = 8;
          starThresholds = [5, 6, 7];
        }
        break;

      case 4: // Simple Repeat Loops
        allowedBlocks = ['forward', 'repeat_2', 'repeat_3', 'repeat_4'];
        if (levelNum === 1) {
          name = "Looping Forward";
          instructions = "Instead of stepping 4 times, use a 'Repeat 4' block containing 1 step!";
          startPos = 1;
          chestPos = 5;
          maxSlots = 3; // forces using loop
          starThresholds = [2, 3, 4];
        } else if (levelNum === 2) {
          name = "Banana Loop";
          instructions = "Use a Repeat loop to collect a line of bananas!";
          startPos = 1;
          bananaPos = [2, 3, 4];
          chestPos = 5;
          maxSlots = 3;
          starThresholds = [2, 3, 4];
        } else {
          name = `Sequence Repeat ${levelNum}`;
          startPos = 1;
          bananaPos = Array.from({ length: levelNum - 1 }, (_, k) => 2 + k);
          chestPos = 2 + levelNum;
          maxSlots = 4;
          starThresholds = [2, 3, 5];
        }
        break;

      case 5: // Double Repeats (loops with turns or jumps)
        allowedBlocks = ['forward', 'jump', 'repeat_2', 'repeat_3', 'repeat_4'];
        if (levelNum === 1) {
          name = "Stair Climber";
          instructions = "Use Repeat with (Step + Jump) to climb a series of crates!";
          startPos = 1;
          obstacles = [{ x: 3, type: 'crate' }, { x: 5, type: 'crate' }];
          chestPos = 7;
          starThresholds = [3, 4, 5];
        } else {
          name = `Double Repeat ${levelNum}`;
          startPos = 1;
          obstacles = [{ x: 3, type: 'hole' }, { x: 6, type: 'hole' }];
          bananaPos = [2, 5];
          chestPos = 8;
          starThresholds = [4, 5, 6];
        }
        break;

      case 6: // Multiple Bananas
        allowedBlocks = ['forward', 'backward', 'turn_left', 'turn_right', 'repeat_2', 'repeat_3', 'repeat_4', 'repeat_5'];
        name = `Banana Field ${levelNum}`;
        startPos = 4;
        bananaPos = [1, 2, 6, 7];
        chestPos = 9;
        starThresholds = [6, 8, 10];
        break;

      case 7: // Holes & Hazards
        allowedBlocks = ['forward', 'jump', 'repeat_2', 'repeat_3', 'repeat_4'];
        name = `Hazard Zone ${levelNum}`;
        startPos = 1;
        obstacles = [
          { x: 3, type: 'spikes' },
          { x: 5, type: 'water' },
          { x: 7, type: 'enemy' }
        ];
        chestPos = 9;
        bananaPos = [4, 6];
        starThresholds = [5, 6, 8];
        break;

      case 8: // Crates & Climbs
        allowedBlocks = ['forward', 'jump', 'repeat_2', 'repeat_3', 'repeat_4'];
        name = `Crate Mountain ${levelNum}`;
        startPos = 1;
        obstacles = [
          { x: 2, type: 'crate' },
          { x: 3, type: 'crate' },
          { x: 5, type: 'crate' },
          { x: 6, type: 'crate' }
        ];
        chestPos = 8;
        bananaPos = [4, 7];
        starThresholds = [5, 7, 9];
        break;

      case 9: // Conditionals (If Blocked)
        allowedBlocks = ['forward', 'jump', 'if_blocked', 'repeat_3', 'repeat_4', 'repeat_5'];
        if (levelNum === 1) {
          name = "Smart Jumping";
          instructions = "Use 'If Blocked' to Jump only when a crate is in front, otherwise Step Forward!";
          startPos = 1;
          obstacles = [{ x: 3, type: 'crate' }, { x: 6, type: 'crate' }];
          chestPos = 8;
          starThresholds = [4, 5, 7];
        } else {
          name = `Dynamic Path ${levelNum}`;
          startPos = 1;
          obstacles = [
            { x: 2, type: 'crate' },
            { x: 4, type: 'hole' },
            { x: 6, type: 'crate' }
          ];
          chestPos = 9;
          starThresholds = [5, 6, 8];
        }
        break;

      case 10: // Nested Combinations
      case 11: // Looping Challenges
      case 12: // Master Algorithms
        allowedBlocks = ['forward', 'backward', 'turn_left', 'turn_right', 'jump', 'if_blocked', 'repeat_2', 'repeat_3', 'repeat_4', 'repeat_5'];
        name = `Master Challenge ${grade}-${levelNum}`;
        startPos = 1;
        obstacles = [
          { x: 3, type: 'breakable' },
          { x: 5, type: 'hole' },
          { x: 7, type: 'falling' },
          { x: 9, type: 'water' }
        ];
        bananaPos = [2, 6, 8];
        chestPos = 11;
        starThresholds = [6, 8, 11];
        break;
    }

    if (grade > 1) {
      name = EDUCATIONAL_LEVEL_NAMES[grade]?.[levelNum - 1] || `Learning Challenge ${levelNum}`;
      instructions = `Complete three interactive learning missions in ${name}.`;
      starThresholds = [3, 4, 5];
    }

    // Ensure all levels have valid names and descriptions
    levels.push({
      id,
      grade,
      name,
      instructions,
      mapLength,
      startPos,
      bananaPos,
      chestPos,
      obstacles,
      allowedBlocks,
      maxSlots,
      starThresholds
    });
  }

  return levels;
}

export function getAllLevels(): LevelDef[] {
  let all: LevelDef[] = [];
  for (let g = 1; g <= 12; g++) {
    all = all.concat(getLevelsForGrade(g));
  }
  return all;
}
