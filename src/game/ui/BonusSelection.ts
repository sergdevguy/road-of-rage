import type { Scene } from 'phaser';
import type { BonusDefinition, BonusId } from '../config/bonuses';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config/gameplay';

export class BonusSelection {
    private readonly scene: Scene;
    private container: Phaser.GameObjects.Container | null = null;
    private isLocked = false;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    show(choices: BonusDefinition[], onSelect: (bonusId: BonusId) => void) {
        this.hide();
        this.isLocked = false;

        const container = this.scene.add.container(0, 0);
        container.setDepth(250);
        this.container = container;

        const shade = this.scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x050705, 0.72);
        shade.setOrigin(0);

        const title = this.scene.add.text(GAME_WIDTH / 2, 124, 'ВЫБЕРИ УЛУЧШЕНИЕ', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '34px',
            color: '#f2eed9',
            stroke: '#050505',
            strokeThickness: 5
        });
        title.setOrigin(0.5);

        const subtitle = this.scene.add.text(GAME_WIDTH / 2, 164, 'ОДНА КАРТА ПЕРЕД СЛЕДУЮЩЕЙ ВОЛНОЙ', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '17px',
            color: '#c8c1a8',
            stroke: '#050505',
            strokeThickness: 3
        });
        subtitle.setOrigin(0.5);

        container.add([shade, title, subtitle]);

        const cardWidth = 270;
        const cardHeight = 248;
        const gap = 32;
        const totalWidth = choices.length * cardWidth + Math.max(0, choices.length - 1) * gap;
        const startX = GAME_WIDTH / 2 - totalWidth / 2 + cardWidth / 2;

        choices.forEach((choice, index) => {
            this.createCard(startX + index * (cardWidth + gap), 374, cardWidth, cardHeight, choice, onSelect);
        });
    }

    hide() {
        if (!this.container) {
            return;
        }

        this.container.destroy(true);
        this.container = null;
        this.isLocked = false;
    }

    private createCard(
        x: number,
        y: number,
        width: number,
        height: number,
        choice: BonusDefinition,
        onSelect: (bonusId: BonusId) => void
    ) {
        if (!this.container) {
            return;
        }

        const back = this.scene.add.rectangle(x, y, width, height, 0x171a14, 0.96);
        back.setStrokeStyle(3, 0x6e765b, 0.95);
        back.setInteractive({ useHandCursor: true });

        const icon = this.scene.add.rectangle(x, y - 74, 64, 54, COLORS.truckCargo, 1);
        icon.setStrokeStyle(3, 0x2d351d, 1);

        const iconMark = this.scene.add.text(x, y - 74, this.iconLabel(choice.id), {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: '#f2eed9',
            stroke: '#050505',
            strokeThickness: 4
        });
        iconMark.setOrigin(0.5);

        const title = this.scene.add.text(x, y - 18, choice.title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '18px',
            color: '#f4edcf',
            stroke: '#050505',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: width - 34 }
        });
        title.setOrigin(0.5);

        const description = this.scene.add.text(x, y + 54, choice.description, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '17px',
            color: '#d7cfb7',
            stroke: '#050505',
            strokeThickness: 3,
            align: 'center',
            wordWrap: { width: width - 44 }
        });
        description.setOrigin(0.5);

        this.container.add([back, icon, iconMark, title, description]);

        back.on('pointerover', () => {
            if (this.isLocked) {
                return;
            }

            back.setFillStyle(0x22281b, 0.98);
            back.setStrokeStyle(3, 0xa9c963, 1);
        });
        back.on('pointerout', () => {
            if (this.isLocked) {
                return;
            }

            back.setFillStyle(0x171a14, 0.96);
            back.setStrokeStyle(3, 0x6e765b, 0.95);
        });
        back.on('pointerdown', () => {
            if (this.isLocked) {
                return;
            }

            this.isLocked = true;
            back.disableInteractive();
            onSelect(choice.id);
        });
    }

    private iconLabel(id: BonusId) {
        if (id === 'addGun') {
            return '+G';
        }

        if (id === 'addDrone') {
            return '+D';
        }

        if (id === 'repair') {
            return 'HP';
        }

        if (id === 'maxHp') {
            return 'MAX';
        }

        if (id === 'gunDamage' || id === 'droneDamage') {
            return 'DMG';
        }

        return 'SPD';
    }
}
