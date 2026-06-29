import { AUTO, Scale, Types } from 'phaser'
import { Game } from '../scenes/Game'
import { StartScene } from '../scenes/StartScene'
import { GAME_HEIGHT, GAME_WIDTH } from './gameplay'

export const createGameConfig = (parent: string): Types.Core.GameConfig => ({
    type: AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#11170f',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    fps: {
        target: 60
    },
    scene: [
        StartScene,
        Game
    ]
});
