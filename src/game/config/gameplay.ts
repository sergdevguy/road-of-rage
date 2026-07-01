export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const WORLD = {
    roadY: 410,
    roadHeight: 110,
    scrollSpeed: 86
};

export const TRUCK = {
    x: 450,
    y: WORLD.roadY,
    scale: 0.8,
    maxHp: 10,
    collisionRadius: 61
};

export const DRONE = {
    scale: 0.8
};

export const COMBAT = {
    turretRange: 330,
    turretFireDelay: 420,
    turretDamage: 2,
    droneRange: 270,
    droneFireDelay: 680,
    droneDamage: 1,
    projectileSpeed: 620
};

export const ENEMY = {
    baseHp: 4,
    baseSpeed: 58,
    spawnDelay: 1050,
    attackDelay: 720,
    attackDamage: 1,
    collisionRadius: 24
};

export const PLAYER = {
    startGold: 0
};

export const WAVES = {
    max: 12,
    waveDurationMs: 18000
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
