import type { EnemyType } from './enemies'

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
            drone: 90,
            fastCar: 10
        },
        spawnIntervalMultiplier: 0.4,
        budgetMultiplier: 1
    }
};

export const FIRST_WAVE_SELECTION_WEIGHTS: Partial<Record<WaveType, number>> = {
    chase: 60,
    swarm: 40
};

export const WAVE_TYPE_SELECTION_WEIGHTS: Record<WaveType, number> = {
    chase: 35,
    swarm: 30,
    armoredColumn: 20,
    airAttack: 15
};

export const FINAL_WAVE_SELECTION_WEIGHTS: Record<WaveType, number> = {
    chase: 15,
    swarm: 20,
    armoredColumn: 35,
    airAttack: 30
};

export const WAVE_SEQUENCE_SETTINGS = {
    sameAsPreviousMultiplier: 0.25,
    sameAsTwoWavesAgoMultiplier: 0.7,
    minUniqueTypes: 3,
    maxGenerationAttempts: 20
};

export const FALLBACK_WAVE_SEQUENCE: WaveType[] = [
    'chase',
    'swarm',
    'armoredColumn',
    'airAttack',
    'chase'
];
