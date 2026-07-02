import type { Scene } from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH, WAVES } from '../config/gameplay';

type HudButton = {
    back: Phaser.GameObjects.Rectangle;
    label: Phaser.GameObjects.Text;
};

type HudCallbacks = {
    onTogglePause: () => void;
    onCycleSpeed: () => void;
};

export class Hud {
    private readonly scene: Scene;
    private readonly callbacks: HudCallbacks;
    private readonly hpText: Phaser.GameObjects.Text;
    private readonly goldText: Phaser.GameObjects.Text;
    private readonly waveText: Phaser.GameObjects.Text;
    private readonly statusText: Phaser.GameObjects.Text;
    private readonly pauseButton: HudButton;
    private readonly speedButton: HudButton;
    private readonly waveDots: Phaser.GameObjects.Arc[] = [];
    private readonly controlButtons: HudButton[] = [];
    private statusTimerMs = 0;
    private isPaused = false;

    constructor(scene: Scene, callbacks: HudCallbacks) {
        this.scene = scene;
        this.callbacks = callbacks;

        const resourceTexts = this.createResourcePanel();
        this.hpText = resourceTexts.hpText;
        this.goldText = resourceTexts.goldText;

        this.waveText = this.createWavePanel();
        this.statusText = this.createStatusText();
        const controlButtons = this.createControlButtons();
        this.pauseButton = controlButtons.pauseButton;
        this.speedButton = controlButtons.speedButton;
        this.createAbilitySlots();
    }

    setStats(currentWave: number, hp: number, maxHp: number, gold: number) {
        const clampedWave = Math.min(currentWave, WAVES.max);
        const completedWaves = Math.max(0, clampedWave - 1);

        this.hpText.setText(`${Math.max(0, hp)}/${maxHp}`);
        this.goldText.setText(String(gold));
        this.waveText.setText(`ВОЛНА ${clampedWave}/${WAVES.max}`);

        this.waveDots.forEach((dot, index) => {
            const isComplete = index < completedWaves;
            dot.setFillStyle(isComplete ? 0x65d65a : 0x2a2c29, 1);
            dot.setStrokeStyle(2, isComplete ? 0x143d17 : 0x070807, 1);
        });
    }

    showStatusMessage(message: string, durationMs = 1200) {
        this.statusText.setText(message);
        this.statusText.setVisible(true);
        this.statusTimerMs = durationMs;
    }

    update(deltaMs: number) {
        if (!this.statusText.visible || this.statusTimerMs <= 0) {
            return;
        }

        this.statusTimerMs -= deltaMs;

        if (this.statusTimerMs <= 0) {
            this.statusText.setVisible(false);
        }
    }

    setPaused(isPaused: boolean) {
        this.isPaused = isPaused;
        this.pauseButton.label.setText(isPaused ? '▶' : 'Ⅱ');
        this.pauseButton.back.setFillStyle(isPaused ? 0x27331f : 0x111411, 0.86);
    }

    setSpeed(speedMultiplier: number) {
        this.speedButton.label.setText(`x${speedMultiplier}`);
    }

    private createResourcePanel() {
        const panelX = 18;
        const panelY = 18;
        const panelWidth = 324;
        const panelHeight = 70;

        const panel = this.scene.add.rectangle(panelX, panelY, panelWidth, panelHeight, COLORS.uiPanel, 0.82);
        panel.setOrigin(0);
        panel.setStrokeStyle(2, 0x45483a, 0.86);
        panel.setDepth(100);

        this.createHeartIcon(panelX + 34, panelY + 35);
        const hpText = this.scene.add.text(panelX + 70, panelY + 18, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '26px',
            color: '#f8efe8',
            stroke: '#080808',
            strokeThickness: 4
        });
        hpText.setDepth(102);

        const divider = this.scene.add.rectangle(panelX + 156, panelY + 10, 2, panelHeight - 20, 0x4c4a3d, 0.75);
        divider.setOrigin(0);
        divider.setDepth(101);

        this.createGoldIcon(panelX + 200, panelY + 35);
        const goldText = this.scene.add.text(panelX + 236, panelY + 18, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '26px',
            color: '#fff5ce',
            stroke: '#080808',
            strokeThickness: 4
        });
        goldText.setDepth(102);

        return { hpText, goldText };
    }

    private createWavePanel() {
        const panelWidth = 316;
        const panelHeight = 66;
        const panelX = GAME_WIDTH / 2 - panelWidth / 2;
        const panelY = 18;

        const panel = this.scene.add.rectangle(panelX, panelY, panelWidth, panelHeight, COLORS.uiPanel, 0.84);
        panel.setOrigin(0);
        panel.setStrokeStyle(2, 0x2d3028, 0.9);
        panel.setDepth(100);

        const waveText = this.scene.add.text(GAME_WIDTH / 2, panelY + 20, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: '#e9e3d4',
            stroke: '#050505',
            strokeThickness: 4
        });
        waveText.setOrigin(0.5);
        waveText.setDepth(102);

        const dotGap = 25;
        const dotsWidth = (WAVES.max - 1) * dotGap;
        const startX = GAME_WIDTH / 2 - dotsWidth / 2;
        const y = panelY + 49;

        const line = this.scene.add.rectangle(GAME_WIDTH / 2, y, dotsWidth + 18, 5, 0x111311, 1);
        line.setDepth(101);

        for (let index = 0; index < WAVES.max; index += 1) {
            const dot = this.scene.add.circle(startX + index * dotGap, y, 7, 0x2a2c29);
            dot.setStrokeStyle(2, 0x070807, 1);
            dot.setDepth(102);
            this.waveDots.push(dot);
        }

        return waveText;
    }

    private createStatusText() {
        const statusText = this.scene.add.text(GAME_WIDTH / 2, 108, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '26px',
            color: '#f4edcf',
            stroke: '#050505',
            strokeThickness: 5,
            align: 'center'
        });
        statusText.setOrigin(0.5);
        statusText.setDepth(103);
        statusText.setVisible(false);

        return statusText;
    }

    private createControlButtons() {
        return {
            pauseButton: this.createControlButton(GAME_WIDTH - 126, 18, 'Ⅱ', this.callbacks.onTogglePause),
            speedButton: this.createControlButton(GAME_WIDTH - 62, 18, 'x1', this.callbacks.onCycleSpeed)
        };
    }

    private createControlButton(x: number, y: number, label: string, onClick: () => void) {
        const size = 54;
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const back = this.scene.add.rectangle(centerX, centerY, size, size, 0x111411, 0.86);
        back.setOrigin(0.5);
        back.setStrokeStyle(2, 0x67695a, 0.9);
        back.setDepth(100);
        back.setInteractive({ useHandCursor: true });

        const text = this.scene.add.text(centerX, centerY, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize: label === 'x1' ? '23px' : '30px',
            color: '#e4dfd2',
            stroke: '#040404',
            strokeThickness: 4
        });
        text.setOrigin(0.5);
        text.setDepth(101);

        const button = { back, label: text };
        this.controlButtons.push(button);

        back.on('pointerover', () => this.setControlHover(button, true));
        back.on('pointerout', () => this.setControlHover(button, false));
        back.on('pointerdown', onClick);

        text.setInteractive({ useHandCursor: true });
        text.on('pointerover', () => this.setControlHover(button, true));
        text.on('pointerout', () => this.setControlHover(button, false));
        text.on('pointerdown', onClick);

        return button;
    }

    private setControlHover(button: HudButton, isHovering: boolean) {
        const activeColor = button === this.pauseButton && this.isPaused ? 0x27331f : 0x111411;
        button.back.setFillStyle(isHovering ? 0x22271e : activeColor, 0.86);
        button.back.setStrokeStyle(2, isHovering ? 0xa7ad87 : 0x67695a, 0.9);
        button.back.setScale(isHovering ? 1.04 : 1);
        button.label.setScale(isHovering ? 1.04 : 1);
    }

    private createAbilitySlots() {
        const panelX = 20;
        const panelY = GAME_HEIGHT - 106;
        const panelWidth = 292;
        const panelHeight = 86;

        const panel = this.scene.add.rectangle(panelX, panelY, panelWidth, panelHeight, COLORS.uiPanel, 0.72);
        panel.setOrigin(0);
        panel.setStrokeStyle(2, 0x34382d, 0.86);
        panel.setDepth(100);

        for (let index = 0; index < 3; index += 1) {
            this.createLockedSlot(panelX + 16 + index * 90, panelY + 11);
        }
    }

    private createLockedSlot(x: number, y: number) {
        const slot = this.scene.add.rectangle(x, y, 72, 64, 0x111411, 0.92);
        slot.setOrigin(0);
        slot.setStrokeStyle(3, 0x4a4d42, 0.9);
        slot.setDepth(101);

        const lockBody = this.scene.add.rectangle(x + 36, y + 39, 22, 19, 0x5b5d57, 1);
        lockBody.setStrokeStyle(2, 0x191919, 1);
        lockBody.setDepth(102);

        const shackle = this.scene.add.arc(x + 36, y + 32, 13, 200, 340, false, undefined, 0);
        shackle.setStrokeStyle(4, 0x7d8078, 1);
        shackle.setDepth(102);

        const keyhole = this.scene.add.circle(x + 36, y + 42, 3, 0x171717, 1);
        keyhole.setDepth(103);
    }

    private createHeartIcon(x: number, y: number) {
        const left = this.scene.add.circle(x - 7, y - 4, 10, COLORS.danger);
        const right = this.scene.add.circle(x + 7, y - 4, 10, COLORS.danger);
        const bottom = this.scene.add.triangle(x, y + 3, -18, -3, 18, -3, 0, 22, COLORS.danger);

        [left, right, bottom].forEach((part) => {
            part.setDepth(102);
        });
    }

    private createGoldIcon(x: number, y: number) {
        const gem = this.scene.add.polygon(x, y, [0, -15, 15, 0, 0, 15, -15, 0], 0xf5c84b);
        gem.setStrokeStyle(4, 0x5b4210, 1);
        gem.setDepth(102);

        const shine = this.scene.add.polygon(x, y - 3, [0, -7, 7, 0, 0, 7, -7, 0], 0xfff0a3);
        shine.setDepth(103);
    }
}
