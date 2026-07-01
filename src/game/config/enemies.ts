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
};

export const ENEMY_DEFINITIONS: Record<EnemyType, EnemyDefinition> = {
    fastCar: {
        type: 'fastCar',
        maxHp: 40,
        speed: 220,
        damage: 1,
        reward: 5
    },
    armoredCar: {
        type: 'armoredCar',
        maxHp: 140,
        speed: 90,
        damage: 2,
        reward: 12
    },
    drone: {
        type: 'drone',
        maxHp: 65,
        speed: 150,
        damage: 1,
        reward: 8
    }
};
