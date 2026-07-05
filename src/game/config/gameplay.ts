export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const WORLD = {
    roadY: GAME_HEIGHT / 2 + 30,
    roadHeight: 110,
    scrollSpeed: 116
};

export const TRUCK = {
    x: GAME_WIDTH / 2,
    y: WORLD.roadY - 20,
    scale: 0.8,
    maxHp: 10,
    collisionRadius: 161,
    hitboxWidth: 236,
    hitboxHeight: 66,
    hitboxOffsetX: 0,
    hitboxOffsetY: 8
};

export const DRONE = {
    scale: 0.8
};

export const COMBAT = {
    turretRange: 330,
    turretFireDelay: 420,
    turretDamage: 25,
    droneRange: 270,
    droneFireDelay: 680,
    droneDamage: 35,
    projectileSpeed: 920
};

export const ENEMY = {
    attackDelay: 720,
    collisionRadius: 24
};

export const PLAYER = {
    startGold: 0
};

export const WAVES = {
    max: 10,
    spawnIntervalMs: 1050,
    betweenWaveDelayMs: 2000,
    basePowerBudget: 50,
    powerBudgetStep: 25,
    maxAlive: 20
};

export const DEBUG = {
    showHitboxes: false
};

export const COLORS = {
    background: 0x11170f,
    dirt: 0x3b3122,
    road: 0x27251f,
    roadEdge: 0x51493c,
    truckCab: 0xd65b32,
    truckCargo: 0x7f9a46,
    armor: 0xd8ddd1,
    turret: 0x9abc42,
    enemy: 0xcf442f,
    enemyDark: 0x51281f,
    drone: 0x9dba43,
    projectile: 0xffd47a,
    health: 0x72c24e,
    danger: 0xef4b42,
    uiPanel: 0x0d120d
};
