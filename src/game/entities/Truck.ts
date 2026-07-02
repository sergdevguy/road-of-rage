import type { Scene } from 'phaser';
import { COLORS, TRUCK } from '../config/gameplay';
import type { Point } from '../types';

export class Truck {
    private readonly scene: Scene;
    private readonly container: Phaser.GameObjects.Container;
    private readonly healthFill: Phaser.GameObjects.Rectangle;

    constructor(scene: Scene) {
        this.scene = scene;
        this.container = scene.add.container(TRUCK.x, TRUCK.y);
        this.container.setDepth(20);
        this.container.setScale(TRUCK.scale);

        this.addShadow();
        this.addBody();
        this.addWheels();
        this.addArmorDeck();

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
            { x: -38, y: -54 },
            { x: 4, y: -56 },
            { x: 44, y: -54 }
        ];
    }

    private addShadow() {
        const shadow = this.scene.add.ellipse(2, 34, 250, 46, 0x000000, 0.34);
        this.container.add(shadow);
    }

    private addBody() {
        const cargo = this.scene.add.rectangle(-18, -6, 154, 64, COLORS.truckCargo);
        cargo.setStrokeStyle(3, 0x2c361e);

        const cab = this.scene.add.polygon(89, -5, [
            -42, -28,
            16, -30,
            42, -8,
            38, 30,
            -42, 30
        ], COLORS.truckCab);
        cab.setStrokeStyle(3, 0x4d251c);

        const hood = this.scene.add.rectangle(122, 3, 52, 42, 0x8aa045);
        hood.setStrokeStyle(3, 0x344021);

        const windshield = this.scene.add.polygon(75, -20, [
            -16, -10,
            16, -8,
            26, 8,
            -22, 8
        ], 0x253840, 0.9);
        windshield.setStrokeStyle(2, 0x9fb8b4, 0.55);

        this.container.add([cargo, cab, hood, windshield]);
    }

    private addArmorDeck() {
        const deck = this.scene.add.rectangle(-14, -42, 128, 40, COLORS.armor);
        deck.setStrokeStyle(3, 0x6d7167);

        const panels = [
            this.scene.add.rectangle(-55, -42, 34, 28, 0xe7ebe2),
            this.scene.add.rectangle(-16, -42, 34, 28, 0xd6dbd1),
            this.scene.add.rectangle(24, -42, 34, 28, 0xe7ebe2)
        ];

        const rivets = [
            this.scene.add.circle(-58, -18, 8, 0x3a611f),
            this.scene.add.circle(-15, -18, 7, 0x567b2e),
            this.scene.add.circle(28, -18, 7, 0x567b2e),
            this.scene.add.circle(64, -18, 6, 0x5c6a39)
        ];

        panels.forEach((panel) => panel.setStrokeStyle(2, 0x73786f));
        rivets.forEach((rivet) => rivet.setStrokeStyle(2, 0x243017));

        this.container.add([deck, ...panels, ...rivets]);
    }

    private addWheels() {
        const wheelXs = [-94, -58, -22, 88, 122];
        const wheels = wheelXs.map((x) => {
            const wheel = this.scene.add.circle(x, 32, 16, 0x111111);
            wheel.setStrokeStyle(4, 0x3d3b32);
            return wheel;
        });

        const hubs = wheelXs.map((x) => this.scene.add.circle(x, 32, 6, 0x7f826f));

        this.container.add([...wheels, ...hubs]);
    }
}
