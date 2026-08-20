from collections import deque

Cell = tuple[int, int]


def bidirectional_bfs(
    width: int,
    height: int,
    walls: set[Cell],
    start: Cell,
    target: Cell,
) -> list[Cell]:
    def inside(cell: Cell) -> bool:
        return 0 <= cell[0] < height and 0 <= cell[1] < width

    if not inside(start) or not inside(target) or start in walls or target in walls:
        return []

    if start == target:
        return [start]

    def neighbors(cell: Cell):
        row, col = cell
        for next_cell in ((row - 1, col), (row, col + 1), (row + 1, col), (row, col - 1)):
            if inside(next_cell) and next_cell not in walls:
                yield next_cell

    forward = deque([start])
    backward = deque([target])
    seen_forward = {start}
    seen_backward = {target}
    parent_forward: dict[Cell, Cell] = {}
    parent_backward: dict[Cell, Cell] = {}

    while forward and backward:
        expand_forward = len(forward) <= len(backward)
        current_queue = forward if expand_forward else backward
        next_queue = deque()

        for current in tuple(current_queue):
            current_queue.popleft()
            for neighbor in neighbors(current):
                own_seen = seen_forward if expand_forward else seen_backward
                other_seen = seen_backward if expand_forward else seen_forward
                if neighbor in own_seen:
                    continue

                own_seen.add(neighbor)
                if expand_forward:
                    parent_forward[neighbor] = current
                else:
                    parent_backward[neighbor] = current

                if neighbor in other_seen:
                    left = []
                    node = neighbor
                    while node != start:
                        left.append(node)
                        node = parent_forward[node]
                    left.append(start)
                    left.reverse()

                    right = []
                    node = parent_backward.get(neighbor)
                    while node is not None:
                        right.append(node)
                        node = parent_backward.get(node)
                    return left + right

                next_queue.append(neighbor)

        if expand_forward:
            forward = next_queue
        else:
            backward = next_queue

    return []

