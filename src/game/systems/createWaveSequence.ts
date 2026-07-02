import {
    FALLBACK_WAVE_SEQUENCE,
    FINAL_WAVE_SELECTION_WEIGHTS,
    FIRST_WAVE_SELECTION_WEIGHTS,
    WAVE_SEQUENCE_SETTINGS,
    WAVE_TYPE_SELECTION_WEIGHTS,
    type WaveType
} from '../config/waves';

export function createWaveSequence(
    totalWaves: number,
    random: () => number = Math.random
): WaveType[] {
    if (totalWaves <= 0) {
        return [];
    }

    for (let attempt = 0; attempt < WAVE_SEQUENCE_SETTINGS.maxGenerationAttempts; attempt += 1) {
        const sequence = createWaveSequenceAttempt(totalWaves, random);

        if (new Set(sequence).size >= Math.min(totalWaves, WAVE_SEQUENCE_SETTINGS.minUniqueTypes)) {
            return sequence;
        }
    }

    return FALLBACK_WAVE_SEQUENCE.slice(0, totalWaves);
}

export function selectWeightedWaveType(
    weights: Partial<Record<WaveType, number>>,
    random: () => number
): WaveType {
    const entries = Object.entries(weights).filter((entry): entry is [WaveType, number] => {
        return (entry[1] ?? 0) > 0;
    });
    const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = random() * totalWeight;

    for (const [type, weight] of entries) {
        roll -= weight;

        if (roll <= 0) {
            return type;
        }
    }

    return entries[entries.length - 1][0];
}

function createWaveSequenceAttempt(totalWaves: number, random: () => number) {
    const sequence: WaveType[] = [];

    for (let index = 0; index < totalWaves; index += 1) {
        const baseWeights = getBaseWeightsForIndex(index, totalWaves);
        const adjustedWeights = adjustWeightsForRecentWaves(baseWeights, sequence);
        sequence.push(selectWeightedWaveType(adjustedWeights, random));
    }

    return sequence;
}

function getBaseWeightsForIndex(index: number, totalWaves: number) {
    if (index === 0) {
        return FIRST_WAVE_SELECTION_WEIGHTS;
    }

    if (index === totalWaves - 1) {
        return FINAL_WAVE_SELECTION_WEIGHTS;
    }

    return WAVE_TYPE_SELECTION_WEIGHTS;
}

function adjustWeightsForRecentWaves(
    weights: Partial<Record<WaveType, number>>,
    sequence: WaveType[]
) {
    const adjustedWeights: Partial<Record<WaveType, number>> = {};
    const previous = sequence[sequence.length - 1];
    const twoWavesAgo = sequence[sequence.length - 2];

    for (const [type, weight] of Object.entries(weights) as Array<[WaveType, number]>) {
        let adjustedWeight = weight;

        if (previous === type && twoWavesAgo === type) {
            adjustedWeight = 0;
        } else {
            if (previous === type) {
                adjustedWeight *= WAVE_SEQUENCE_SETTINGS.sameAsPreviousMultiplier;
            }

            if (twoWavesAgo === type) {
                adjustedWeight *= WAVE_SEQUENCE_SETTINGS.sameAsTwoWavesAgoMultiplier;
            }
        }

        adjustedWeights[type] = adjustedWeight;
    }

    return adjustedWeights;
}
