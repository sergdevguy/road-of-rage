import type { Scene } from 'phaser';
import type { Point } from '../types';
import { AudioManager } from '../systems/AudioManager';

export const EXPLOSION_TEXTURE_KEY = 'explosion';
const EXPLOSION_ANIMATION_KEY = 'explosion-play';
const EXPLOSION_FRAME_WIDTH = 64;
const EXPLOSION_FRAME_HEIGHT = 66;
const EXPLOSION_FRAME_COUNT = 11;
const EXPLOSION_SCALE_MULTIPLIER = 2.2;

export class Explosion {
    static createAnimation(scene: Scene) {
        if (scene.anims.exists(EXPLOSION_ANIMATION_KEY)) {
            return;
        }

        scene.anims.create({
            key: EXPLOSION_ANIMATION_KEY,
            frames: scene.anims.generateFrameNumbers(EXPLOSION_TEXTURE_KEY, {
                start: 0,
                end: EXPLOSION_FRAME_COUNT - 1
            }),
            frameRate: 28,
            repeat: 0
        });
    }

    constructor(scene: Scene, position: Point, displayHeight: number) {
        AudioManager.playSfx(scene, 'enemyExplosion');
        const sprite = scene.add.sprite(position.x, position.y, EXPLOSION_TEXTURE_KEY);
        const explosionHeight = displayHeight * EXPLOSION_SCALE_MULTIPLIER;
        sprite.setDepth(55);
        sprite.setOrigin(0.5);
        sprite.setDisplaySize(
            explosionHeight * (EXPLOSION_FRAME_WIDTH / EXPLOSION_FRAME_HEIGHT),
            explosionHeight
        );
        sprite.once('animationcomplete', () => sprite.destroy());
        sprite.play(EXPLOSION_ANIMATION_KEY);
    }
}
