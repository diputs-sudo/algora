from collections import deque
from collections.abc import Mapping, Set


Cell = tuple[int, int]


def zero_one_bfs_path(
    width: int,
    height: int,
    walls: Set[Cell],
    weights: Mapping[Cell, int],
    start: Cell,
    target: Cell,
) -> list[Cell]:
    if width <= 0 or height <= 0:
        raise ValueError("grid dimensions must be positive")

    def cell_id(cell: Cell) -> int:
        return cell[0] * width + cell[1]

    def inside(cell: Cell) -> bool:
        row, col = cell
        return 0 <= row < height and 0 <= col < width

    if not inside(start) or not inside(target):
        raise ValueError("start and target must be inside the grid")

    total = width * height
    blocked = bytearray(total)
    edge_cost = bytearray(total)

    for wall in walls:
        if inside(wall):
            blocked[cell_id(wall)] = 1

    for cell, weight in weights.items():
        if not inside(cell) or weight not in (0, 1):
            raise ValueError("weights must be 0 or 1 inside the grid")
        edge_cost[cell_id(cell)] = weight

    start_id = cell_id(start)
    target_id = cell_id(target)
    if blocked[start_id] or blocked[target_id]:
        return []

    infinity = total + 1
    distances = [infinity] * total
    parent = [-1] * total
    queue = deque([start_id])
    distances[start_id] = 0

    while queue:
        current_id = queue.popleft()
        if current_id == target_id:
            path = []
            while current_id != -1:
                path.append(divmod(current_id, width))
                current_id = parent[current_id]
            path.reverse()
            return path

        row, col = divmod(current_id, width)
        neighbors = (
            (row - 1, col),
            (row, col + 1),
            (row + 1, col),
            (row, col - 1),
        )

        for next_row, next_col in neighbors:
            if not (0 <= next_row < height and 0 <= next_col < width):
                continue

            next_id = next_row * width + next_col
            if blocked[next_id]:
                continue

            distance = distances[current_id] + edge_cost[next_id]
            if distance >= distances[next_id]:
                continue

            distances[next_id] = distance
            parent[next_id] = current_id
            if edge_cost[next_id] == 0:
                queue.appendleft(next_id)
            else:
                queue.append(next_id)

    return []
