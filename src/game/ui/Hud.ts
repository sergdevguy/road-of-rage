import type { Scene } from 'phaser';
import { COLORS, GAME_WIDTH, TRUCK } from '../config/gameplay';

export class Hud {
    private readonly waveText: Phaser.GameObjects.Text;
    private readonly hpText: Phaser.GameObjects.Text;
    private readonly scrapText: Phaser.GameObjects.Text;
    private readonly hpFill: Phaser.GameObjects.Rectangle;

    constructor(scene: Scene) {
        const panel = scene.add.rectangle(18, 18, 260, 126, COLORS.uiPanel, 0.78);
        panel.setOrigin(0);
        panel.setStrokeStyle(2, 0x2e3d2d, 0.9);
        panel.setDepth(100);

        this.waveText = scene.add.text(38, 34, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: '#f1f4df'
        });
        this.waveText.setDepth(101);

        this.hpText = scene.add.text(68, 72, '', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#f8efe8'
        });
        this.hpText.setDepth(101);

        this.scrapText = scene.add.text(68, 108, '', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#f4d86b'
        });
        this.scrapText.setDepth(101);

        const heart = scene.add.circle(50, 84, 11, COLORS.danger);
        heart.setDepth(101);

        const scrap = scene.add.polygon(50, 120, [0, -13, 13, 0, 0, 13, -13, 0], 0xf4c753);
        scrap.setStrokeStyle(3, 0x5a4512);
        scrap.setDepth(101);

        const barBack = scene.add.rectangle(GAME_WIDTH - 286, 36, 248, 16, 0x151d13, 0.86);
        barBack.setOrigin(0);
        barBack.setStrokeStyle(2, 0x3b4d31);
        barBack.setDepth(100);

        this.hpFill = scene.add.rectangle(GAME_WIDTH - 282, 40, 240, 8, COLORS.health);
        this.hpFill.setOrigin(0, 0);
        this.hpFill.setDepth(101);
    }

    setStats(wave: number, hp: number, scrap: number) {
        this.waveText.setText(`ВОЛНА ${wave}`);
        this.hpText.setText(`${Math.max(0, hp)}/${TRUCK.maxHp}`);
        this.scrapText.setText(String(scrap));
        this.hpFill.scaleX = Math.max(0, hp / TRUCK.maxHp);
    }
}
