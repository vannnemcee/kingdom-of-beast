export type GameState = 'title' | 'playing' | 'gameover' | 'victory' | 'settings' | 'ending';

export type AreaId = 
  | 'kingdom' 
  | 'green_forest' 
  | 'dark_forest' 
  | 'ruins' 
  | 'demon_territory' 
  | 'demon_castle';

export interface Position {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'quest';
  value: number; // damage bonus or defense bonus or heal amount
  price: number;
  description: string;
  icon: string;
  upgradeLevel?: number;
}

export interface Quest {
  id: string;
  title: string;
  giverName: string;
  description: string;
  targetMonster?: string;
  targetCount: number;
  currentCount: number;
  targetItem?: string;
  rewardCoin: number;
  rewardExp: number;
  isCompleted: boolean;
  isClaimed: boolean;
  areaHint: string;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  level: number;
  exp: number;
  maxExp: number;
  coin: number;
  baseDamage: number;
  baseDefense: number;
  equippedWeapon: Item;
  equippedArmor: Item;
  inventory: Item[];
  potionCount: number;
  activeQuests: Quest[];
  completedQuestIds: string[];
  completedQuests?: string[];
  monstersSlainCount: number;
}

export interface NPC {
  id: string;
  name: string;
  role: 'guard' | 'quest' | 'weapon_shop' | 'armor_shop' | 'blacksmith' | 'item_shop' | 'villager';
  x: number;
  y: number;
  width: number;
  height: number;
  dialogue: string[];
  questId?: string;
  shopType?: 'weapon' | 'armor' | 'item' | 'blacksmith';
}

export interface Monster {
  id: string;
  type: 
    | 'slime' 
    | 'green_slime' 
    | 'bat' 
    | 'goblin' 
    | 'goblin_warrior' 
    | 'dark_slime' 
    | 'wolf' 
    | 'skeleton' 
    | 'skeleton_archer' 
    | 'skeleton_knight' 
    | 'dark_mage' 
    | 'demon' 
    | 'forest_guardian' 
    | 'skeleton_king' 
    | 'demon_general' 
    | 'demon_king';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  damage: number;
  defense: number;
  speed: number;
  expReward: number;
  coinReward: number;
  isBoss?: boolean;
  bossTitle?: string;
  attackCooldown: number;
  attackRange: number;
  state: 'idle' | 'chase' | 'attack' | 'hurt' | 'dead';
  facing: Direction;
  animTimer: number;
  hurtTimer: number;
  specialTimer?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  fromPlayer: boolean;
  type: 'arrow' | 'fireball' | 'magic' | 'shockwave' | 'energy_beam';
  radius: number;
  lifetime: number;
  color?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  damage: number;
  isCrit?: boolean;
  isHeal?: boolean;
  alpha: number;
  vy: number;
}

export interface Chest {
  id: string;
  x: number;
  y: number;
  opened: boolean;
  coin: number;
  item?: Item;
}

export interface Portal {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetArea: AreaId;
  targetX: number;
  targetY: number;
  label: string;
}

export interface GameSettings {
  soundVolume: number;
  musicVolume: number;
  graphics: 'low' | 'medium' | 'high';
  vibration: boolean;
  fullscreen: boolean;
  crtScanlines: boolean;
}
