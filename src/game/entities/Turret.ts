import type { Scene } from 'phaser';
import { COLORS, COMBAT } from '../config/gameplay';
import type { Point } from '../types';
import { angleBetween, distanceSquared, pointOnCircle } from '../utils/math';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { Truck } from './Truck';
import { AudioManager } from '../systems/AudioManager';

type TurretStats = {
    damage: number;
    fireDelay: number;
};

export class Turret {
    private readonly scene: Scene;
    private readonly truck: Truck;
    private readonly mount: Point;
    private readonly statsProvider: () => TurretStats;
    private readonly container: Phaser.GameObjects.Container;
    private cooldownMs = 0;

    constructor(scene: Scene, truck: Truck, mount: Point, statsProvider: () => TurretStats) {
        this.scene = scene;
        this.truck = truck;
        this.mount = mount;
        this.statsProvider = statsProvider;
        this.container = scene.add.container(mount.x, mount.y);

        const base = scene.add.circle(0, 0, 16, 0x2d3a21);
        base.setStrokeStyle(3, 0x80975a);

        const ring = scene.add.circle(0, 0, 9, COLORS.turret);
        ring.setStrokeStyle(2, 0x233016);

        const barrel = scene.add.rectangle(16, 0, 34, 7, 0xe8d67a);
        barrel.setOrigin(0, 0.5);
        barrel.setStrokeStyle(2, 0x6f5d25);

        this.container.add([barrel, base, ring]);
        this.truck.add(this.container);
    }

    update(deltaSeconds: number, enemies: Enemy[]) {
        this.cooldownMs -= deltaSeconds * 1000;

        const target = this.findTarget(enemies);

        if (!target) {
            return null;
        }

        const position = this.worldPosition();
        const angle = angleBetween(position, target.position);
        this.container.rotation = angle;

        if (this.cooldownMs > 0) {
            return null;
        }

        const stats = this.statsProvider();
        this.cooldownMs = stats.fireDelay;
        AudioManager.playSfx(this.scene, 'turretShot');
        this.flash(position, angle);

        return new Projectile(
            this.scene,
            pointOnCircle(position, 34, angle),
            angle,
            stats.damage,
            'turret'
        );
    }

    private worldPosition(): Point {
        return {
            x: this.truck.x + this.mount.x,
            y: this.truck.y + this.mount.y
        };
    }

    private findTarget(enemies: Enemy[]) {
        const position = this.worldPosition();
        const rangeSq = COMBAT.turretRange * COMBAT.turretRange;
        let closest: Enemy | null = null;
        let closestDistance = rangeSq;

        for (const enemy of enemies) {
            if (enemy.isDestroyed()) {
                continue;
            }

            const distance = distanceSquared(position, enemy.position);

            if (distance < closestDistance) {
                closest = enemy;
                closestDistance = distance;
            }
        }

        return closest;
    }

    private flash(position: Point, angle: number) {
        const muzzle = pointOnCircle(position, 52, angle);
        const flash = this.scene.add.circle(muzzle.x, muzzle.y, 9, 0xfff2a3, 0.9);
        flash.setDepth(50);

        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scaleX: 1.8,
            scaleY: 1.8,
            duration: 90,
            onComplete: () => flash.destroy()
        });
    }
}
