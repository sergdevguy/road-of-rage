import type { Scene } from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/gameplay';
import { Enemy } from '../entities/Enemy';
import type { EnemyKind, Point, SpawnSide } from '../types';

type SpawnEnemyOptions = {
    hpMultiplier: number;
};

export class EnemySpawner {
    private readonly scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    spawnEnemy(options: SpawnEnemyOptions) {
        const side = this.pickSpawnSide();
        const position = this.spawnPosition(side);
        const kind = this.pickEnemyKind(side);

        return new Enemy(this.scene, kind, position, options.hpMultiplier, side);
    }

    private pickEnemyKind(side: SpawnSide): EnemyKind {
        if (side === 'left' || side === 'right') {
            return Math.random() < 0.5 ? 'car' : 'raider';
        }

        return Math.random() < 0.5 ? 'scoutDrone' : 'strikeDrone';
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
            return { x: this.randomBetween(80, GAME_WIDTH - 80), y: -70 };
        }

        return { x: this.randomBetween(80, GAME_WIDTH - 80), y: GAME_HEIGHT + 70 };
    }

    private randomBetween(min: number, max: number) {
        return min + Math.random() * (max - min);
    }
}
