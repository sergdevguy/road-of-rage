import { ENEMY_DEFINITIONS, type EnemyType } from '../config/enemies';

const DEBUG_WAVES = false;

export type WaveConfig = {
    powerBudget: number;
    spawnInterval: number;
    hpMultiplier: number;
};

export type WaveState =
    | 'idle'
    | 'spawning'
    | 'waitingForEnemies'
    | 'betweenWaves';

type SpawnOptions = {
    type: EnemyType;
    hpMultiplier: number;
};

type EnemyWeight = {
    type: EnemyType;
    weight: number;
};

type WaveManagerOptions = {
    maxWaves: number;
    spawnInterval: number;
    betweenWaveDelay: number;
    basePowerBudget: number;
    powerBudgetStep: number;
    spawnEnemy: (options: SpawnOptions) => void;
    onWaveStarted?: (waveNumber: number, config: WaveConfig) => void;
    onWaveCompleted?: (waveNumber: number) => void;
    onRunCompleted?: () => void;
};

export class WaveManager {
    private readonly options: WaveManagerOptions;
    private waveNumber = 0;
    private activeConfig: WaveConfig | null = null;
    private enemyQueue: EnemyType[] = [];
    private stateValue: WaveState = 'idle';
    private aliveEnemies = 0;
    private spawnTimerMs = 0;
    private betweenWaveTimerMs = 0;
    private isRunCompleted = false;

    constructor(options: WaveManagerOptions) {
        this.options = options;
    }

    get currentWave() {
        return Math.max(1, this.waveNumber);
    }

    get state() {
        return this.stateValue;
    }

    start() {
        if (this.stateValue !== 'idle' || this.isRunCompleted) {
            return;
        }

        this.startNextWave();
    }

    update(deltaMs: number) {
        if (this.stateValue === 'spawning') {
            this.updateSpawning(deltaMs);
            return;
        }

        if (this.stateValue === 'betweenWaves') {
            this.betweenWaveTimerMs -= deltaMs;

            if (this.betweenWaveTimerMs <= 0) {
                this.startNextWave();
            }
        }
    }

    onEnemyRemoved() {
        if (this.aliveEnemies > 0) {
            this.aliveEnemies -= 1;
        }

        this.completeWaveIfReady();
    }

    destroy() {
        this.stateValue = 'idle';
        this.activeConfig = null;
        this.enemyQueue = [];
        this.aliveEnemies = 0;
        this.spawnTimerMs = 0;
        this.betweenWaveTimerMs = 0;
    }

    private startNextWave() {
        if (this.waveNumber >= this.options.maxWaves) {
            this.completeRun();
            return;
        }

        this.waveNumber += 1;
        this.activeConfig = this.createWaveConfig(this.waveNumber);
        this.enemyQueue = this.createEnemyQueue(this.waveNumber, this.activeConfig.powerBudget);
        this.aliveEnemies = 0;
        this.spawnTimerMs = 0;
        this.stateValue = 'spawning';

        this.options.onWaveStarted?.(this.waveNumber, this.activeConfig);
        this.spawnOneEnemy();
    }

    private createWaveConfig(waveNumber: number): WaveConfig {
        return {
            powerBudget: this.options.basePowerBudget + (waveNumber - 1) * this.options.powerBudgetStep,
            spawnInterval: this.options.spawnInterval,
            hpMultiplier: 1 + (waveNumber - 1) * 0.15
        };
    }

    private createEnemyQueue(waveNumber: number, powerBudget: number) {
        const queue: EnemyType[] = [];
        let remainingBudget = powerBudget;
        let spentPower = 0;
        let iteration = 0;
        const maxIterations = 100;

        while (iteration < maxIterations) {
            iteration += 1;

            const affordableWeights = this.getEnemyWeights(waveNumber).filter((item) => {
                return ENEMY_DEFINITIONS[item.type].powerCost <= remainingBudget;
            });

            if (affordableWeights.length <= 0) {
                break;
            }

            const type = this.pickWeightedEnemyType(affordableWeights);
            const powerCost = ENEMY_DEFINITIONS[type].powerCost;
            queue.push(type);
            remainingBudget -= powerCost;
            spentPower += powerCost;
        }

        if (DEBUG_WAVES) {
            console.debug({
                waveNumber,
                powerBudget,
                enemyQueue: queue,
                spentPower
            });
        }

        return queue;
    }

    private updateSpawning(deltaMs: number) {
        if (!this.activeConfig || this.enemyQueue.length <= 0) {
            this.stateValue = 'waitingForEnemies';
            this.completeWaveIfReady();
            return;
        }

        this.spawnTimerMs += deltaMs;

        while (this.spawnTimerMs >= this.activeConfig.spawnInterval && this.enemyQueue.length > 0) {
            this.spawnTimerMs -= this.activeConfig.spawnInterval;
            this.spawnOneEnemy();
        }
    }

    private spawnOneEnemy() {
        if (!this.activeConfig || this.enemyQueue.length <= 0) {
            return;
        }

        const type = this.enemyQueue.shift();

        if (!type) {
            return;
        }

        this.aliveEnemies += 1;
        this.options.spawnEnemy({
            type,
            hpMultiplier: this.activeConfig.hpMultiplier
        });

        if (this.enemyQueue.length <= 0) {
            this.stateValue = 'waitingForEnemies';
            this.completeWaveIfReady();
        }
    }

    private completeWaveIfReady() {
        if (
            this.isRunCompleted ||
            (this.stateValue !== 'spawning' && this.stateValue !== 'waitingForEnemies') ||
            this.enemyQueue.length > 0 ||
            this.aliveEnemies > 0
        ) {
            return;
        }

        this.options.onWaveCompleted?.(this.waveNumber);

        if (this.waveNumber >= this.options.maxWaves) {
            this.completeRun();
            return;
        }

        this.stateValue = 'betweenWaves';
        this.betweenWaveTimerMs = this.options.betweenWaveDelay;
    }

    private completeRun() {
        if (this.isRunCompleted) {
            return;
        }

        this.isRunCompleted = true;
        this.stateValue = 'idle';
        this.options.onRunCompleted?.();
    }

    private getEnemyWeights(waveNumber: number): EnemyWeight[] {
        if (waveNumber <= 1) {
            return [
                { type: 'fastCar', weight: 100 }
            ];
        }

        if (waveNumber === 2) {
            return [
                { type: 'fastCar', weight: 75 },
                { type: 'drone', weight: 25 }
            ];
        }

        if (waveNumber === 3) {
            return [
                { type: 'fastCar', weight: 60 },
                { type: 'armoredCar', weight: 40 }
            ];
        }

        if (waveNumber === 4) {
            return [
                { type: 'fastCar', weight: 45 },
                { type: 'armoredCar', weight: 30 },
                { type: 'drone', weight: 25 }
            ];
        }

        return [
            { type: 'fastCar', weight: 30 },
            { type: 'armoredCar', weight: 45 },
            { type: 'drone', weight: 25 }
        ];
    }

    private pickWeightedEnemyType(weights: EnemyWeight[]) {
        const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
        let roll = Math.random() * totalWeight;

        for (const item of weights) {
            roll -= item.weight;

            if (roll <= 0) {
                return item.type;
            }
        }

        return weights[weights.length - 1].type;
    }
}
