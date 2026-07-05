import type { Scene } from 'phaser';
import { COLORS, COMBAT } from '../config/gameplay';
import type { Point } from '../types';
import { angleBetween, distanceSquared, pointOnCircle } from '../utils/math';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { Truck } from './Truck';
import { AudioManager } from '../systems/AudioManager';

const BARREL_MUZZLE_OFFSET = 42;
const PROJECTILE_SPAWN_OFFSET = 38;
const MUZZLE_FLASH_OFFSET = 48;

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

        this.createVisual();
        this.truck.add(this.container);
    }

    private createVisual() {
        const shadow = this.scene.add.ellipse(0, 9, 38, 14, 0x050705, 0.34);

        const barrelBack = this.scene.add.rectangle(14, 0, 30, 9, 0x5d612f);
        barrelBack.setOrigin(0, 0.5);
        barrelBack.setStrokeStyle(2, 0x202512, 1);

        const barrel = this.scene.add.rectangle(18, 0, 30, 6, 0xe5d47d);
        barrel.setOrigin(0, 0.5);
        barrel.setStrokeStyle(1, 0x78642b, 1);

        const muzzle = this.scene.add.rectangle(BARREL_MUZZLE_OFFSET, 0, 8, 11, 0x28291b);
        muzzle.setStrokeStyle(1, 0x0c0d08, 1);

        const base = this.scene.add.ellipse(0, 2, 36, 28, 0x2a321d);
        base.setStrokeStyle(3, 0x11160d, 1);

        const armorPlate = this.scene.add.rectangle(0, -2, 27, 20, 0x4f6030);
        armorPlate.setStrokeStyle(2, 0x15190f, 1);

        const ring = this.scene.add.circle(0, -2, 11, COLORS.turret);
        ring.setStrokeStyle(3, 0x253316, 1);

        const core = this.scene.add.circle(0, -2, 5, 0xd4e989);
        core.setStrokeStyle(1, 0x465b22, 1);

        const bolts = [
            this.scene.add.circle(-11, 7, 2, 0xa5b36a),
            this.scene.add.circle(11, 7, 2, 0xa5b36a)
        ];

        this.container.add([
            shadow,
            barrelBack,
            barrel,
            muzzle,
            base,
            armorPlate,
            ring,
            core,
            ...bolts
        ]);
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
            pointOnCircle(position, PROJECTILE_SPAWN_OFFSET, angle),
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
        const muzzle = pointOnCircle(position, MUZZLE_FLASH_OFFSET, angle);
        const flash = this.scene.add.circle(muzzle.x, muzzle.y, 7, 0xfff2a3, 0.9);
        flash.setDepth(50);

        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scaleX: 1.7,
            scaleY: 1.7,
            duration: 90,
            onComplete: () => flash.destroy()
        });
    }
}
