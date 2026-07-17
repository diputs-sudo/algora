export function generateUniqueRandomArray(size, min = 1, max = 100) {
    const rangeSize = max - min + 1;
    if (size > rangeSize) {
        throw new Error("Requested array size exceeds available unique values.");
    }
    const values = Array.from({ length: rangeSize }, (_, index) => min + index);
    for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
    }
    return values.slice(0, size);
}
