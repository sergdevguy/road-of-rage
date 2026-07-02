export type BonusId =
    | 'addGun'
    | 'addDrone'
    | 'gunDamage'
    | 'gunFireRate'
    | 'droneDamage'
    | 'droneFireRate'
    | 'repair'
    | 'maxHp';

export type BonusDefinition = {
    id: BonusId;
    title: string;
    description: string;
    iconKey?: string;
    weight: number;
};

export const BONUS_DEFINITIONS: Record<BonusId, BonusDefinition> = {
    addGun: {
        id: 'addGun',
        title: 'ДОПОЛНИТЕЛЬНЫЙ ПУЛЕМЁТ',
        description: 'Установить ещё одну пушку',
        weight: 25
    },
    addDrone: {
        id: 'addDrone',
        title: 'БОЕВОЙ ДРОН',
        description: 'Добавить боевого дрона',
        weight: 20
    },
    gunDamage: {
        id: 'gunDamage',
        title: 'УСИЛЕННЫЕ ПАТРОНЫ',
        description: '+25% к урону всех пушек',
        weight: 20
    },
    gunFireRate: {
        id: 'gunFireRate',
        title: 'УСКОРЕННАЯ ПОДАЧА',
        description: '+20% к скорострельности пушек',
        weight: 20
    },
    droneDamage: {
        id: 'droneDamage',
        title: 'ОРУДИЯ ДРОНОВ',
        description: '+25% к урону дронов',
        weight: 15
    },
    droneFireRate: {
        id: 'droneFireRate',
        title: 'УСКОРЕННОЕ НАВЕДЕНИЕ',
        description: '+20% к скорострельности дронов',
        weight: 15
    },
    repair: {
        id: 'repair',
        title: 'ПОЛЕВОЙ РЕМОНТ',
        description: 'Восстановить 4 HP',
        weight: 18
    },
    maxHp: {
        id: 'maxHp',
        title: 'УСИЛЕННЫЙ КОРПУС',
        description: '+3 к максимальному HP и восстановить 3 HP',
        weight: 12
    }
};
