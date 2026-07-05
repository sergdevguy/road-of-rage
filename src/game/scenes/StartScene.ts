import { Scene } from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../config/gameplay'
import { AudioManager } from '../systems/AudioManager'

const MENU_ASSETS = {
    background: 'menu-background',
    title: 'menu-title',
    subtitle: 'menu-subtitle',
    playButton: 'menu-button-play',
    improvementsButton: 'menu-button-improvements'
};

type MenuButton = {
    image: Phaser.GameObjects.Image;
    label: Phaser.GameObjects.Text;
    onClick?: () => void;
};

export class StartScene extends Scene {
    private readonly menuButtons: MenuButton[] = [];

    constructor() {
        super('StartScene');
    }

    preload() {
        AudioManager.preload(this);
        this.load.image(MENU_ASSETS.background, 'assets/images/screens/menu/background.png');
        this.load.image(MENU_ASSETS.title, 'assets/images/screens/menu/title.png');
        this.load.image(MENU_ASSETS.subtitle, 'assets/images/screens/menu/subtitle.png');
        this.load.image(MENU_ASSETS.playButton, 'assets/images/screens/menu/button-play.png');
        this.load.image(MENU_ASSETS.improvementsButton, 'assets/images/screens/menu/button-improvements.png');
    }

    create() {
        this.addBackground();
        this.addTitle();
        this.addMainButtons();

        this.input.keyboard?.on('keydown-ENTER', () => this.startGameWithSound());
        this.input.keyboard?.on('keydown-SPACE', () => this.startGameWithSound());
    }

    private addBackground() {
        const background = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, MENU_ASSETS.background);
        background.setOrigin(0.5);
        background.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        background.setDepth(0);
    }

    private addTitle() {
        const title = this.add.image(GAME_WIDTH / 2, 112, MENU_ASSETS.title);
        title.setOrigin(0.5);
        title.setDepth(10);
        title.setScale(0.82);

        const subtitle = this.add.image(GAME_WIDTH / 2, 230, MENU_ASSETS.subtitle);
        subtitle.setOrigin(0.5);
        subtitle.setDepth(10);

        const subtitleText = this.add.text(GAME_WIDTH / 2, 211, 'ДОРОГА НЕ ПРОЩАЕТ СЛАБОСТИ', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: '#d4cfa7',
            stroke: '#17170f',
            strokeThickness: 4
        });
        subtitleText.setOrigin(0.5);
        subtitleText.setDepth(11);
    }

    private addMainButtons() {
        this.createMenuButton(
            GAME_WIDTH / 2,
            512,
            MENU_ASSETS.playButton,
            'ИГРАТЬ',
            () => this.startGame()
        );

        this.createMenuButton(
            GAME_WIDTH / 2,
            580,
            MENU_ASSETS.improvementsButton,
            'УЛУЧШЕНИЯ'
        );
    }

    private createMenuButton(
        x: number,
        y: number,
        textureKey: string,
        label: string,
        onClick?: () => void
    ) {
        const image = this.add.image(x, y, textureKey);
        image.setOrigin(0.5);
        image.setDepth(20);
        image.setInteractive({ useHandCursor: true });
        image.setScale(0.60);

        const text = this.add.text(x, y, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize: label === 'ИГРАТЬ' ? '28px' : '22px',
            color: '#f2eed9',
            stroke: '#111111',
            strokeThickness: 4
        });
        text.setOrigin(0.5);
        text.setDepth(21);

        const button = { image, label: text, onClick };
        this.menuButtons.push(button);

        image.on('pointerover', () => this.setButtonHover(button, true));
        image.on('pointerout', () => this.setButtonHover(button, false));
        image.on('pointerdown', () => this.handleButtonClick(button));

        text.setInteractive({ useHandCursor: true });
        text.on('pointerover', () => this.setButtonHover(button, true));
        text.on('pointerout', () => this.setButtonHover(button, false));
        text.on('pointerdown', () => this.handleButtonClick(button));
    }

    private setButtonHover(button: MenuButton, isHovering: boolean) {
        const buttonScale = isHovering ? 0.64 : 0.60;
        const labelScale = isHovering ? 1.04 : 1.0;
        button.image.setScale(buttonScale);
        button.label.setScale(labelScale);
    }

    private handleButtonClick(button: MenuButton) {
        AudioManager.playSfx(this, 'uiButton');
        button.onClick?.();
    }

    private startGame() {
        this.scene.start('Game');
    }

    private startGameWithSound() {
        AudioManager.playSfx(this, 'uiButton');
        this.startGame();
    }
}
