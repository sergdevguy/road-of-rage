export type EnemyType =
    | 'fastCar'
    | 'armoredCar'
    | 'drone';

export type EnemyDefinition = {
    type: EnemyType;
    maxHp: number;
    speed: number;
    damage: number;
    reward: number;
    powerCost: number;
};

export const ENEMY_DEFINITIONS: Record<EnemyType, EnemyDefinition> = {
    fastCar: {
        type: 'fastCar',
        maxHp: 30,
        speed: 220,
        damage: 1,
        reward: 5,
        powerCost: 10
    },
    armoredCar: {
        type: 'armoredCar',
        maxHp: 100,
        speed: 130,
        damage: 2,
        reward: 12,
        powerCost: 30
    },
    drone: {
        type: 'drone',
        maxHp: 10,
        speed: 150,
        damage: 1,
        reward: 8,
        powerCost: 5
    }
};
