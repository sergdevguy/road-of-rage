import type { Scene } from 'phaser'
import { COMBAT, DRONE } from '../config/gameplay'
import type { Point } from '../types'
import { angleBetween, distanceSquared, pointOnCircle } from '../utils/math'
import { Enemy } from './Enemy'
import { Projectile } from './Projectile'
import { Truck } from './Truck'
import { AudioManager } from '../systems/AudioManager'

export const PLAYER_DRONE_TEXTURE_KEY = 'player-drone';
const PLAYER_DRONE_DISPLAY_HEIGHT = 42;

type DroneStats = {
    damage: number;
    fireDelay: number;
};

export class Drone {
    private readonly scene: Scene;
    private readonly truck: Truck;
    private readonly statsProvider: () => DroneStats;
    private readonly container: Phaser.GameObjects.Container;
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

        const droneImage = scene.add.image(0, 0, PLAYER_DRONE_TEXTURE_KEY);
        droneImage.setDisplaySize(
            PLAYER_DRONE_DISPLAY_HEIGHT * (droneImage.width / droneImage.height),
            PLAYER_DRONE_DISPLAY_HEIGHT
        );
        droneImage.setOrigin(0.5);

        this.container.add(droneImage);
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
            return null;
        }

        const angle = angleBetween(this.position, target.position);

        if (this.cooldownMs > 0) {
            return null;
        }

        const stats = this.statsProvider();
        this.cooldownMs = stats.fireDelay;
        AudioManager.playSfx(this.scene, 'droneShot');

        return new Projectile(
            this.scene,
            this.position,
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
