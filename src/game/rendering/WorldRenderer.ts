import type { Scene } from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, WORLD } from '../config/gameplay'

export const WORLD_TEXTURE_KEYS = {
    sand: 'world-texture-sand',
    road: 'world-texture-road'
};

const ROAD_TEXTURE_SOURCE_HEIGHT = 608;
const ROAD_TEXTURE_DISPLAY_HEIGHT = WORLD.roadHeight;
const SAND_TILE_SCALE = 0.4;
const ROAD_TILE_SCALE = 0.3;
const ROAD_TILE_SCALE_Y = ROAD_TEXTURE_DISPLAY_HEIGHT / ROAD_TEXTURE_SOURCE_HEIGHT;

type Scenery = {
    x: number;
    y: number;
    size: number;
    kind: 'rock' | 'tree' | 'scrub';
};

export class WorldRenderer {
    private readonly sand: Phaser.GameObjects.TileSprite;
    private readonly road: Phaser.GameObjects.TileSprite;
    private readonly sceneryGraphics: Phaser.GameObjects.Graphics;
    private readonly scenery: Scenery[];
    private scroll = 0;
    private readonly wrapWidth = GAME_WIDTH + 180;

    constructor(scene: Scene) {
        this.sand = scene.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, WORLD_TEXTURE_KEYS.sand);
        this.sand.setOrigin(0);
        this.sand.setDepth(0);
        this.sand.setTileScale(SAND_TILE_SCALE);

        this.sceneryGraphics = scene.add.graphics();
        this.sceneryGraphics.setDepth(1);

        this.road = scene.add.tileSprite(
            0,
            WORLD.roadY - ROAD_TEXTURE_DISPLAY_HEIGHT / 2,
            GAME_WIDTH,
            ROAD_TEXTURE_DISPLAY_HEIGHT,
            WORLD_TEXTURE_KEYS.road
        );
        this.road.setOrigin(0);
        this.road.setDepth(2);
        this.road.setTileScale(ROAD_TILE_SCALE, ROAD_TILE_SCALE_Y);

        this.scenery = this.createScenery();
        this.draw();
    }

    update(deltaSeconds: number) {
        this.scroll += WORLD.scrollSpeed * deltaSeconds;
        this.sand.tilePositionX = this.scroll / SAND_TILE_SCALE;
        this.road.tilePositionX = this.scroll / ROAD_TILE_SCALE;
        this.draw();
    }

    private draw() {
        const g = this.sceneryGraphics;
        g.clear();
        this.drawScenery(g);
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
