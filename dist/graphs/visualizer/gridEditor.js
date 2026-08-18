function pointKey(point) {
    return `${point.row},${point.col}`;
}
export function updateGrid(graph, point, mode) {
    const selectedKey = pointKey(point);
    const startKey = pointKey(graph.start);
    const targetKey = pointKey(graph.target);
    const isWall = graph.walls.some(wall => pointKey(wall) === selectedKey);
    const walls = graph.walls.filter(wall => pointKey(wall) !== selectedKey);
    if (mode === "wall") {
        if (!isWall && selectedKey !== startKey && selectedKey !== targetKey) {
            walls.push(point);
        }
        return { ...graph, walls };
    }
    if ((mode === "start" && selectedKey === targetKey) || (mode === "target" && selectedKey === startKey)) {
        return graph;
    }
    return mode === "start"
        ? { ...graph, start: point, walls }
        : { ...graph, target: point, walls };
}
