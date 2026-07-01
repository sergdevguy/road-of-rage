import { Scene } from 'phaser';
import { ENEMY, GAME_HEIGHT, GAME_WIDTH, PLAYER, TRUCK, WAVES } from '../config/gameplay';
import { Drone } from '../entities/Drone';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { Truck } from '../entities/Truck';
import { Turret } from '../entities/Turret';
import { WorldRenderer } from '../rendering/WorldRenderer';
import type { EnemyKind, Point, SpawnSide } from '../types';
import { Hud } from '../ui/Hud';

export class Game extends Scene {
    private world: WorldRenderer;
    private truck: Truck;
    private hud: Hud;
    private turrets: Turret[] = [];
    private drones: Drone[] = [];
    private enemies: Enemy[] = [];
    private projectiles: Projectile[] = [];
    private hp = TRUCK.maxHp;
    private gold = PLAYER.startGold;
    private wave = 1;
    private spawnTimerMs = 0;
    private elapsedMs = 0;
    private isGameOver = false;

    constructor() {
        super('Game');
    }

    init() {
        this.turrets = [];
        this.drones = [];
        this.enemies = [];
        this.projectiles = [];
        this.hp = TRUCK.maxHp;
        this.gold = PLAYER.startGold;
        this.wave = 1;
        this.spawnTimerMs = 0;
        this.elapsedMs = 0;
        this.isGameOver = false;
    }

    create() {
        this.world = new WorldRenderer(this);
        this.truck = new Truck(this);
        this.hud = new Hud(this);

        this.turrets = this.truck.hardpoints().map((mount) => new Turret(this, this.truck, mount));
        this.drones = [
            new Drone(this, this.truck, -0.4, 176),
            new Drone(this, this.truck, 2.2, 210)
        ];

        for (let index = 0; index < 5; index += 1) {
            this.spawnEnemy();
        }

        this.refreshHud();
    }

    update(_time: number, delta: number) {
        const deltaSeconds = Math.min(delta / 1000, 0.05);

        this.world.update(deltaSeconds);

        if (this.isGameOver) {
            return;
        }

        this.elapsedMs += delta;
        this.wave = Math.min(WAVES.max, 1 + Math.floor(this.elapsedMs / WAVES.waveDurationMs));
        this.spawnTimerMs -= delta;

        if (this.spawnTimerMs <= 0) {
            this.spawnEnemy();
            this.spawnTimerMs = Math.max(420, ENEMY.spawnDelay - this.wave * 38);
        }

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
                this.hp -= damage;
                this.truck.setHp(this.hp);

                if (this.hp <= 0) {
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
                    this.gold += projectile.owner === 'drone' ? 2 : 3;
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

    private spawnEnemy() {
        const side = this.pickSpawnSide();
        const position = this.spawnPosition(side);
        const kind: EnemyKind = side === 'left' || side === 'right' ? 'car' : 'raider';

        this.enemies.push(new Enemy(this, kind, position, this.wave));
    }

    private pickSpawnSide(): SpawnSide {
        const sides: SpawnSide[] = ['left', 'right', 'top', 'bottom'];
        return sides[Math.floor(Math.random() * sides.length)];
    }

    private spawnPosition(side: SpawnSide): Point {
        if (side === 'left') {
            return { x: -70, y: this.randomBetween(360, 520) };
        }

        if (side === 'right') {
            return { x: GAME_WIDTH + 70, y: this.randomBetween(250, 610) };
        }

        if (side === 'top') {
            return { x: this.randomBetween(80, GAME_WIDTH - 80), y: 112 };
        }

        return { x: this.randomBetween(80, GAME_WIDTH - 80), y: GAME_HEIGHT + 48 };
    }

    private randomBetween(min: number, max: number) {
        return min + Math.random() * (max - min);
    }

    private refreshHud() {
        this.hud.setStats(this.wave, this.hp, this.gold);
    }

    private gameOver() {
        this.isGameOver = true;
        this.hp = 0;
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
}
