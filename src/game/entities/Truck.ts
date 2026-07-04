import type { Scene } from 'phaser'
import { COLORS, TRUCK, WORLD } from '../config/gameplay'
import type { Point } from '../types'

export const TRUCK_TEXTURE_KEY = 'player-truck';
export const TRUCK_WHEEL_TEXTURE_KEY = 'player-truck-wheel';

const TRUCK_WHEEL_SIZE = 36;
const TRUCK_WHEEL_SLOTS: Point[] = [
    { x: -106, y: 42 },
    { x: -64, y: 42 },
    { x: 112, y: 42 }
];

export class Truck {
    private readonly container: Phaser.GameObjects.Container;
    private readonly healthFill: Phaser.GameObjects.Rectangle;
    private readonly wheels: Phaser.GameObjects.Image[] = [];

    constructor(scene: Scene) {
        this.container = scene.add.container(TRUCK.x, TRUCK.y);
        this.container.setDepth(20);
        this.container.setScale(TRUCK.scale);

        const truckImage = scene.add.image(0, 0, TRUCK_TEXTURE_KEY);
        truckImage.setDisplaySize(330, 130);
        truckImage.setOrigin(0.5);
        this.container.add(truckImage);

        for (const slot of TRUCK_WHEEL_SLOTS) {
            const wheel = scene.add.image(slot.x, slot.y, TRUCK_WHEEL_TEXTURE_KEY);
            wheel.setDisplaySize(TRUCK_WHEEL_SIZE, TRUCK_WHEEL_SIZE);
            wheel.setOrigin(0.5);
            this.wheels.push(wheel);
        }

        this.container.add(this.wheels);

        const healthBack = scene.add.rectangle(-8, -80, 118, 10, 0x26311f);
        healthBack.setStrokeStyle(2, 0x8da66d, 0.8);
        healthBack.setOrigin(0.5);

        this.healthFill = scene.add.rectangle(-65, -80, 112, 6, COLORS.health);
        this.healthFill.setOrigin(0, 0.5);

        this.container.add([healthBack, this.healthFill]);
    }

    get x() {
        return this.container.x;
    }

    get y() {
        return this.container.y;
    }

    get position(): Point {
        return { x: this.x, y: this.y };
    }

    add(child: Phaser.GameObjects.GameObject) {
        this.container.add(child);
    }

    setHp(hp: number, maxHp = TRUCK.maxHp) {
        this.healthFill.scaleX = Math.max(0, hp / maxHp);
    }

    update(deltaSeconds: number) {
        const worldWheelRadius = (TRUCK_WHEEL_SIZE * TRUCK.scale) / 2;
        const rotationDelta = WORLD.scrollSpeed * deltaSeconds / worldWheelRadius;

        for (const wheel of this.wheels) {
            wheel.rotation += rotationDelta;
        }
    }

    hardpoints(): Point[] {
        return [
            { x: -96, y: -54 },
            { x: -36, y: -54 },
            { x: 24, y: -54 }
        ];
    }
}
