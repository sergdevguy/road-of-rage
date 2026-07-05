import type { Scene } from 'phaser';
import { COMBAT, COLORS } from '../config/gameplay';
import type { Point, ProjectileOwner } from '../types';

type ProjectileStyle = {
    radius: number;
    coreWidth: number;
    coreHeight: number;
    trailWidth: number;
    trailHeight: number;
    coreColor: number;
    trailColor: number;
    glowColor: number;
};

const PROJECTILE_STYLES: Record<ProjectileOwner, ProjectileStyle> = {
    turret: {
        radius: 7,
        coreWidth: 20,
        coreHeight: 6,
        trailWidth: 18,
        trailHeight: 4,
        coreColor: 0xffe083,
        trailColor: 0xff9d38,
        glowColor: 0xfff3b0
    },
    drone: {
        radius: 5,
        coreWidth: 14,
        coreHeight: 5,
        trailWidth: 13,
        trailHeight: 3,
        coreColor: 0x9feaff,
        trailColor: 0x4ca9ff,
        glowColor: 0xd8fbff
    }
};

export class Projectile {
    readonly owner: ProjectileOwner;
    readonly damage: number;
    readonly radius: number;

    private readonly body: Phaser.GameObjects.Container;
    private readonly vx: number;
    private readonly vy: number;
    private lifeMs = 900;
    private destroyed = false;

    constructor(scene: Scene, position: Point, angle: number, damage: number, owner: ProjectileOwner) {
        this.owner = owner;
        this.damage = damage;
        this.radius = PROJECTILE_STYLES[owner].radius;
        this.vx = Math.cos(angle) * COMBAT.projectileSpeed;
        this.vy = Math.sin(angle) * COMBAT.projectileSpeed;

        this.body = scene.add.container(position.x, position.y);
        this.body.setRotation(angle);
        this.body.setDepth(45);
        this.createVisual(scene, PROJECTILE_STYLES[owner]);
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
        if (this.destroyed) {
            return;
        }

        this.body.x += this.vx * deltaSeconds;
        this.body.y += this.vy * deltaSeconds;
        this.lifeMs -= deltaSeconds * 1000;
    }

    isExpired() {
        return this.destroyed || this.lifeMs <= 0 || this.x < -80 || this.x > 1104 || this.y < -80 || this.y > 848;
    }

    destroy() {
        if (this.destroyed) {
            return;
        }

        this.destroyed = true;
        this.lifeMs = 0;
        this.body.destroy();
    }

    private createVisual(scene: Scene, style: ProjectileStyle) {
        const glow = scene.add.ellipse(0, 0, style.coreWidth + 8, style.coreHeight + 8, style.glowColor, 0.22);

        const trail = scene.add.rectangle(
            -style.coreWidth / 2,
            0,
            style.trailWidth,
            style.trailHeight,
            style.trailColor,
            0.55
        );
        trail.setOrigin(1, 0.5);

        const core = scene.add.rectangle(0, 0, style.coreWidth, style.coreHeight, style.coreColor, 1);
        core.setStrokeStyle(1, 0xffffff, 0.65);

        const tip = scene.add.circle(style.coreWidth / 2, 0, style.coreHeight / 2, COLORS.projectile, 1);
        tip.setStrokeStyle(1, 0xffffff, 0.55);

        this.body.add([glow, trail, core, tip]);
    }
}
