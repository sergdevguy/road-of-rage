import type { Scene } from 'phaser'
import type { BonusDefinition, BonusId } from '../config/bonuses'
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config/gameplay'
import { AudioManager } from '../systems/AudioManager'

const CARD_WIDTH = 270;
const CARD_HEIGHT = 200;
const CARD_GAP = 20;
const BOTTOM_OFFSET = 20;
const TITLE_GAP = 30;
const OVERLAY_PADDING = 20;

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

        const cardY = GAME_HEIGHT - BOTTOM_OFFSET - CARD_HEIGHT / 2;
        const titleY = cardY - CARD_HEIGHT / 2 - TITLE_GAP;
        const totalWidth = choices.length * CARD_WIDTH + Math.max(0, choices.length - 1) * CARD_GAP;
        const overlayWidth = totalWidth + OVERLAY_PADDING * 2;
        const overlayTop = titleY - 16 - OVERLAY_PADDING;
        const overlayBottom = cardY + CARD_HEIGHT / 2 + OVERLAY_PADDING;
        const overlay = this.scene.add.rectangle(
            GAME_WIDTH / 2,
            overlayTop + (overlayBottom - overlayTop) / 2,
            overlayWidth,
            overlayBottom - overlayTop,
            0x050705,
            0.72
        );
        overlay.setStrokeStyle(2, 0x2d3028, 0.8);

        const title = this.scene.add.text(GAME_WIDTH / 2, titleY, 'ВЫБЕРИ ОДНО УЛУЧШЕНИЕ', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: '#f2eed9',
            stroke: '#050505',
            strokeThickness: 4
        });
        title.setOrigin(0.5);

        container.add([overlay, title]);

        const startX = GAME_WIDTH / 2 - totalWidth / 2 + CARD_WIDTH / 2;

        choices.forEach((choice, index) => {
            this.createCard(startX + index * (CARD_WIDTH + CARD_GAP), cardY, CARD_WIDTH, CARD_HEIGHT, choice, onSelect);
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
            AudioManager.playSfx(this.scene, 'uiButton');
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
