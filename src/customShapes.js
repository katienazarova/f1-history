export function parallelogram(x, y, width, height, radius, shift) {
    return 'M' + x + ',' + y
        + 'h' + width
        + 'a' + radius + " " + radius + ", 0, 0, 1, " + radius + " " + radius
        + 'l' + ' ' + (-shift) + ' ' + height
        + 'a' + radius + " " + radius + ", 0, 0, 1, " + (-radius) + " " + radius
        + 'h' + (-width)
        + 'a' + radius + " " + radius + ", 0, 0, 1, " + (-radius) + " " + (-radius)
        + 'l' + ' ' + shift + ' ' + (-height)
        + 'a' + radius + " " + radius + ", 0, 0, 1, " + radius + " " + (-radius)
        + 'z';
}