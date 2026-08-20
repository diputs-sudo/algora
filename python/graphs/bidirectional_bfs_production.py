from collections import deque
from collections.abc import Iterable

Cell = tuple[int, int]


def bidirectional_bfs_path(
    width: int,
    height: int,
    walls: Iterable[Cell],
    start: Cell,
    target: Cell,
) -> list[Cell]:
    if width <= 0 or height <= 0:
        raise ValueError("grid dimensions must be positive")

    def inside(cell: Cell) -> bool:
        return 0 <= cell[0] < height and 0 <= cell[1] < width

    if not inside(start) or not inside(target):
        raise ValueError("start and target must be inside the grid")

    blocked = set(walls)
    if start in blocked or target in blocked:
        return []
    if start == target:
        return [start]

    def neighbors(cell: Cell):
        row, col = cell
        for next_cell in ((row - 1, col), (row, col + 1), (row + 1, col), (row, col - 1)):
            if inside(next_cell) and next_cell not in blocked:
                yield next_cell

    queues = [deque([start]), deque([target])]
    seen = [{start}, {target}]
    parents = [{}, {}]

    while queues[0] and queues[1]:
        side = 0 if len(queues[0]) <= len(queues[1]) else 1
        other = 1 - side
        next_queue = deque()

        for current in tuple(queues[side]):
            queues[side].popleft()
            for neighbor in neighbors(current):
                if neighbor in seen[side]:
                    continue

                seen[side].add(neighbor)
                parents[side][neighbor] = current
                if neighbor in seen[other]:
                    left = []
                    node = neighbor
                    while node != start:
                        left.append(node)
                        node = parents[0][node]
                    left.append(start)
                    left.reverse()

                    right = []
                    node = parents[1].get(neighbor)
                    while node is not None:
                        right.append(node)
                        node = parents[1].get(node)
                    return left + right

                next_queue.append(neighbor)

        queues[side] = next_queue

    return []

