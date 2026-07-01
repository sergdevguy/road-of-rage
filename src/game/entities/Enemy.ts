import type { Scene } from 'phaser';
import { COLORS, ENEMY, TRUCK } from '../config/gameplay';
import type { EnemyKind, Point, SpawnSide } from '../types';
import { angleBetween, distanceSquared } from '../utils/math';

export class Enemy {
    readonly radius = ENEMY.collisionRadius;

    private readonly scene: Scene;
    private readonly container: Phaser.GameObjects.Container;
    private readonly visual: Phaser.GameObjects.Container;
    private readonly healthFill: Phaser.GameObjects.Rectangle;
    private readonly kind: EnemyKind;
    private readonly spawnSide: SpawnSide;
    private readonly maxHp: number;
    private readonly speed: number;
    private hp: number;
    private attackCooldownMs = 0;
    private destroyed = false;

    constructor(scene: Scene, kind: EnemyKind, position: Point, hpMultiplier: number, spawnSide: SpawnSide) {
        this.scene = scene;
        this.kind = kind;
        this.spawnSide = spawnSide;
        this.hp = Math.ceil(ENEMY.baseHp * hpMultiplier);
        this.maxHp = this.hp;
        this.speed = ENEMY.baseSpeed + (this.isSideViewEnemy() ? 26 : 10);
        this.container = scene.add.container(position.x, position.y);
        this.container.setDepth(15);
        this.visual = scene.add.container(0, 0);
        this.container.add(this.visual);

        if (kind === 'car') {
            this.addCarVisual();
        } else if (kind === 'raider') {
            this.addRaiderVisual();
        } else if (kind === 'scoutDrone') {
            this.addScoutDroneVisual();
        } else {
            this.addStrikeDroneVisual();
        }

        this.faceInitialDirection();

        const healthBack = scene.add.rectangle(0, -28, 42, 5, 0x201915, 0.9);
        this.healthFill = scene.add.rectangle(-20, -28, 40, 3, COLORS.danger);
        this.healthFill.setOrigin(0, 0.5);
        this.container.add([healthBack, this.healthFill]);
    }

    get x() {
        return this.container.x;
    }

    get y() {
        return this.container.y;
    }

    get position(): Point {
        return { x: this.x, y: this.y };
    }

    update(deltaSeconds: number, target: Point) {
        if (this.destroyed) {
            return 0;
        }

        this.attackCooldownMs -= deltaSeconds * 1000;

        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const attackDistance = TRUCK.collisionRadius + this.radius - 8;

        this.updateFacing(target);

        if (dist > attackDistance) {
            this.container.x += (dx / dist) * this.speed * deltaSeconds;
            this.container.y += (dy / dist) * this.speed * deltaSeconds;
            return 0;
        }

        if (this.attackCooldownMs <= 0) {
            this.attackCooldownMs = ENEMY.attackDelay;
            this.scene.cameras.main.shake(70, 0.0025);
            return ENEMY.attackDamage;
        }

        return 0;
    }

    takeDamage(amount: number) {
        if (this.destroyed) {
            return false;
        }

        this.hp -= amount;
        this.healthFill.scaleX = Math.max(0, this.hp / this.maxHp);

        if (this.hp <= 0) {
            this.destroy();
            return true;
        }

        return false;
    }

    isDestroyed() {
        return this.destroyed;
    }

    overlaps(point: Point, radius: number) {
        const maxDistance = this.radius + radius;
        return distanceSquared(this.position, point) <= maxDistance * maxDistance;
    }

    destroy() {
        if (this.destroyed) {
            return;
        }

        this.destroyed = true;
        this.container.destroy();
    }

    private addCarVisual() {
        const shadow = this.scene.add.ellipse(2, 10, 58, 26, 0x000000, 0.32);
        const body = this.scene.add.rectangle(0, 0, 54, 28, COLORS.enemy);
        body.setStrokeStyle(3, COLORS.enemyDark);

        const hood = this.scene.add.rectangle(16, 0, 18, 24, 0xa92c25);
        const glass = this.scene.add.rectangle(-10, -1, 18, 18, 0x252d31, 0.95);
        const wheelA = this.scene.add.circle(-15, 16, 5, 0x101010);
        const wheelB = this.scene.add.circle(15, 16, 5, 0x101010);
        const light = this.scene.add.circle(27, -7, 3, 0xffd88a);

        this.visual.add([shadow, body, hood, glass, wheelA, wheelB, light]);
    }

    private addRaiderVisual() {
        const shadow = this.scene.add.ellipse(1, 11, 50, 28, 0x000000, 0.38);
        const body = this.scene.add.rectangle(0, 0, 46, 30, 0x2e241d);
        body.setStrokeStyle(3, 0x11100d);

        const spikes = this.scene.add.polygon(12, 0, [
            -14, -18,
            20, 0,
            -14, 18
        ], COLORS.enemy);
        spikes.setStrokeStyle(2, COLORS.enemyDark);

        const engine = this.scene.add.circle(-12, 0, 9, 0x813326);
        const wheelA = this.scene.add.circle(-16, 17, 6, 0x101010);
        const wheelB = this.scene.add.circle(14, 17, 6, 0x101010);

        this.visual.add([shadow, body, spikes, engine, wheelA, wheelB]);
    }

    private addScoutDroneVisual() {
        const shadow = this.scene.add.ellipse(1, 12, 50, 18, 0x000000, 0.28);
        const body = this.scene.add.circle(0, 0, 13, 0x293123);
        body.setStrokeStyle(3, 0xa9c963);

        const rotorA = this.scene.add.rectangle(0, 0, 58, 4, 0xd0d6bf, 0.82);
        rotorA.setRotation(0.75);

        const rotorB = this.scene.add.rectangle(0, 0, 58, 4, 0xd0d6bf, 0.82);
        rotorB.setRotation(-0.75);

        const nose = this.scene.add.triangle(18, 0, -8, -8, -8, 8, 10, 0, 0x9fc14d);
        nose.setStrokeStyle(2, 0x2c3519);

        this.visual.add([shadow, rotorA, rotorB, nose, body]);
    }

    private addStrikeDroneVisual() {
        const shadow = this.scene.add.ellipse(1, 14, 58, 20, 0x000000, 0.3);
        const body = this.scene.add.polygon(0, 0, [
            -28, -9,
            10, -20,
            30, 0,
            10, 20,
            -28, 9
        ], 0x6c7466);
        body.setStrokeStyle(3, 0x22261f);

        const cockpit = this.scene.add.circle(6, 0, 7, 0x252f31, 0.96);
        cockpit.setStrokeStyle(2, 0xaeb8aa, 0.7);

        const wingA = this.scene.add.triangle(-6, -12, -22, -3, 8, -34, 18, -7, 0x8b9383);
        const wingB = this.scene.add.triangle(-6, 12, -22, 3, 8, 34, 18, 7, 0x8b9383);
        wingA.setStrokeStyle(2, 0x22261f);
        wingB.setStrokeStyle(2, 0x22261f);

        this.visual.add([shadow, wingA, wingB, body, cockpit]);
    }

    private faceInitialDirection() {
        if (this.isSideViewEnemy()) {
            this.visual.scaleX = this.spawnSide === 'right' ? -1 : 1;
        }
    }

    private updateFacing(target: Point) {
        if (this.isSideViewEnemy()) {
            this.container.rotation = 0;
            this.visual.scaleX = target.x < this.x ? -1 : 1;
            return;
        }

        this.visual.rotation = angleBetween(this.position, target);
    }

    private isSideViewEnemy() {
        return this.kind === 'car' || this.kind === 'raider';
    }
}
