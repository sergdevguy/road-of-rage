import type { EnemyType } from './enemies';

export type WaveType =
    | 'chase'
    | 'swarm'
    | 'armoredColumn'
    | 'airAttack';

export type WaveTypeDefinition = {
    type: WaveType;
    enemyWeights: Partial<Record<EnemyType, number>>;
    spawnIntervalMultiplier: number;
    budgetMultiplier: number;
};

export const WAVE_TYPE_LABELS: Record<WaveType, string> = {
    chase: 'ПОГОНЯ',
    swarm: 'РОЙ',
    armoredColumn: 'БРОНИРОВАННАЯ КОЛОННА',
    airAttack: 'ВОЗДУШНАЯ АТАКА'
};

export const WAVE_TYPE_DEFINITIONS: Record<WaveType, WaveTypeDefinition> = {
    chase: {
        type: 'chase',
        enemyWeights: {
            fastCar: 80,
            armoredCar: 20
        },
        spawnIntervalMultiplier: 0.8,
        budgetMultiplier: 1
    },
    swarm: {
        type: 'swarm',
        enemyWeights: {
            fastCar: 70,
            drone: 30
        },
        spawnIntervalMultiplier: 0.65,
        budgetMultiplier: 0.9
    },
    armoredColumn: {
        type: 'armoredColumn',
        enemyWeights: {
            armoredCar: 75,
            fastCar: 25
        },
        spawnIntervalMultiplier: 1.35,
        budgetMultiplier: 1.1
    },
    airAttack: {
        type: 'airAttack',
        enemyWeights: {
            drone: 85,
            fastCar: 15
        },
        spawnIntervalMultiplier: 0.9,
        budgetMultiplier: 1
    }
};
