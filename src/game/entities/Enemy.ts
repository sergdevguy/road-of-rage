import type { Scene } from 'phaser';
import type { EnemyType } from '../config/enemies';
import { COLORS, ENEMY, TRUCK } from '../config/gameplay';
import type { Point, SpawnSide } from '../types';
import { angleBetween, distanceSquared } from '../utils/math';

type EnemyOptions = {
    type: EnemyType;
    position: Point;
    spawnSide: SpawnSide;
    maxHp: number;
    speed: number;
    damage: number;
    reward: number;
};

export class Enemy {
    readonly radius = ENEMY.collisionRadius;

    private readonly scene: Scene;
    private readonly container: Phaser.GameObjects.Container;
    private readonly visual: Phaser.GameObjects.Container;
    private readonly healthFill: Phaser.GameObjects.Rectangle;
    private readonly enemyType: EnemyType;
    private readonly spawnSide: SpawnSide;
    private readonly maxHp: number;
    private readonly speed: number;
    private readonly damage: number;
    private readonly rewardValue: number;
    private hp: number;
    private attackCooldownMs = 0;
    private destroyed = false;

    constructor(scene: Scene, options: EnemyOptions) {
        this.scene = scene;
        this.enemyType = options.type;
        this.spawnSide = options.spawnSide;
        this.hp = options.maxHp;
        this.maxHp = options.maxHp;
        this.speed = options.speed;
        this.damage = options.damage;
        this.rewardValue = options.reward;
        this.container = scene.add.container(options.position.x, options.position.y);
        this.container.setDepth(15);
        this.visual = scene.add.container(0, 0);
        this.container.add(this.visual);

        if (options.type === 'fastCar') {
            this.addFastCarVisual();
        } else if (options.type === 'armoredCar') {
            this.addArmoredCarVisual();
        } else {
            this.addDroneVisual();
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

    get reward() {
        return this.rewardValue;
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
            return this.damage;
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

    private addFastCarVisual() {
        const shadow = this.scene.add.ellipse(2, 9, 46, 20, 0x000000, 0.3);
        const body = this.scene.add.rectangle(0, 0, 42, 22, COLORS.enemy);
        body.setStrokeStyle(3, COLORS.enemyDark);

        const hood = this.scene.add.rectangle(13, 0, 14, 18, 0xf15b42);
        const glass = this.scene.add.rectangle(-8, -1, 14, 14, 0x252d31, 0.95);
        const stripe = this.scene.add.rectangle(-3, -8, 28, 3, 0xffc15f, 0.92);
        const wheelA = this.scene.add.circle(-13, 13, 4, 0x101010);
        const wheelB = this.scene.add.circle(13, 13, 4, 0x101010);
        const light = this.scene.add.circle(21, -6, 3, 0xffd88a);

        this.visual.add([shadow, body, hood, glass, stripe, wheelA, wheelB, light]);
    }

    private addArmoredCarVisual() {
        const shadow = this.scene.add.ellipse(2, 13, 72, 32, 0x000000, 0.4);
        const body = this.scene.add.rectangle(0, 0, 66, 34, 0x573c2d);
        body.setStrokeStyle(4, 0x16120f);

        const armorPlate = this.scene.add.rectangle(-7, 0, 36, 24, 0x7b6a50);
        armorPlate.setStrokeStyle(2, 0x2a2118);

        const ram = this.scene.add.triangle(34, 0, -8, -14, -8, 14, 10, 0, 0x8c2f24);
        ram.setStrokeStyle(2, 0x2a100d);

        const turret = this.scene.add.rectangle(-9, -19, 26, 5, 0x2b2924);
        turret.setRotation(-0.24);

        const wheelA = this.scene.add.circle(-22, 18, 6, 0x101010);
        const wheelB = this.scene.add.circle(0, 18, 6, 0x101010);
        const wheelC = this.scene.add.circle(22, 18, 6, 0x101010);
        const light = this.scene.add.circle(34, -8, 3, 0xffd88a);

        this.visual.add([shadow, body, armorPlate, ram, turret, wheelA, wheelB, wheelC, light]);
    }

    private addDroneVisual() {
        const shadow = this.scene.add.ellipse(1, 12, 48, 18, 0x000000, 0.28);
        const body = this.scene.add.circle(0, 0, 12, 0x293123);
        body.setStrokeStyle(3, 0xa9c963);

        const rotorA = this.scene.add.rectangle(0, 0, 54, 4, 0xd0d6bf, 0.82);
        rotorA.setRotation(0.75);

        const rotorB = this.scene.add.rectangle(0, 0, 54, 4, 0xd0d6bf, 0.82);
        rotorB.setRotation(-0.75);

        const nose = this.scene.add.triangle(17, 0, -8, -8, -8, 8, 10, 0, 0x9fc14d);
        nose.setStrokeStyle(2, 0x2c3519);

        this.visual.add([shadow, rotorA, rotorB, nose, body]);
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
        return this.enemyType !== 'drone';
    }
}
