import type { Scene } from 'phaser';

const HITBOX_FILL_ALPHA = 0.08;
const HITBOX_STROKE_ALPHA = 0.9;
const HITBOX_STROKE_WIDTH = 2;

export const HitboxDebug = {
    createCircle(scene: Scene, x: number, y: number, radius: number, color: number) {
        const circle = scene.add.circle(x, y, radius, color, HITBOX_FILL_ALPHA);
        circle.setStrokeStyle(HITBOX_STROKE_WIDTH, color, HITBOX_STROKE_ALPHA);
        return circle;
    }
};
