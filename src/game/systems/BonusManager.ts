import { BONUS_DEFINITIONS, type BonusDefinition, type BonusId } from '../config/bonuses'

const DEBUG_BONUSES = false;

export type RunUpgradeState = {
    gunCount: number;
    maxGunSlots: 3;
    droneCount: number;
    maxDroneSlots: 2;
    gunDamageMultiplier: number;
    gunFireRateMultiplier: number;
    droneDamageMultiplier: number;
    droneFireRateMultiplier: number;
    maxHp: number;
    currentHp: number;
};

export class BonusManager {
    private readonly state: RunUpgradeState;
    private readonly random: () => number;

    constructor(state: RunUpgradeState, random: () => number = Math.random) {
        this.state = state;
        this.random = random;
    }

    getChoices(count: number) {
        const choices: BonusDefinition[] = [];
        const available = Object.values(BONUS_DEFINITIONS).filter((bonus) => this.canOffer(bonus.id));

        while (choices.length < count && available.length > 0) {
            const selected = this.pickWeightedBonus(available);
            choices.push(selected);
            available.splice(available.indexOf(selected), 1);
        }

        if (DEBUG_BONUSES) {
            console.debug('Bonus choices:', choices);
        }

        return choices;
    }

    canOffer(id: BonusId) {
        if (id === 'addGun') {
            return this.state.gunCount < this.state.maxGunSlots;
        }

        if (id === 'addDrone') {
            return this.state.droneCount < this.state.maxDroneSlots;
        }

        if (id === 'droneDamage' || id === 'droneFireRate') {
            return this.state.droneCount > 0;
        }

        if (id === 'repair') {
            return this.state.currentHp < this.state.maxHp;
        }

        return true;
    }

    applyBonus(id: BonusId) {
        if (!this.canOffer(id)) {
            return;
        }

        if (id === 'addGun') {
            this.state.gunCount += 1;
        } else if (id === 'addDrone') {
            this.state.droneCount += 1;
        } else if (id === 'gunDamage') {
            this.state.gunDamageMultiplier *= 1.25;
        } else if (id === 'gunFireRate') {
            this.state.gunFireRateMultiplier *= 1.2;
        } else if (id === 'droneDamage') {
            this.state.droneDamageMultiplier *= 1.25;
        } else if (id === 'droneFireRate') {
            this.state.droneFireRateMultiplier *= 1.2;
        } else if (id === 'repair') {
            this.state.currentHp = Math.min(this.state.maxHp, this.state.currentHp + 4);
        } else if (id === 'maxHp') {
            this.state.maxHp += 3;
            this.state.currentHp = Math.min(this.state.maxHp, this.state.currentHp + 3);
        }

        if (DEBUG_BONUSES) {
            console.debug('Applied bonus:', id);
        }
    }

    private pickWeightedBonus(choices: BonusDefinition[]) {
        const totalWeight = choices.reduce((sum, bonus) => sum + bonus.weight, 0);
        let roll = this.random() * totalWeight;

        for (const bonus of choices) {
            roll -= bonus.weight;

            if (roll <= 0) {
                return bonus;
            }
        }

        return choices[choices.length - 1];
    }
}
