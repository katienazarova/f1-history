export function transformCoordinates(angle, center, translateX, translateY) {
    return function (point) {
        const x1 = point.x - center.x;
        const y1 = point.y - center.y;

        const x = x1 * Math.cos(angle) - y1 * Math.sin(angle) + translateX + center.x;
        const y = x1 * Math.sin(angle) + y1 * Math.cos(angle) + translateY + center.y;

        return { x, y };
    }
}