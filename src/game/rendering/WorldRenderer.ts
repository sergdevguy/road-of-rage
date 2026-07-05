import type { Scene } from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, WORLD } from '../config/gameplay'

export const WORLD_TEXTURE_KEYS = {
    sand: 'world-texture-sand',
    road: 'world-texture-road',
    grass1: 'world-decor-grass-1',
    grass2: 'world-decor-grass-2',
    stone1: 'world-decor-stone-1',
    stone2: 'world-decor-stone-2',
    barrel1: 'world-decor-barrel-1',
    sign: 'world-decor-sign'
};

const ROAD_TEXTURE_SOURCE_HEIGHT = 608;
const ROAD_TEXTURE_DISPLAY_HEIGHT = WORLD.roadHeight;
const SAND_TILE_SCALE = 0.4;
const ROAD_TILE_SCALE = 0.3;
const ROAD_TILE_SCALE_Y = ROAD_TEXTURE_DISPLAY_HEIGHT / ROAD_TEXTURE_SOURCE_HEIGHT;
const ROAD_DECOR_PADDING = 34;

type DecorZone = {
    minY: number;
    maxY: number;
};

const FIELD_DECOR_ZONES: DecorZone[] = [
    { minY: 54, maxY: WORLD.roadY - WORLD.roadHeight / 2 - ROAD_DECOR_PADDING },
    { minY: WORLD.roadY + WORLD.roadHeight / 2 + ROAD_DECOR_PADDING, maxY: GAME_HEIGHT - 22 }
];

const EDGE_DECOR_ZONES: DecorZone[] = [
    { minY: 70, maxY: 210 },
    { minY: GAME_HEIGHT - 175, maxY: GAME_HEIGHT - 42 }
];

type Scenery = {
    x: number;
    y: number;
    image: Phaser.GameObjects.Image;
};

export class WorldRenderer {
    private readonly sand: Phaser.GameObjects.TileSprite;
    private readonly road: Phaser.GameObjects.TileSprite;
    private readonly scenery: Scenery[];
    private scroll = 0;
    private readonly wrapWidth = GAME_WIDTH + 180;

    constructor(scene: Scene) {
        this.sand = scene.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, WORLD_TEXTURE_KEYS.sand);
        this.sand.setOrigin(0);
        this.sand.setDepth(0);
        this.sand.setTileScale(SAND_TILE_SCALE);

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

        this.scenery = this.createScenery(scene);
        this.updateScenery();
    }

    update(deltaSeconds: number) {
        this.scroll += WORLD.scrollSpeed * deltaSeconds;
        this.sand.tilePositionX = this.scroll / SAND_TILE_SCALE;
        this.road.tilePositionX = this.scroll / ROAD_TILE_SCALE;
        this.updateScenery();
    }

    private updateScenery() {
        for (const item of this.scenery) {
            const x = this.wrapX(item.x - this.scroll);
            item.image.setX(x);
        }
    }

    private wrapX(x: number) {
        return ((x + 90) % this.wrapWidth + this.wrapWidth) % this.wrapWidth - 90;
    }

    private createScenery(scene: Scene): Scenery[] {
        const items: Scenery[] = [];

        for (let x = -70; x < this.wrapWidth; x += 46) {
            const seed = x * 13 + 17;
            const y = this.randomY(FIELD_DECOR_ZONES, seed);
            const jitterX = this.randomRange(seed + 3, -18, 18);
            items.push(this.createDecor(
                scene,
                x + jitterX,
                y,
                this.pickGrassTexture(seed),
                this.randomRange(seed + 7, 0.25, 0.38)
            ));
        }

        for (let x = -30; x < this.wrapWidth; x += 128) {
            const seed = x * 19 + 41;
            const y = this.randomY(FIELD_DECOR_ZONES, seed);
            const jitterX = this.randomRange(seed + 5, -34, 34);
            items.push(this.createDecor(
                scene,
                x + jitterX,
                y,
                this.pickStoneTexture(seed),
                this.randomRange(seed + 9, 0.38, 0.58)
            ));
        }

        for (let x = 140; x < this.wrapWidth; x += 520) {
            const seed = x * 23 + 83;
            const y = this.randomY(EDGE_DECOR_ZONES, seed);
            const jitterX = this.randomRange(seed + 11, -46, 46);
            items.push(this.createDecor(scene, x + jitterX, y, WORLD_TEXTURE_KEYS.barrel1, 0.42));
        }

        for (let x = 380; x < this.wrapWidth; x += 920) {
            const seed = x * 29 + 127;
            const y = this.randomY(EDGE_DECOR_ZONES, seed);
            const jitterX = this.randomRange(seed + 13, -52, 52);
            items.push(this.createDecor(scene, x + jitterX, y, WORLD_TEXTURE_KEYS.sign, 0.36));
        }

        return items;
    }

    private createDecor(scene: Scene, x: number, y: number, textureKey: string, scale: number): Scenery {
        const image = scene.add.image(x, y, textureKey);
        image.setOrigin(0.5, 0.82);
        image.setDepth(1);
        image.setScale(scale);

        return { x, y, image };
    }

    private pickGrassTexture(seed: number) {
        return seed % 2 === 0 ? WORLD_TEXTURE_KEYS.grass1 : WORLD_TEXTURE_KEYS.grass2;
    }

    private pickStoneTexture(seed: number) {
        return seed % 2 === 0 ? WORLD_TEXTURE_KEYS.stone1 : WORLD_TEXTURE_KEYS.stone2;
    }

    private randomY(zones: DecorZone[], seed: number) {
        const zoneIndex = Math.min(Math.floor(this.seededRandom(seed) * zones.length), zones.length - 1);
        const zone = zones[zoneIndex];
        return this.randomRange(seed + 101, zone.minY, zone.maxY);
    }

    private randomRange(seed: number, min: number, max: number) {
        return min + this.seededRandom(seed) * (max - min);
    }

    private seededRandom(seed: number) {
        const value = Math.sin(seed * 12.9898) * 43758.5453;
        return value - Math.floor(value);
    }
}
