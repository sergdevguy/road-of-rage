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
    hitbox: {
        width: number;
        height: number;
        offsetX: number;
        offsetY: number;
    };
};

export const ENEMY_DEFINITIONS: Record<EnemyType, EnemyDefinition> = {
    fastCar: {
        type: 'fastCar',
        maxHp: 30,
        speed: 220,
        damage: 1,
        reward: 5,
        powerCost: 10,
        hitbox: {
            width: 92,
            height: 34,
            offsetX: 0,
            offsetY: 6
        }
    },
    armoredCar: {
        type: 'armoredCar',
        maxHp: 100,
        speed: 130,
        damage: 2,
        reward: 12,
        powerCost: 30,
        hitbox: {
            width: 150,
            height: 48,
            offsetX: 0,
            offsetY: 10
        }
    },
    drone: {
        type: 'drone',
        maxHp: 10,
        speed: 150,
        damage: 1,
        reward: 8,
        powerCost: 5,
        hitbox: {
            width: 34,
            height: 28,
            offsetX: 0,
            offsetY: 0
        }
    }
};
