function pointKey(point) {
    return `${point.row},${point.col}`;
}
export function createClusterGrid(width, height, start, target, options = {}) {
    const clusterCount = options.clusterCount ?? 3;
    const minGrowth = options.minGrowth ?? 3;
    const maxGrowth = options.maxGrowth ?? 5;
    const attempts = options.attempts ?? 80;
    const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    const startKey = pointKey(start);
    const targetKey = pointKey(target);
    const neighbors = (point) => directions
        .map(([row, col]) => ({ row: point.row + row, col: point.col + col }))
        .filter(next => next.row >= 0 && next.row < height && next.col >= 0 && next.col < width);
    const hasPath = (walls) => {
        const queue = [start];
        const seen = new Set([startKey]);
        for (let index = 0; index < queue.length; index++) {
            const current = queue[index];
            if (pointKey(current) === targetKey)
                return true;
            for (const next of neighbors(current)) {
                const nextKey = pointKey(next);
                if (!walls.has(nextKey) && !seen.has(nextKey)) {
                    seen.add(nextKey);
                    queue.push(next);
                }
            }
        }
        return false;
    };
    const sections = Array.from({ length: clusterCount }, (_, index) => ({
        minCol: Math.floor(index * width / clusterCount),
        maxCol: Math.floor((index + 1) * width / clusterCount) - 1
    }));
    let bestWalls = new Set();
    for (let attempt = 0; attempt < attempts; attempt++) {
        const walls = new Set();
        for (const section of sections) {
            let seed = {
                row: Math.floor(Math.random() * height),
                col: section.minCol + Math.floor(Math.random() * (section.maxCol - section.minCol + 1))
            };
            while (pointKey(seed) === startKey || pointKey(seed) === targetKey) {
                seed = {
                    row: Math.floor(Math.random() * height),
                    col: section.minCol + Math.floor(Math.random() * (section.maxCol - section.minCol + 1))
                };
            }
            const clusterCells = [seed];
            const clusterKeys = new Set([pointKey(seed)]);
            walls.add(pointKey(seed));
            const growthLimit = minGrowth + Math.floor(Math.random() * (maxGrowth - minGrowth + 1));
            while (clusterCells.length <= growthLimit) {
                const source = clusterCells[Math.floor(Math.random() * clusterCells.length)];
                const candidates = neighbors(source).filter(next => {
                    const nextKey = pointKey(next);
                    const touchesOtherCluster = neighbors(next).some(adjacent => {
                        const adjacentKey = pointKey(adjacent);
                        return walls.has(adjacentKey) && !clusterKeys.has(adjacentKey);
                    });
                    return next.col >= section.minCol
                        && next.col <= section.maxCol
                        && nextKey !== startKey
                        && nextKey !== targetKey
                        && !walls.has(nextKey)
                        && !touchesOtherCluster;
                });
                if (candidates.length === 0)
                    break;
                const next = candidates[Math.floor(Math.random() * candidates.length)];
                walls.add(pointKey(next));
                clusterKeys.add(pointKey(next));
                clusterCells.push(next);
            }
        }
        while (!hasPath(walls) && walls.size > 0) {
            const wallList = [...walls];
            walls.delete(wallList[Math.floor(Math.random() * wallList.length)]);
        }
        if (walls.size > bestWalls.size)
            bestWalls = walls;
    }
    return {
        width,
        height,
        start,
        target,
        walls: [...bestWalls].map(value => {
            const [row, col] = value.split(",").map(Number);
            return { row, col };
        })
    };
}
