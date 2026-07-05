import type { Scene } from 'phaser'
import type { EnemyDefinition, EnemyType } from '../config/enemies'
import { COLORS, DEBUG, ENEMY, TRUCK } from '../config/gameplay'
import { HitboxDebug } from '../debug/HitboxDebug'
import type { Point, SpawnSide } from '../types'

export const ENEMY_TEXTURE_KEYS: Record<EnemyType, string> = {
    fastCar: 'enemy-buggy',
    armoredCar: 'enemy-kamikadze',
    drone: 'enemy-drone'
};

const ENEMY_DISPLAY_HEIGHTS: Record<EnemyType, number> = {
    fastCar: 50,
    armoredCar: 82,
    drone: 32
};

const ENEMY_SHADOWS: Record<EnemyType, { x: number; y: number; width: number; height: number; alpha: number }> = {
    fastCar: { x: 0, y: 15, width: 72, height: 18, alpha: 0.3 },
    armoredCar: { x: 0, y: 27, width: 102, height: 27, alpha: 0.34 },
    drone: { x: -10, y: 50, width: 36, height: 14, alpha: 0.24 }
};

type EnemyOptions = {
    type: EnemyType;
    position: Point;
    spawnSide: SpawnSide;
    maxHp: number;
    speed: number;
    damage: number;
    reward: number;
    hitbox: EnemyDefinition['hitbox'];
};

type Rect = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};

export class Enemy {
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
    private readonly hitbox: EnemyDefinition['hitbox'];
    private readonly positionValue: Point;
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
        this.hitbox = options.hitbox;
        this.positionValue = { ...options.position };
        this.container = scene.add.container(Math.round(options.position.x), Math.round(options.position.y));
        this.container.setDepth(15);
        this.visual = scene.add.container(0, 0);
        const shadowConfig = ENEMY_SHADOWS[options.type];
        const shadow = scene.add.ellipse(
            shadowConfig.x,
            shadowConfig.y,
            shadowConfig.width,
            shadowConfig.height,
            0x050505,
            shadowConfig.alpha
        );
        this.container.add([shadow, this.visual]);

        if (DEBUG.showHitboxes) {
            const hitbox = HitboxDebug.createRect(
                scene,
                this.hitbox.offsetX,
                this.hitbox.offsetY,
                this.hitbox.width,
                this.hitbox.height,
                0xff4f8b
            );
            this.container.add(hitbox);
        }

        this.addImageVisual(options.type);

        this.faceInitialDirection();

        const healthBarY = options.type === 'armoredCar' ? -28 : -24;
        const healthBack = scene.add.rectangle(0, healthBarY, 42, 5, 0x201915, 0.9);
        this.healthFill = scene.add.rectangle(-20, healthBarY, 40, 3, COLORS.danger);
        this.healthFill.setOrigin(0, 0.5);
        this.container.add([healthBack, this.healthFill]);
    }

    get x() {
        return this.positionValue.x;
    }

    get y() {
        return this.positionValue.y;
    }

    get position(): Point {
        return { x: this.x, y: this.y };
    }

    get reward() {
        return this.rewardValue;
    }

    get displayHeight() {
        return ENEMY_DISPLAY_HEIGHTS[this.enemyType];
    }

    update(deltaSeconds: number, target: Point) {
        if (this.destroyed) {
            return 0;
        }

        this.attackCooldownMs -= deltaSeconds * 1000;
        this.updateFacing(target);

        const truckRect = this.truckHitbox(target);

        if (!this.rectsOverlap(this.hitboxRect(), truckRect)) {
            const contactPoint = this.closestPointOnRect(this.position, truckRect);
            const dx = contactPoint.x - this.x;
            const dy = contactPoint.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            this.positionValue.x += (dx / dist) * this.speed * deltaSeconds;
            this.positionValue.y += (dy / dist) * this.speed * deltaSeconds;
            this.syncRenderPosition();
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
        const closest = this.closestPointOnRect(point, this.hitboxRect());
        const dx = point.x - closest.x;
        const dy = point.y - closest.y;

        return dx * dx + dy * dy <= radius * radius;
    }

    destroy() {
        if (this.destroyed) {
            return;
        }

        this.destroyed = true;
        this.container.destroy();
    }

    private addImageVisual(type: EnemyType) {
        const image = this.scene.add.image(0, 0, ENEMY_TEXTURE_KEYS[type]);
        const displayHeight = ENEMY_DISPLAY_HEIGHTS[type];
        image.setDisplaySize(Math.round(displayHeight * (image.width / image.height)), displayHeight);
        image.setOrigin(0.5);
        this.visual.add(image);
    }

    private syncRenderPosition() {
        this.container.setPosition(Math.round(this.positionValue.x), Math.round(this.positionValue.y));
    }

    private hitboxRect(): Rect {
        return {
            left: this.x + this.hitbox.offsetX - this.hitbox.width / 2,
            right: this.x + this.hitbox.offsetX + this.hitbox.width / 2,
            top: this.y + this.hitbox.offsetY - this.hitbox.height / 2,
            bottom: this.y + this.hitbox.offsetY + this.hitbox.height / 2
        };
    }

    private truckHitbox(target: Point): Rect {
        return {
            left: target.x + TRUCK.hitboxOffsetX - TRUCK.hitboxWidth / 2,
            right: target.x + TRUCK.hitboxOffsetX + TRUCK.hitboxWidth / 2,
            top: target.y + TRUCK.hitboxOffsetY - TRUCK.hitboxHeight / 2,
            bottom: target.y + TRUCK.hitboxOffsetY + TRUCK.hitboxHeight / 2
        };
    }

    private rectsOverlap(a: Rect, b: Rect) {
        return a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;
    }

    private closestPointOnRect(point: Point, rect: Rect): Point {
        return {
            x: Math.max(rect.left, Math.min(point.x, rect.right)),
            y: Math.max(rect.top, Math.min(point.y, rect.bottom))
        };
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

        this.visual.rotation = 0;
    }

    private isSideViewEnemy() {
        return this.enemyType !== 'drone';
    }
}
