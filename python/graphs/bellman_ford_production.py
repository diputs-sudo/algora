from collections.abc import Iterable, Mapping


Cell = tuple[int, int]


def bellman_ford_path(
    width: int,
    height: int,
    walls: Iterable[Cell],
    costs: Mapping[Cell, int],
    start: Cell,
    target: Cell,
) -> list[Cell]:
    if width <= 0 or height <= 0:
        raise ValueError("grid dimensions must be positive")

    def inside(cell: Cell) -> bool:
        return 0 <= cell[0] < height and 0 <= cell[1] < width

    if not inside(start) or not inside(target):
        raise ValueError("start and target must be inside the grid")

    total = width * height
    blocked = bytearray(total)
    for wall in walls:
        if inside(wall):
            blocked[wall[0] * width + wall[1]] = 1

    start_id = start[0] * width + start[1]
    target_id = target[0] * width + target[1]
    if blocked[start_id] or blocked[target_id]:
        return []

    cells = [cell_id for cell_id in range(total) if not blocked[cell_id]]
    infinity = total * max(1, max((abs(value) for value in costs.values()), default=1)) + 1
    distance = [infinity] * total
    parent = [-1] * total
    distance[start_id] = 0

    def neighbors(cell_id: int):
        row, col = divmod(cell_id, width)
        for next_row, next_col in (
            (row - 1, col),
            (row, col + 1),
            (row + 1, col),
            (row, col - 1),
        ):
            if 0 <= next_row < height and 0 <= next_col < width:
                next_id = next_row * width + next_col
                if not blocked[next_id]:
                    yield next_id

    for _ in range(len(cells) - 1):
        changed = False

        for cell_id in cells:
            if distance[cell_id] == infinity:
                continue

            for next_id in neighbors(cell_id):
                next_cell = divmod(next_id, width)
                candidate = distance[cell_id] + costs.get(next_cell, 1)
                if candidate >= distance[next_id]:
                    continue

                distance[next_id] = candidate
                parent[next_id] = cell_id
                changed = True

        if not changed:
            break

    for cell_id in cells:
        if distance[cell_id] == infinity:
            continue
        for next_id in neighbors(cell_id):
            next_cell = divmod(next_id, width)
            if distance[cell_id] + costs.get(next_cell, 1) < distance[next_id]:
                raise ValueError("reachable negative cycle")

    if distance[target_id] == infinity:
        return []

    path = []
    current_id = target_id
    while current_id != -1:
        path.append(divmod(current_id, width))
        current_id = parent[current_id]
    path.reverse()
    return path
