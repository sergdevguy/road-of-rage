import type { Scene } from 'phaser';
import { COMBAT, COLORS } from '../config/gameplay';
import type { Point, ProjectileOwner } from '../types';

export class Projectile {
    readonly owner: ProjectileOwner;
    readonly damage: number;
    readonly radius = 7;

    private readonly body: Phaser.GameObjects.Arc;
    private readonly vx: number;
    private readonly vy: number;
    private lifeMs = 900;

    constructor(scene: Scene, position: Point, angle: number, damage: number, owner: ProjectileOwner) {
        this.owner = owner;
        this.damage = damage;
        this.vx = Math.cos(angle) * COMBAT.projectileSpeed;
        this.vy = Math.sin(angle) * COMBAT.projectileSpeed;

        this.body = scene.add.circle(position.x, position.y, owner === 'drone' ? 4 : 5, COLORS.projectile, 1);
        this.body.setStrokeStyle(2, 0xffffff, 0.72);
        this.body.setDepth(45);
    }

    get x() {
        return this.body.x;
    }

    get y() {
        return this.body.y;
    }

    get position(): Point {
        return { x: this.x, y: this.y };
    }

    update(deltaSeconds: number) {
        this.body.x += this.vx * deltaSeconds;
        this.body.y += this.vy * deltaSeconds;
        this.lifeMs -= deltaSeconds * 1000;
    }

    isExpired() {
        return this.lifeMs <= 0 || this.x < -80 || this.x > 1104 || this.y < -80 || this.y > 848;
    }

    destroy() {
        this.body.destroy();
    }
}
