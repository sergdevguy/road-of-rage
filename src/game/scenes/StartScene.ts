import { Scene } from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config/gameplay';
import { AudioManager } from '../systems/AudioManager';

type MenuButton = {
    back: Phaser.GameObjects.Rectangle;
    label: Phaser.GameObjects.Text;
    icon: Phaser.GameObjects.Text;
};

export class StartScene extends Scene {
    private readonly menuButtons: MenuButton[] = [];

    constructor() {
        super('StartScene');
    }

    preload() {
        AudioManager.preload(this);
    }

    create() {
        this.addWastelandBackground();
        this.addTitle();
        this.addBattleScene();
        this.addMainButtons();
        this.addCornerButtons();

        this.input.keyboard?.on('keydown-ENTER', () => this.startGameWithSound());
        this.input.keyboard?.on('keydown-SPACE', () => this.startGameWithSound());
    }

    private addWastelandBackground() {
        const g = this.add.graphics();

        g.fillStyle(0x2f2819, 1);
        g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        g.fillStyle(0x211b12, 0.42);
        g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        for (let x = 30; x < GAME_WIDTH; x += 92) {
            const y = 34 + ((x * 17) % 650);
            g.fillStyle(0x19150f, 0.24);
            g.fillCircle(x, y, 4 + (x % 3));
            g.fillStyle(0x5a4c32, 0.62);
            g.fillCircle(x + 38, y + 24, 9 + (x % 11));
            g.fillStyle(0x3a311f, 0.72);
            g.fillTriangle(x + 8, y + 62, x + 32, y + 28, x + 62, y + 58);
        }

        for (let x = -20; x < GAME_WIDTH; x += 120) {
            g.lineStyle(2, 0x5a4a2f, 0.18);
            g.lineBetween(x, 610, x + 68, 545);
            g.lineBetween(x + 24, 138, x + 72, 96);
        }

        this.addSceneryProps();
        this.addRoad(g);
        this.addScreenShade(g);
    }

    private addRoad(g: Phaser.GameObjects.Graphics) {
        const roadY = 350;
        const roadHeight = 118;

        g.fillStyle(0x1f1f1a, 1);
        g.fillRect(0, roadY, GAME_WIDTH, roadHeight);

        g.lineStyle(5, 0x7a6e56, 0.5);
        g.lineBetween(0, roadY + 5, GAME_WIDTH, roadY + 5);
        g.lineBetween(0, roadY + roadHeight - 5, GAME_WIDTH, roadY + roadHeight - 5);

        g.lineStyle(4, 0xc4b894, 0.42);

        for (let x = 22; x < GAME_WIDTH; x += 96) {
            g.lineBetween(x, roadY + roadHeight / 2, x + 44, roadY + roadHeight / 2);
        }
    }

    private addScreenShade(g: Phaser.GameObjects.Graphics) {
        g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.42, 0.42, 0.12, 0.12);
        g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        g.fillStyle(0x000000, 0.18);
        g.fillRect(0, 0, GAME_WIDTH, 70);
        g.fillRect(0, GAME_HEIGHT - 70, GAME_WIDTH, 70);
    }

    private addSceneryProps() {
        this.addBrokenCar(112, 185, 0.72, -0.12);
        this.addTires(305, 104, 0.82);
        this.addFence(1058, 128);
        this.addCrates(1168, 210);
        this.addWarningSign(232, 238, 0.7);
        this.addWarningSign(1018, 610, 0.75);
        this.addBillboard(250, 625);
        this.addTires(1108, 565, 0.72);
    }

    private addTitle() {
        const title = this.add.text(GAME_WIDTH / 2, 88, 'КОНВОЙ', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '86px',
            color: '#c6c19a',
            stroke: '#17170f',
            strokeThickness: 10,
            shadow: {
                offsetX: 5,
                offsetY: 7,
                color: '#000000',
                blur: 0,
                fill: true
            }
        });
        title.setOrigin(0.5);
        title.setDepth(30);

        const plate = this.add.rectangle(GAME_WIDTH / 2, 167, 412, 48, 0x2d3423, 0.96);
        plate.setStrokeStyle(4, 0x8d8a65, 0.85);
        plate.setDepth(29);

        const subtitle = this.add.text(GAME_WIDTH / 2, 166, 'ДОРОГА НЕ ПРОЩАЕТ СЛАБОСТИ', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '22px',
            color: '#cfc69a',
            stroke: '#11140d',
            strokeThickness: 4
        });
        subtitle.setOrigin(0.5);
        subtitle.setDepth(30);

        this.add.text(GAME_WIDTH / 2, 202, '★', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '32px',
            color: '#a4a071',
            stroke: '#17170f',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(30);
    }

    private addBattleScene() {
        this.addEnemyCar(126, 328, 0.72, 0.03);
        this.addEnemyCar(1138, 330, 0.72, Math.PI);
        this.addEnemyCar(116, 505, 0.68, -0.04);
        this.addDrone(340, 246, 0.75);
        this.addDrone(956, 246, 0.75);
        this.addJet(1014, 504, 0.72);
        this.addTruck(640, 386, 0.9);

        this.addTracer(422, 292, 520, 318);
        this.addTracer(802, 318, 916, 260);
        this.addTracer(218, 510, 410, 454);
        this.addTracer(970, 506, 842, 446);
        this.addTracer(1048, 332, 930, 330);
    }

    private addMainButtons() {
        this.createMenuButton(GAME_WIDTH / 2, 494, 356, 62, '▶', 'ИГРАТЬ', true, () => this.startGame());
        this.createMenuButton(GAME_WIDTH / 2, 562, 356, 54, '▣', 'УЛУЧШЕНИЯ', false);
        this.createMenuButton(GAME_WIDTH / 2, 622, 356, 54, '♜', 'ДОСТИЖЕНИЯ', false);
        this.createMenuButton(GAME_WIDTH / 2, 682, 356, 54, '⚙', 'НАСТРОЙКИ', false);
    }

    private createMenuButton(
        x: number,
        y: number,
        width: number,
        height: number,
        icon: string,
        label: string,
        isPrimary: boolean,
        onClick?: () => void
    ) {
        const back = this.add.rectangle(x, y, width, height, isPrimary ? 0x667d2c : 0x25271f, 0.98);
        back.setStrokeStyle(4, isPrimary ? 0xc3ce7d : 0x84826d, 0.92);
        back.setDepth(40);
        back.setInteractive({ useHandCursor: true });

        const iconText = this.add.text(x - width / 2 + 72, y, icon, {
            fontFamily: 'Arial Black, Arial',
            fontSize: isPrimary ? '38px' : '26px',
            color: isPrimary ? '#f4edbf' : '#c3beb0',
            stroke: '#111111',
            strokeThickness: 4
        });
        iconText.setOrigin(0.5);
        iconText.setDepth(41);

        const text = this.add.text(x + 46, y, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize: isPrimary ? '34px' : '25px',
            color: '#ebe7d1',
            stroke: '#111111',
            strokeThickness: 5
        });
        text.setOrigin(0.5);
        text.setDepth(41);

        const button = { back, label: text, icon: iconText };
        this.menuButtons.push(button);

        back.on('pointerover', () => this.setButtonHover(button, true, isPrimary));
        back.on('pointerout', () => this.setButtonHover(button, false, isPrimary));

        back.on('pointerdown', () => {
            AudioManager.playSfx(this, 'uiButton');
            onClick?.();
        });
    }

    private setButtonHover(button: MenuButton, isHovering: boolean, isPrimary: boolean) {
        const baseColor = isPrimary ? 0x667d2c : 0x25271f;
        const hoverColor = isPrimary ? 0x7f9a38 : 0x36382f;

        button.back.setFillStyle(isHovering ? hoverColor : baseColor, 0.98);
        button.back.setScale(isHovering ? 1.035 : 1);
        button.label.setScale(isHovering ? 1.035 : 1);
        button.icon.setScale(isHovering ? 1.035 : 1);
    }

    private addCornerButtons() {
        this.createIconButton(GAME_WIDTH - 62, 60, '⚙');
        this.createIconButton(64, GAME_HEIGHT - 58, '♛');
        this.createIconButton(144, GAME_HEIGHT - 58, '▥');
        this.createLabeledIconButton(GAME_WIDTH - 170, GAME_HEIGHT - 58, '★', 'ОЦЕНИТЬ');
        this.createLabeledIconButton(GAME_WIDTH - 76, GAME_HEIGHT - 58, '🎮', 'ЕЩЁ ИГРЫ');
    }

    private createIconButton(x: number, y: number, icon: string) {
        const back = this.add.rectangle(x, y, 62, 62, 0x161914, 0.9);
        back.setStrokeStyle(3, 0x68685a, 0.9);
        back.setDepth(42);
        back.setInteractive({ useHandCursor: true });
        back.on('pointerdown', () => AudioManager.playSfx(this, 'uiButton'));

        this.add.text(x, y, icon, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '30px',
            color: '#c9c5b6',
            stroke: '#050505',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(43);
    }

    private createLabeledIconButton(x: number, y: number, icon: string, label: string) {
        const back = this.add.rectangle(x, y, 82, 70, 0x161914, 0.9);
        back.setStrokeStyle(3, 0x68685a, 0.9);
        back.setDepth(42);
        back.setInteractive({ useHandCursor: true });
        back.on('pointerdown', () => AudioManager.playSfx(this, 'uiButton'));

        this.add.text(x, y - 12, icon, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '28px',
            color: '#c9c5b6',
            stroke: '#050505',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(43);

        this.add.text(x, y + 20, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '12px',
            color: '#c9c5b6',
            stroke: '#050505',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(43);
    }

    private startGame() {
        this.scene.start('Game');
    }

    private startGameWithSound() {
        AudioManager.playSfx(this, 'uiButton');
        this.startGame();
    }

    private addTruck(x: number, y: number, scale: number) {
        const c = this.add.container(x, y);
        c.setScale(scale);
        c.setDepth(24);

        c.add(this.add.ellipse(0, 38, 250, 48, 0x000000, 0.34));

        const body = this.add.rectangle(-24, 0, 176, 64, COLORS.truckCargo);
        body.setStrokeStyle(3, 0x1c2515);
        const cab = this.add.polygon(96, -2, [-42, -28, 20, -28, 48, -2, 42, 30, -42, 30], 0x526b2c);
        cab.setStrokeStyle(3, 0x192410);
        const windshield = this.add.polygon(86, -16, [-16, -10, 16, -8, 27, 8, -22, 8], 0x1c3032, 0.9);
        const plateA = this.add.rectangle(-58, -34, 48, 34, 0x69783e);
        const plateB = this.add.rectangle(4, -34, 48, 34, 0x69783e);

        const turretA = this.add.rectangle(-55, -58, 34, 32, 0x59633d);
        turretA.setStrokeStyle(3, 0x15190f);
        const turretB = this.add.rectangle(4, -58, 34, 32, 0x59633d);
        turretB.setStrokeStyle(3, 0x15190f);

        c.add([body, cab, windshield, plateA, plateB, turretA, turretB]);

        [-86, -52, -18, 82].forEach((wheelX) => {
            const wheel = this.add.circle(wheelX, 34, 18, 0x111111);
            wheel.setStrokeStyle(4, 0x3f3c30);
            c.add([wheel, this.add.circle(wheelX, 34, 7, 0x8a8874)]);
        });
    }

    private addEnemyCar(x: number, y: number, scale: number, rotation: number) {
        const c = this.add.container(x, y);
        c.setScale(scale);
        c.setRotation(rotation);
        c.setDepth(22);

        c.add(this.add.ellipse(0, 20, 100, 28, 0x000000, 0.28));
        const body = this.add.rectangle(0, 0, 98, 42, COLORS.enemy);
        body.setStrokeStyle(4, COLORS.enemyDark);
        const cab = this.add.rectangle(8, -13, 36, 22, 0x2b3331);
        const turret = this.add.rectangle(-18, -35, 44, 12, 0x211b16);
        turret.setRotation(-0.2);
        c.add([body, cab, turret, this.add.circle(-32, 25, 10, 0x111111), this.add.circle(32, 25, 10, 0x111111)]);
        this.addHealthBar(x, y - 48, scale);
    }

    private addDrone(x: number, y: number, scale: number) {
        const c = this.add.container(x, y);
        c.setScale(scale);
        c.setDepth(25);
        c.add(this.add.ellipse(0, 24, 52, 16, 0x000000, 0.26));
        const rotorA = this.add.rectangle(0, 0, 76, 5, 0xd2d4bf, 0.85);
        rotorA.setRotation(0.55);
        const rotorB = this.add.rectangle(0, 0, 76, 5, 0xd2d4bf, 0.85);
        rotorB.setRotation(-0.55);
        const body = this.add.circle(0, 0, 16, 0x2a3122);
        body.setStrokeStyle(4, 0xb9c271);
        c.add([rotorA, rotorB, body]);
        this.addHealthBar(x, y - 42, scale);
    }

    private addJet(x: number, y: number, scale: number) {
        const c = this.add.container(x, y);
        c.setScale(scale);
        c.setRotation(-0.18);
        c.setDepth(25);
        c.add(this.add.ellipse(0, 24, 68, 18, 0x000000, 0.28));
        const body = this.add.polygon(0, 0, [-54, 0, 18, -26, 54, 0, 18, 26], 0xbfc0b0);
        body.setStrokeStyle(4, 0x2f332a);
        c.add(body);
        this.addHealthBar(x, y - 42, scale);
    }

    private addHealthBar(x: number, y: number, scale: number) {
        const back = this.add.rectangle(x, y, 58 * scale, 8 * scale, 0x2a0d0d, 0.95);
        back.setDepth(26);
        const fill = this.add.rectangle(x - 11 * scale, y, 34 * scale, 4 * scale, 0xd3362a, 1);
        fill.setDepth(27);
    }

    private addTracer(x1: number, y1: number, x2: number, y2: number) {
        const g = this.add.graphics();
        g.setDepth(23);
        g.lineStyle(2, 0xf3b34d, 0.42);
        g.lineBetween(x1, y1, x2, y2);
        g.fillStyle(0xfff0a5, 0.95);
        g.fillCircle(x2, y2, 4);
    }

    private addBrokenCar(x: number, y: number, scale: number, rotation: number) {
        const c = this.add.container(x, y);
        c.setScale(scale);
        c.setRotation(rotation);
        c.setDepth(4);
        c.add(this.add.rectangle(0, 0, 140, 58, 0x4a3721, 0.9));
        c.add(this.add.rectangle(12, -18, 54, 24, 0x1d211e, 0.95));
        c.add(this.add.circle(-46, 36, 13, 0x111111));
        c.add(this.add.circle(48, 36, 13, 0x111111));
    }

    private addTires(x: number, y: number, scale: number) {
        for (let index = 0; index < 4; index += 1) {
            const tire = this.add.circle(x + (index % 2) * 34, y + Math.floor(index / 2) * 26, 15 * scale, 0x15140f, 1);
            tire.setStrokeStyle(5 * scale, 0x3a3425, 0.9);
            tire.setDepth(3);
        }
    }

    private addFence(x: number, y: number) {
        const g = this.add.graphics();
        g.setDepth(3);
        g.lineStyle(12, 0x4e3d25, 0.9);

        for (let index = 0; index < 5; index += 1) {
            g.lineBetween(x + index * 34, y - 48, x + index * 34, y + 50);
        }

        g.lineStyle(9, 0x3d2e1c, 0.9);
        g.lineBetween(x - 18, y - 18, x + 150, y + 34);
    }

    private addCrates(x: number, y: number) {
        for (let index = 0; index < 6; index += 1) {
            const crate = this.add.rectangle(x + (index % 3) * 28, y + Math.floor(index / 3) * 24, 25, 22, 0x5a4428, 0.92);
            crate.setStrokeStyle(2, 0x241b12, 0.8);
            crate.setDepth(3);
        }
    }

    private addWarningSign(x: number, y: number, scale: number) {
        const c = this.add.container(x, y);
        c.setScale(scale);
        c.setDepth(5);
        c.add(this.add.rectangle(0, 42, 8, 74, 0x5b4328));
        const sign = this.add.triangle(0, 0, 0, -34, 34, 30, -34, 30, 0xc9923f);
        sign.setStrokeStyle(5, 0x442b1a);
        c.add(sign);
        c.add(this.add.text(0, 7, '!', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '32px',
            color: '#3b2116'
        }).setOrigin(0.5));
    }

    private addBillboard(x: number, y: number) {
        const board = this.add.rectangle(x, y, 150, 70, 0x4d3b24, 0.95);
        board.setRotation(-0.2);
        board.setStrokeStyle(5, 0x23180e, 0.9);
        board.setDepth(3);
        this.add.text(x, y, '☠', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '34px',
            color: '#9d8d67'
        }).setOrigin(0.5).setRotation(-0.2).setDepth(4);
    }
}
