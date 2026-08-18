import heapq
from collections.abc import Iterable


Cell = tuple[int, int]


def a_star_path(
    width: int,
    height: int,
    walls: Iterable[Cell],
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
    for wall in walls:
        if inside(wall):
            blocked[cell_id(wall)] = 1

    start_id = cell_id(start)
    target_id = cell_id(target)
    if blocked[start_id] or blocked[target_id]:
        return []

    def heuristic(cell_id_value: int) -> int:
        row, col = divmod(cell_id_value, width)
        target_row, target_col = target
        return abs(row - target_row) + abs(col - target_col)

    infinity = total + 1
    distance = [infinity] * total
    parent = [-1] * total
    closed = bytearray(total)
    open_set = [(heuristic(start_id), 0, start_id)]
    distance[start_id] = 0

    while open_set:
        _, current_distance, current_id = heapq.heappop(open_set)
        if closed[current_id]:
            continue
        closed[current_id] = 1

        if current_id == target_id:
            path = []
            while current_id != -1:
                path.append(divmod(current_id, width))
                current_id = parent[current_id]
            path.reverse()
            return path

        row, col = divmod(current_id, width)
        for next_row, next_col in (
            (row - 1, col),
            (row, col + 1),
            (row + 1, col),
            (row, col - 1),
        ):
            if not (0 <= next_row < height and 0 <= next_col < width):
                continue

            next_id = next_row * width + next_col
            if blocked[next_id] or closed[next_id]:
                continue

            next_distance = current_distance + 1
            if next_distance >= distance[next_id]:
                continue

            distance[next_id] = next_distance
            parent[next_id] = current_id
            heapq.heappush(open_set, (next_distance + heuristic(next_id), next_distance, next_id))

    return []
