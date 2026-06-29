import type { Point } from '../types';

export const clamp = (value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value));
};

export const distanceSquared = (a: Point, b: Point) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return dx * dx + dy * dy;
};

export const angleBetween = (from: Point, to: Point) => {
    return Math.atan2(to.y - from.y, to.x - from.x);
};

export const pointOnCircle = (center: Point, radius: number, angle: number): Point => {
    return {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius
    };
};
