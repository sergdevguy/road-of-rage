export type AudioCategory = 'music' | 'sfx';

export type AudioKey =
    | 'mainTheme'
    | 'uiButton'
    | 'fastCarSpawn'
    | 'armoredCarSpawn'
    | 'droneSpawn'
    | 'enemyExplosion'
    | 'turretShot'
    | 'droneShot'
    | 'takeBonus'
    | 'takeDamage';

export type AudioDefinition = {
    key: AudioKey;
    assetKey: string;
    path: string;
    category: AudioCategory;
    defaultVolume: number;
    loop?: boolean;
    cooldownMs?: number;
};

export type AudioSettings = {
    musicEnabled: boolean;
    sfxEnabled: boolean;
    musicVolume: number;
    sfxVolume: number;
    perSoundVolume: Partial<Record<AudioKey, number>>;
};

export const AUDIO_DEFINITIONS: Record<AudioKey, AudioDefinition> = {
    mainTheme: {
        key: 'mainTheme',
        assetKey: 'audio-main-theme',
        path: 'assets/sounds/music/main-theme.mp3',
        category: 'music',
        defaultVolume: 0.52,
        loop: true
    },
    uiButton: {
        key: 'uiButton',
        assetKey: 'audio-ui-button',
        path: 'assets/sounds/ui/button.wav',
        category: 'sfx',
        defaultVolume: 0.50,
        cooldownMs: 70
    },
    fastCarSpawn: {
        key: 'fastCarSpawn',
        assetKey: 'audio-fastcar-spawn',
        path: 'assets/sounds/enemy/fastcar-spawn.mp3',
        category: 'sfx',
        defaultVolume: 0.3
    },
    armoredCarSpawn: {
        key: 'armoredCarSpawn',
        assetKey: 'audio-armoredcar-spawn',
        path: 'assets/sounds/enemy/armoredcar-spawn.mp3',
        category: 'sfx',
        defaultVolume: 0.3
    },
    droneSpawn: {
        key: 'droneSpawn',
        assetKey: 'audio-drone-spawn',
        path: 'assets/sounds/enemy/drone-spawn.mp3',
        category: 'sfx',
        defaultVolume: 0.3
    },
    enemyExplosion: {
        key: 'enemyExplosion',
        assetKey: 'audio-enemy-explosion',
        path: 'assets/sounds/enemy/explosion.wav',
        category: 'sfx',
        defaultVolume: 0.6,
        cooldownMs: 60
    },
    turretShot: {
        key: 'turretShot',
        assetKey: 'audio-turret-shot',
        path: 'assets/sounds/hero/turret-shot.wav',
        category: 'sfx',
        defaultVolume: 0.3,
        cooldownMs: 45
    },
    droneShot: {
        key: 'droneShot',
        assetKey: 'audio-drone-shot',
        path: 'assets/sounds/hero/drone-shot.wav',
        category: 'sfx',
        defaultVolume: 0.3,
        cooldownMs: 55
    },
    takeBonus: {
        key: 'takeBonus',
        assetKey: 'audio-take-bonus',
        path: 'assets/sounds/hero/take-bonus.wav',
        category: 'sfx',
        defaultVolume: 0.5
    },
    takeDamage: {
        key: 'takeDamage',
        assetKey: 'audio-take-damage',
        path: 'assets/sounds/hero/take-damage.wav',
        category: 'sfx',
        defaultVolume: 0.5,
        cooldownMs: 120
    }
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
    musicEnabled: true,
    sfxEnabled: true,
    musicVolume: 1,
    sfxVolume: 1,
    perSoundVolume: {}
};
