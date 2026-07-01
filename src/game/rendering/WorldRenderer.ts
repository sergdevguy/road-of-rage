import type { Scene } from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH, WORLD } from '../config/gameplay';

type Scenery = {
    x: number;
    y: number;
    size: number;
    kind: 'rock' | 'tree' | 'scrub';
};

export class WorldRenderer {
    private readonly graphics: Phaser.GameObjects.Graphics;
    private readonly scenery: Scenery[];
    private scroll = 0;
    private readonly wrapWidth = GAME_WIDTH + 180;

    constructor(scene: Scene) {
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(0);
        this.scenery = this.createScenery();
        this.draw();
    }

    update(deltaSeconds: number) {
        this.scroll += WORLD.scrollSpeed * deltaSeconds;
        this.draw();
    }

    private draw() {
        const g = this.graphics;
        g.clear();

        g.fillStyle(COLORS.dirt, 1);
        g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        this.drawGroundTexture(g);
        this.drawScenery(g);
        this.drawRoad(g);
    }

    private drawGroundTexture(g: Phaser.GameObjects.Graphics) {
        g.lineStyle(1, 0x5a4a34, 0.22);

        for (let x = -40 - (this.scroll % 82); x < GAME_WIDTH + 80; x += 82) {
            g.lineBetween(x, 160, x + 38, 138);
            g.lineBetween(x + 42, 612, x + 74, 584);
        }

        g.fillStyle(0x211d16, 0.22);

        for (let x = -90 - (this.scroll % 118); x < GAME_WIDTH + 100; x += 118) {
            g.fillCircle(x, 250 + Math.sin(x) * 18, 3);
            g.fillCircle(x + 46, 650 + Math.cos(x) * 16, 4);
            g.fillCircle(x + 84, 340 + Math.sin(x * 0.4) * 28, 2);
        }
    }

    private drawScenery(g: Phaser.GameObjects.Graphics) {
        for (const item of this.scenery) {
            const x = this.wrapX(item.x - this.scroll);

            if (Math.abs(item.y - WORLD.roadY) < WORLD.roadHeight * 0.75) {
                continue;
            }

            if (item.kind === 'tree') {
                this.drawTree(g, x, item.y, item.size);
            } else if (item.kind === 'rock') {
                this.drawRock(g, x, item.y, item.size);
            } else {
                this.drawScrub(g, x, item.y, item.size);
            }
        }
    }

    private drawRoad(g: Phaser.GameObjects.Graphics) {
        const roadTop = WORLD.roadY - WORLD.roadHeight / 2;

        g.fillStyle(0x171713, 0.48);
        g.fillRect(0, roadTop + 8, GAME_WIDTH, WORLD.roadHeight);

        g.fillStyle(COLORS.road, 1);
        g.fillRect(0, roadTop, GAME_WIDTH, WORLD.roadHeight);

        g.lineStyle(3, COLORS.roadEdge, 0.8);
        g.lineBetween(0, roadTop + 2, GAME_WIDTH, roadTop + 2);
        g.lineBetween(0, roadTop + WORLD.roadHeight - 2, GAME_WIDTH, roadTop + WORLD.roadHeight - 2);

        g.lineStyle(4, 0xb7ad92, 0.36);

        for (let x = -100 - (this.scroll % 118); x < GAME_WIDTH + 100; x += 118) {
            g.lineBetween(x, WORLD.roadY, x + 48, WORLD.roadY);
        }
    }

    private drawTree(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number) {
        g.fillStyle(0x151209, 0.32);
        g.fillEllipse(x + 8, y + size * 0.34, size * 1.25, size * 0.42);

        g.fillStyle(0x2a3219, 1);
        g.fillCircle(x, y, size * 0.48);
        g.fillCircle(x - size * 0.33, y + size * 0.12, size * 0.34);
        g.fillCircle(x + size * 0.26, y + size * 0.18, size * 0.36);

        g.fillStyle(0x4c5724, 0.9);
        g.fillCircle(x - size * 0.1, y - size * 0.12, size * 0.24);
    }

    private drawRock(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number) {
        g.fillStyle(0x17130f, 0.22);
        g.fillEllipse(x + 3, y + size * 0.25, size * 1.1, size * 0.34);

        g.fillStyle(0x6b6049, 0.85);
        g.fillTriangle(x - size * 0.45, y + size * 0.2, x, y - size * 0.45, x + size * 0.48, y + size * 0.18);
        g.fillStyle(0x3d382c, 0.9);
        g.fillTriangle(x - size * 0.1, y + size * 0.24, x + size * 0.5, y + size * 0.18, x + size * 0.12, y - size * 0.4);
    }

    private drawScrub(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number) {
        g.lineStyle(3, 0x2e351b, 0.8);
        g.lineBetween(x, y, x - size * 0.35, y - size * 0.35);
        g.lineBetween(x, y, x + size * 0.35, y - size * 0.28);
        g.lineBetween(x, y, x + size * 0.08, y - size * 0.55);
    }

    private wrapX(x: number) {
        return ((x + 90) % this.wrapWidth + this.wrapWidth) % this.wrapWidth - 90;
    }

    private createScenery(): Scenery[] {
        return [
            { x: 70, y: 170, size: 58, kind: 'tree' },
            { x: 210, y: 260, size: 28, kind: 'rock' },
            { x: 345, y: 145, size: 36, kind: 'rock' },
            { x: 545, y: 170, size: 66, kind: 'tree' },
            { x: 815, y: 245, size: 48, kind: 'tree' },
            { x: 960, y: 178, size: 24, kind: 'scrub' },
            { x: 1125, y: 206, size: 54, kind: 'tree' },
            { x: 1240, y: 150, size: 30, kind: 'rock' },
            { x: 130, y: 650, size: 62, kind: 'tree' },
            { x: 300, y: 610, size: 24, kind: 'rock' },
            { x: 585, y: 690, size: 68, kind: 'tree' },
            { x: 760, y: 590, size: 18, kind: 'scrub' },
            { x: 905, y: 640, size: 58, kind: 'tree' },
            { x: 1110, y: 620, size: 24, kind: 'scrub' },
            { x: 1220, y: 670, size: 56, kind: 'tree' }
        ];
    }
}
