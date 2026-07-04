import type { Scene } from 'phaser';
import { ENEMY_DEFINITIONS, type EnemyType } from '../config/enemies';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/gameplay';
import { Enemy } from '../entities/Enemy';
import { AudioManager } from '../systems/AudioManager';
import type { Point, SpawnSide } from '../types';

type SpawnEnemyOptions = {
    type: EnemyType;
    hpMultiplier: number;
};

export class EnemySpawner {
    private readonly scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    spawnEnemy(options: SpawnEnemyOptions) {
        const definition = ENEMY_DEFINITIONS[options.type];
        const side = this.pickSpawnSide(options.type);
        const position = this.spawnPosition(side);

        const enemy = new Enemy(this.scene, {
            type: definition.type,
            position,
            spawnSide: side,
            maxHp: Math.ceil(definition.maxHp * options.hpMultiplier),
            speed: definition.speed,
            damage: definition.damage,
            reward: definition.reward
        });

        AudioManager.playSfx(this.scene, this.spawnSoundKey(options.type));

        return enemy;
    }

    private pickSpawnSide(type: EnemyType): SpawnSide {
        if (type === 'fastCar') {
            return 'left';
        }

        if (type === 'armoredCar') {
            return 'right';
        }

        return Math.random() < 0.5 ? 'top' : 'bottom';
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

    private spawnSoundKey(type: EnemyType) {
        if (type === 'fastCar') {
            return 'fastCarSpawn';
        }

        if (type === 'armoredCar') {
            return 'armoredCarSpawn';
        }

        return 'droneSpawn';
    }
}
