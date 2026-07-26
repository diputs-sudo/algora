function buildWorkspace(tree, result, detail, activeTreeIndex) {
    return {
        title: "Algorithm Workspace",
        detail,
        rows: [
            {
                label: "Tournament Tree",
                values: tree,
                activeIndices: activeTreeIndex === undefined ? [] : [activeTreeIndex]
            },
            {
                label: "Output",
                values: result
            }
        ]
    };
}
export function* tournamentSort(input) {
    const arr = [...input];
    const n = arr.length;
    if (n === 0) {
        yield {
            type: "done",
            array: [],
            memoryUsed: 0,
            memoryLabel: "Memory",
            memoryUnit: "items"
        };
        return;
    }
    const size = 1 << Math.ceil(Math.log2(Math.max(1, n)));
    const offset = size;
    const tree = new Array(2 * size).fill(null);
    const display = new Array(n).fill(null);
    for (let index = 0; index < n; index++) {
        tree[offset + index] = arr[index];
    }
    for (let index = offset - 1; index > 0; index--) {
        const left = tree[2 * index];
        const right = tree[2 * index + 1];
        tree[index] = left === null ? right : right === null ? left : Math.min(left, right);
    }
    function visibleTree() {
        return tree.slice(1);
    }
    function* updateTree(index, outputIndex, sourceIndex) {
        let current = Math.floor(index / 2);
        while (current >= 1) {
            const left = tree[2 * current];
            const right = tree[2 * current + 1];
            tree[current] = left === null ? right : right === null ? left : Math.min(left, right);
            const winnerCount = display.filter(value => value !== null).length;
            yield {
                type: "compare",
                indices: sourceIndex === outputIndex ? [outputIndex] : [outputIndex, sourceIndex],
                array: display.map((value, displayIndex) => value ?? arr[displayIndex]),
                memoryUsed: tree.length - 1,
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: buildWorkspace(visibleTree(), [...display], `Update the tournament tree after extracting winner ${winnerCount}`, current - 1)
            };
            current = Math.floor(current / 2);
        }
    }
    for (let outputIndex = 0; outputIndex < n; outputIndex++) {
        const winner = tree[1];
        if (winner === null) {
            break;
        }
        display[outputIndex] = winner;
        const sourceIndex = currentLeafIndex(tree, offset, winner, n);
        yield {
            type: "swap",
            indices: sourceIndex === outputIndex ? [outputIndex] : [outputIndex, sourceIndex],
            array: display.map((value, displayIndex) => value ?? arr[displayIndex]),
            memoryUsed: tree.length - 1,
            memoryLabel: "Memory",
            memoryUnit: "items",
            workspace: buildWorkspace(visibleTree(), [...display], `Extract winner ${winner} from the root of the tournament tree`, 0)
        };
        let current = sourceIndex + offset;
        tree[current] = null;
        yield* updateTree(current, outputIndex, sourceIndex);
    }
    yield {
        type: "done",
        array: display.map(value => value ?? 0),
        memoryUsed: tree.length - 1,
        memoryLabel: "Memory",
        memoryUnit: "items",
        workspace: buildWorkspace(visibleTree(), [...display], "All winners have been extracted from the tournament tree")
    };
}
function currentLeafIndex(tree, offset, winner, length) {
    let current = 1;
    while (current < offset) {
        const left = 2 * current;
        const right = 2 * current + 1;
        current = tree[left] === winner ? left : right;
    }
    return Math.min(current - offset, Math.max(length - 1, 0));
}
