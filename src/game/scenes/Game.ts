import { Scene } from 'phaser';
import { COMBAT, GAME_HEIGHT, GAME_WIDTH, PLAYER, TRUCK, WAVES } from '../config/gameplay';
import { WAVE_TYPE_LABELS } from '../config/waves';
import { Drone } from '../entities/Drone';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { Truck } from '../entities/Truck';
import { Turret } from '../entities/Turret';
import { WorldRenderer } from '../rendering/WorldRenderer';
import { EnemySpawner } from '../spawners/EnemySpawner';
import { BonusManager, type RunUpgradeState } from '../systems/BonusManager';
import { WaveManager } from '../systems/WaveManager';
import { BonusSelection } from '../ui/BonusSelection';
import { Hud } from '../ui/Hud';

type GameSpeed = 1 | 2 | 3;
const BONUS_SELECTION_DELAY_MS = 500;

export class Game extends Scene {
    private world: WorldRenderer;
    private truck: Truck;
    private hud: Hud;
    private bonusSelection: BonusSelection;
    private enemySpawner: EnemySpawner;
    private waveManager: WaveManager;
    private bonusManager: BonusManager;
    private runState: RunUpgradeState;
    private turrets: Turret[] = [];
    private drones: Drone[] = [];
    private enemies: Enemy[] = [];
    private projectiles: Projectile[] = [];
    private removedEnemies = new WeakSet<Enemy>();
    private gold = PLAYER.startGold;
    private wave = 1;
    private isGameOver = false;
    private isPaused = false;
    private speedMultiplier: GameSpeed = 1;
    private bonusSelectionTimer: Phaser.Time.TimerEvent | null = null;

    constructor() {
        super('Game');
    }

    init() {
        this.turrets = [];
        this.drones = [];
        this.enemies = [];
        this.projectiles = [];
        this.removedEnemies = new WeakSet();
        this.runState = this.createInitialRunState();
        this.gold = PLAYER.startGold;
        this.wave = 1;
        this.isGameOver = false;
        this.isPaused = false;
        this.speedMultiplier = 1;
        this.bonusSelectionTimer = null;
    }

    create() {
        this.world = new WorldRenderer(this);
        this.truck = new Truck(this);
        this.hud = new Hud(this, {
            onTogglePause: () => this.togglePause(),
            onCycleSpeed: () => this.cycleSpeed()
        });
        this.bonusSelection = new BonusSelection(this);
        this.bonusManager = new BonusManager(this.runState);

        this.syncLoadout();
        this.truck.setHp(this.runState.currentHp, this.runState.maxHp);

        this.enemySpawner = new EnemySpawner(this);
        this.waveManager = new WaveManager({
            maxWaves: WAVES.max,
            spawnInterval: WAVES.spawnIntervalMs,
            betweenWaveDelay: WAVES.betweenWaveDelayMs,
            basePowerBudget: WAVES.basePowerBudget,
            powerBudgetStep: WAVES.powerBudgetStep,
            maxAlive: WAVES.maxAlive,
            spawnEnemy: (options) => {
                this.enemies.push(this.enemySpawner.spawnEnemy(options));
            },
            onWaveStarted: (waveNumber, config) => {
                this.wave = waveNumber;
                this.hud.showStatusMessage(`ВОЛНА ${waveNumber}\n${WAVE_TYPE_LABELS[config.waveType]}`, 1200);
                this.refreshHud();
            },
            onWaveCompleted: () => {
                this.hud.showStatusMessage('ВОЛНА ЗАВЕРШЕНА', 1200);
            },
            onBonusChoiceRequested: () => {
                this.scheduleBonusSelection();
            },
            onRunCompleted: () => {
                this.hud.showStatusMessage('ЗАБЕГ ЗАВЕРШЁН', 0);
            }
        });
        this.waveManager.start();

        this.events.once('shutdown', () => this.shutdownSystems());

        this.refreshHud();
    }

    update(_time: number, delta: number) {
        if (this.isPaused || this.isGameOver) {
            return;
        }

        const scaledDelta = delta * this.speedMultiplier;
        const deltaSeconds = Math.min(scaledDelta / 1000, 0.05);

        this.hud.update(scaledDelta);

        this.world.update(deltaSeconds);
        this.waveManager.update(scaledDelta);

        this.updateEnemies(deltaSeconds);
        this.updateWeapons(deltaSeconds);
        this.updateProjectiles(deltaSeconds);
        this.cleanupDestroyed();
        this.refreshHud();
    }

    private updateWeapons(deltaSeconds: number) {
        for (const turret of this.turrets) {
            const projectile = turret.update(deltaSeconds, this.enemies);

            if (projectile) {
                this.projectiles.push(projectile);
            }
        }

        for (const drone of this.drones) {
            const projectile = drone.update(deltaSeconds, this.enemies);

            if (projectile) {
                this.projectiles.push(projectile);
            }
        }
    }

    private updateEnemies(deltaSeconds: number) {
        for (const enemy of this.enemies) {
            const damage = enemy.update(deltaSeconds, this.truck.position);

            if (damage > 0) {
                this.runState.currentHp -= damage;
                this.truck.setHp(this.runState.currentHp, this.runState.maxHp);
                this.handleEnemyRemoved(enemy, true);

                if (this.runState.currentHp <= 0) {
                    this.gameOver();
                    return;
                }
            }
        }
    }

    private updateProjectiles(deltaSeconds: number) {
        for (const projectile of this.projectiles) {
            projectile.update(deltaSeconds);

            for (const enemy of this.enemies) {
                if (enemy.isDestroyed() || !enemy.overlaps(projectile.position, projectile.radius)) {
                    continue;
                }

                if (enemy.takeDamage(projectile.damage)) {
                    this.gold += enemy.reward;
                    this.handleEnemyRemoved(enemy, false);
                }

                projectile.destroy();
                break;
            }
        }
    }

    private cleanupDestroyed() {
        this.enemies = this.enemies.filter((enemy) => !enemy.isDestroyed());

        const activeProjectiles: Projectile[] = [];

        for (const projectile of this.projectiles) {
            if (projectile.isExpired()) {
                projectile.destroy();
            } else {
                activeProjectiles.push(projectile);
            }
        }

        this.projectiles = activeProjectiles;
    }

    private handleEnemyRemoved(enemy: Enemy, shouldDestroy: boolean) {
        if (this.removedEnemies.has(enemy)) {
            return;
        }

        this.removedEnemies.add(enemy);

        if (shouldDestroy) {
            enemy.destroy();
        }

        this.waveManager.onEnemyRemoved();
    }

    private refreshHud() {
        this.hud.setStats(this.wave, this.runState.currentHp, this.runState.maxHp, this.gold);
    }

    private togglePause() {
        if (this.isGameOver) {
            return;
        }

        this.isPaused = !this.isPaused;
        this.hud.setPaused(this.isPaused);
    }

    private cycleSpeed() {
        if (this.speedMultiplier === 1) {
            this.speedMultiplier = 2;
        } else if (this.speedMultiplier === 2) {
            this.speedMultiplier = 3;
        } else {
            this.speedMultiplier = 1;
        }

        this.hud.setSpeed(this.speedMultiplier);
    }

    private gameOver() {
        this.isGameOver = true;
        this.runState.currentHp = 0;
        this.refreshHud();

        const shade = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x050705, 0.62);
        shade.setOrigin(0);
        shade.setDepth(200);

        const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 28, 'КОНВОЙ ПОТЕРЯН', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '42px',
            color: '#f0f2df',
            align: 'center'
        });
        title.setOrigin(0.5);
        title.setDepth(201);

        const score = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 28, `Волна ${this.wave}   Золото ${this.gold}`, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#d8d0b8',
            align: 'center'
        });
        score.setOrigin(0.5);
        score.setDepth(201);
    }

    private shutdownSystems() {
        this.waveManager?.destroy();
        this.bonusSelectionTimer?.remove(false);
        this.bonusSelectionTimer = null;
        this.bonusSelection?.hide();

        for (const enemy of this.enemies) {
            enemy.destroy();
        }

        for (const projectile of this.projectiles) {
            projectile.destroy();
        }

        this.enemies = [];
        this.projectiles = [];
    }

    private scheduleBonusSelection() {
        this.bonusSelectionTimer?.remove(false);
        this.bonusSelectionTimer = this.time.delayedCall(BONUS_SELECTION_DELAY_MS, () => {
            this.bonusSelectionTimer = null;
            this.showBonusSelection();
        });
    }

    private showBonusSelection() {
        const choices = this.bonusManager.getChoices(3);

        if (choices.length <= 0) {
            this.waveManager.continueAfterBonus();
            return;
        }

        this.bonusSelection.show(choices, (bonusId) => {
            this.bonusManager.applyBonus(bonusId);
            this.syncLoadout();
            this.truck.setHp(this.runState.currentHp, this.runState.maxHp);
            this.refreshHud();
            this.bonusSelection.hide();
            this.waveManager.continueAfterBonus();
        });
    }

    private syncLoadout() {
        const hardpoints = this.truck.hardpoints();

        while (this.turrets.length < this.runState.gunCount && this.turrets.length < this.runState.maxGunSlots) {
            const mount = hardpoints[this.turrets.length];
            this.turrets.push(new Turret(this, this.truck, mount, () => this.gunStats()));
        }

        const droneSlots = [
            { phase: -0.4, orbitRadius: 176 },
            { phase: 2.2, orbitRadius: 210 }
        ];

        while (this.drones.length < this.runState.droneCount && this.drones.length < this.runState.maxDroneSlots) {
            const slot = droneSlots[this.drones.length];
            this.drones.push(new Drone(this, this.truck, slot.phase, slot.orbitRadius, () => this.droneStats()));
        }
    }

    private gunStats() {
        return {
            damage: COMBAT.turretDamage * this.runState.gunDamageMultiplier,
            fireDelay: COMBAT.turretFireDelay / this.runState.gunFireRateMultiplier
        };
    }

    private droneStats() {
        return {
            damage: COMBAT.droneDamage * this.runState.droneDamageMultiplier,
            fireDelay: COMBAT.droneFireDelay / this.runState.droneFireRateMultiplier
        };
    }

    private createInitialRunState(): RunUpgradeState {
        return {
            gunCount: 1,
            maxGunSlots: 3,
            droneCount: 0,
            maxDroneSlots: 2,
            gunDamageMultiplier: 1,
            gunFireRateMultiplier: 1,
            droneDamageMultiplier: 1,
            droneFireRateMultiplier: 1,
            maxHp: TRUCK.maxHp,
            currentHp: TRUCK.maxHp
        };
    }
}
