import type { Scene } from 'phaser'
import { COLORS, TRUCK } from '../config/gameplay'
import type { Point } from '../types'

export const TRUCK_TEXTURE_KEY = 'player-truck';

export class Truck {
    private readonly container: Phaser.GameObjects.Container;
    private readonly healthFill: Phaser.GameObjects.Rectangle;

    constructor(scene: Scene) {
        this.container = scene.add.container(TRUCK.x, TRUCK.y);
        this.container.setDepth(20);
        this.container.setScale(TRUCK.scale);

        const truckImage = scene.add.image(0, 0, TRUCK_TEXTURE_KEY);
        truckImage.setDisplaySize(330, 130);
        truckImage.setOrigin(0.5);
        this.container.add(truckImage);

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

    hardpoints(): Point[] {
        return [
            { x: -96, y: -54 },
            { x: -36, y: -54 },
            { x: 24, y: -54 }
        ];
    }
}
