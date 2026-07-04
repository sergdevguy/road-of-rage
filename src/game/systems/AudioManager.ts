import type { Scene } from 'phaser'
import {
    AUDIO_DEFINITIONS,
    DEFAULT_AUDIO_SETTINGS,
    type AudioKey,
    type AudioSettings
} from '../config/audio'

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

class GameAudioManager {
    private settings: AudioSettings = {
        ...DEFAULT_AUDIO_SETTINGS,
        perSoundVolume: { ...DEFAULT_AUDIO_SETTINGS.perSoundVolume }
    };
    private currentMusicKey: AudioKey | null = null;
    private currentMusic: Phaser.Sound.BaseSound | null = null;
    private readonly lastPlayedAt = new Map<AudioKey, number>();

    preload(scene: Scene) {
        for (const definition of Object.values(AUDIO_DEFINITIONS)) {
            if (!scene.cache.audio.exists(definition.assetKey)) {
                scene.load.audio(definition.assetKey, definition.path);
            }
        }
    }

    playMusic(scene: Scene, key: AudioKey) {
        const definition = AUDIO_DEFINITIONS[key];

        if (definition.category !== 'music' || !this.settings.musicEnabled) {
            return;
        }

        if (this.currentMusicKey === key && this.currentMusic) {
            this.setSoundVolume(this.currentMusic, this.volumeFor(key));

            if (this.currentMusic.isPlaying) {
                return;
            }

            if (this.currentMusic.isPaused) {
                this.currentMusic.resume();
                return;
            }

            this.currentMusic.play({
                loop: definition.loop ?? true,
                volume: this.volumeFor(key)
            });
            return;
        }

        if (!scene.cache.audio.exists(definition.assetKey)) {
            return;
        }

        if (this.currentMusic && this.currentMusicKey !== key) {
            this.currentMusic.stop();
            this.currentMusic.destroy();
        }

        const music = scene.sound.add(definition.assetKey, {
            loop: definition.loop ?? true,
            volume: this.volumeFor(key)
        });

        this.currentMusic = music;
        this.currentMusicKey = key;

        if (!music.play()) {
            scene.sound.once('unlocked', () => {
                if (this.currentMusic === music && !music.isPlaying && this.settings.musicEnabled) {
                    music.play({
                        loop: definition.loop ?? true,
                        volume: this.volumeFor(key)
                    });
                }
            });
        }
    }

    playSfx(scene: Scene, key: AudioKey) {
        const definition = AUDIO_DEFINITIONS[key];

        if (definition.category !== 'sfx' || !this.settings.sfxEnabled) {
            return;
        }

        const now = scene.time.now;
        const cooldownMs = definition.cooldownMs ?? 0;
        const lastPlayedAt = this.lastPlayedAt.get(key) ?? -Infinity;

        if (now - lastPlayedAt < cooldownMs) {
            return;
        }

        if (!scene.cache.audio.exists(definition.assetKey)) {
            return;
        }

        this.lastPlayedAt.set(key, now);
        scene.sound.play(definition.assetKey, {
            volume: this.volumeFor(key)
        });
    }

    setSettings(settings: Partial<AudioSettings>) {
        this.settings = {
            ...this.settings,
            ...settings,
            perSoundVolume: {
                ...this.settings.perSoundVolume,
                ...settings.perSoundVolume
            }
        };

        if (this.currentMusic) {
            if (!this.settings.musicEnabled) {
                this.currentMusic.pause();
            } else if (this.currentMusicKey) {
                this.setSoundVolume(this.currentMusic, this.volumeFor(this.currentMusicKey));

                if (this.currentMusic.isPaused) {
                    this.currentMusic.resume();
                }
            }
        }
    }

    getSettings(): AudioSettings {
        return {
            ...this.settings,
            perSoundVolume: { ...this.settings.perSoundVolume }
        };
    }

    private volumeFor(key: AudioKey) {
        const definition = AUDIO_DEFINITIONS[key];
        const categoryVolume = definition.category === 'music'
            ? this.settings.musicVolume
            : this.settings.sfxVolume;
        const soundVolume = this.settings.perSoundVolume[key] ?? 1;

        return clamp01(definition.defaultVolume * categoryVolume * soundVolume);
    }

    private setSoundVolume(sound: Phaser.Sound.BaseSound, volume: number) {
        const soundWithVolume = sound as Phaser.Sound.BaseSound & {
            setVolume?: (value: number) => void;
            volume?: number;
        };

        if (soundWithVolume.setVolume) {
            soundWithVolume.setVolume(volume);
        } else {
            soundWithVolume.volume = volume;
        }
    }
}

export const AudioManager = new GameAudioManager();
