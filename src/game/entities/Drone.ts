import type { Scene } from 'phaser';
import { COLORS, COMBAT, DRONE } from '../config/gameplay';
import type { Point } from '../types';
import { angleBetween, distanceSquared, pointOnCircle } from '../utils/math';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { Truck } from './Truck';

type DroneStats = {
    damage: number;
    fireDelay: number;
};

export class Drone {
    private readonly scene: Scene;
    private readonly truck: Truck;
    private readonly statsProvider: () => DroneStats;
    private readonly container: Phaser.GameObjects.Container;
    private readonly cannon: Phaser.GameObjects.Rectangle;
    private readonly orbitRadius: number;
    private readonly orbitSpeed: number;
    private phase: number;
    private cooldownMs = 0;

    constructor(scene: Scene, truck: Truck, phase: number, orbitRadius: number, statsProvider: () => DroneStats) {
        this.scene = scene;
        this.truck = truck;
        this.statsProvider = statsProvider;
        this.phase = phase;
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = 1.4 + Math.random() * 0.35;
        this.container = scene.add.container(truck.x, truck.y);
        this.container.setDepth(30);
        this.container.setScale(DRONE.scale);

        const shadow = scene.add.ellipse(0, 15, 36, 14, 0x000000, 0.24);
        const body = scene.add.circle(0, 0, 14, 0x354026);
        body.setStrokeStyle(3, COLORS.drone);

        this.cannon = scene.add.rectangle(13, 0, 25, 5, 0xe3e084);
        this.cannon.setOrigin(0, 0.5);
        this.cannon.setStrokeStyle(1, 0x5e5a2a);

        const rotorA = scene.add.line(0, 0, -25, -17, 25, 17, 0xcbd7be, 0.75);
        const rotorB = scene.add.line(0, 0, -25, 17, 25, -17, 0xcbd7be, 0.75);
        rotorA.setLineWidth(3);
        rotorB.setLineWidth(3);

        this.container.add([shadow, rotorA, rotorB, this.cannon, body]);
    }

    update(deltaSeconds: number, enemies: Enemy[]) {
        this.phase += this.orbitSpeed * deltaSeconds;
        this.cooldownMs -= deltaSeconds * 1000;

        const bob = Math.sin(this.phase * 2.1) * 8;
        const position = pointOnCircle(this.truck.position, this.orbitRadius, this.phase);
        this.container.x = position.x;
        this.container.y = position.y + bob;

        const target = this.findTarget(enemies);

        if (!target) {
            this.cannon.rotation = this.phase;
            return null;
        }

        const angle = angleBetween(this.position, target.position);
        this.cannon.rotation = angle;

        if (this.cooldownMs > 0) {
            return null;
        }

        const stats = this.statsProvider();
        this.cooldownMs = stats.fireDelay;

        return new Projectile(
            this.scene,
            pointOnCircle(this.position, 28, angle),
            angle,
            stats.damage,
            'drone'
        );
    }

    private get position(): Point {
        return {
            x: this.container.x,
            y: this.container.y
        };
    }

    private findTarget(enemies: Enemy[]) {
        const rangeSq = COMBAT.droneRange * COMBAT.droneRange;
        let closest: Enemy | null = null;
        let closestDistance = rangeSq;

        for (const enemy of enemies) {
            if (enemy.isDestroyed()) {
                continue;
            }

            const distance = distanceSquared(this.position, enemy.position);

            if (distance < closestDistance) {
                closest = enemy;
                closestDistance = distance;
            }
        }

        return closest;
    }
}
