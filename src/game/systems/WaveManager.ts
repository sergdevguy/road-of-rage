export type WaveConfig = {
    enemyCount: number;
    spawnInterval: number;
    hpMultiplier: number;
};

export type WaveState =
    | 'idle'
    | 'spawning'
    | 'waitingForEnemies'
    | 'betweenWaves';

type SpawnOptions = {
    hpMultiplier: number;
};

type WaveManagerOptions = {
    maxWaves: number;
    spawnInterval: number;
    betweenWaveDelay: number;
    spawnEnemy: (options: SpawnOptions) => void;
    onWaveStarted?: (waveNumber: number, config: WaveConfig) => void;
    onWaveCompleted?: (waveNumber: number) => void;
    onRunCompleted?: () => void;
};

export class WaveManager {
    private readonly options: WaveManagerOptions;
    private waveNumber = 0;
    private activeConfig: WaveConfig | null = null;
    private stateValue: WaveState = 'idle';
    private enemiesLeftToSpawn = 0;
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
        this.enemiesLeftToSpawn = 0;
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
        this.enemiesLeftToSpawn = this.activeConfig.enemyCount;
        this.aliveEnemies = 0;
        this.spawnTimerMs = 0;
        this.stateValue = 'spawning';

        this.options.onWaveStarted?.(this.waveNumber, this.activeConfig);
        this.spawnOneEnemy();
    }

    private createWaveConfig(waveNumber: number): WaveConfig {
        return {
            enemyCount: 4 + waveNumber * 2,
            spawnInterval: this.options.spawnInterval,
            hpMultiplier: 1 + (waveNumber - 1) * 0.15
        };
    }

    private updateSpawning(deltaMs: number) {
        if (!this.activeConfig || this.enemiesLeftToSpawn <= 0) {
            this.stateValue = 'waitingForEnemies';
            this.completeWaveIfReady();
            return;
        }

        this.spawnTimerMs += deltaMs;

        while (this.spawnTimerMs >= this.activeConfig.spawnInterval && this.enemiesLeftToSpawn > 0) {
            this.spawnTimerMs -= this.activeConfig.spawnInterval;
            this.spawnOneEnemy();
        }
    }

    private spawnOneEnemy() {
        if (!this.activeConfig || this.enemiesLeftToSpawn <= 0) {
            return;
        }

        this.enemiesLeftToSpawn -= 1;
        this.aliveEnemies += 1;
        this.options.spawnEnemy({
            hpMultiplier: this.activeConfig.hpMultiplier
        });

        if (this.enemiesLeftToSpawn <= 0) {
            this.stateValue = 'waitingForEnemies';
            this.completeWaveIfReady();
        }
    }

    private completeWaveIfReady() {
        if (
            this.isRunCompleted ||
            (this.stateValue !== 'spawning' && this.stateValue !== 'waitingForEnemies') ||
            this.enemiesLeftToSpawn > 0 ||
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
}
