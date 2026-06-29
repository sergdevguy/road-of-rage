import { Scene } from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config/gameplay';

export class StartScene extends Scene {
    private buttonBack: Phaser.GameObjects.Rectangle;
    private buttonText: Phaser.GameObjects.Text;

    constructor() {
        super('StartScene');
    }

    create() {
        this.addMenuBackground();

        const title = this.add.text(GAME_WIDTH / 2, 214, 'КОНВОЙ', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '72px',
            color: '#dfeeb8',
            stroke: '#102012',
            strokeThickness: 8
        });
        title.setOrigin(0.5);
        title.setDepth(30);

        const subtitle = this.add.text(GAME_WIDTH / 2, 292, 'защити движущийся грузовик от преследования', {
            fontFamily: 'Arial',
            fontSize: '26px',
            color: '#ebe9df'
        });
        subtitle.setOrigin(0.5);
        subtitle.setDepth(30);

        this.buttonBack = this.add.rectangle(GAME_WIDTH / 2, 430, 300, 78, COLORS.truckCargo, 0.96);
        this.buttonBack.setStrokeStyle(4, 0xdfeeb8, 0.9);
        this.buttonBack.setDepth(30);
        this.buttonBack.setInteractive({ useHandCursor: true });

        this.buttonText = this.add.text(GAME_WIDTH / 2, 430, 'новая игра', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '28px',
            color: '#11170f'
        });
        this.buttonText.setOrigin(0.5);
        this.buttonText.setDepth(31);

        this.buttonBack.on('pointerover', () => this.setButtonHover(true));
        this.buttonBack.on('pointerout', () => this.setButtonHover(false));
        this.buttonBack.on('pointerdown', () => this.startGame());
        this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
        this.input.keyboard?.on('keydown-SPACE', () => this.startGame());
    }

    private setButtonHover(isHovering: boolean) {
        this.buttonBack.setFillStyle(isHovering ? 0xa8c75b : COLORS.truckCargo, 0.96);
        this.buttonText.setColor(isHovering ? '#071006' : '#11170f');
        this.buttonBack.setScale(isHovering ? 1.04 : 1);
        this.buttonText.setScale(isHovering ? 1.04 : 1);
    }

    private startGame() {
        this.scene.start('Game');
    }

    private addMenuBackground() {
        const background = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0b100b);
        background.setOrigin(0);

        const topBand = this.add.rectangle(0, 0, GAME_WIDTH, 210, 0x121d12, 1);
        topBand.setOrigin(0);

        const road = this.add.rectangle(0, 520, GAME_WIDTH, 120, 0x1d1d19, 1);
        road.setOrigin(0);
        road.setStrokeStyle(3, 0x3d392f, 0.85);

        const divider = this.add.graphics();
        divider.lineStyle(4, 0xb7ad92, 0.36);

        for (let x = 34; x < GAME_WIDTH; x += 118) {
            divider.lineBetween(x, 580, x + 48, 580);
        }

        const glow = this.add.circle(GAME_WIDTH / 2, 248, 220, 0xdfeeb8, 0.08);
        glow.setScale(1.8, 0.55);

        const panel = this.add.rectangle(GAME_WIDTH / 2, 344, 580, 330, 0x0d140d, 0.58);
        panel.setStrokeStyle(2, 0x2e3d2d, 0.9);
    }
}
