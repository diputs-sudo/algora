Cell = tuple[int, int]


def bellman_ford(
    width: int,
    height: int,
    walls: set[Cell],
    costs: dict[Cell, int],
    start: Cell,
    target: Cell,
) -> list[Cell]:
    def neighbors(cell: Cell):
        row, col = cell
        for next_cell in (
            (row - 1, col),
            (row, col + 1),
            (row + 1, col),
            (row, col - 1),
        ):
            next_row, next_col = next_cell
            if 0 <= next_row < height and 0 <= next_col < width and next_cell not in walls:
                yield next_cell

    open_cells = [
        (row, col)
        for row in range(height)
        for col in range(width)
        if (row, col) not in walls
    ]
    distance = {start: 0}
    parent: dict[Cell, Cell] = {}

    for _ in range(len(open_cells) - 1):
        changed = False

        for cell in open_cells:
            if cell not in distance:
                continue

            for neighbor in neighbors(cell):
                candidate = distance[cell] + costs.get(neighbor, 1)
                if candidate >= distance.get(neighbor, float("inf")):
                    continue

                distance[neighbor] = candidate
                parent[neighbor] = cell
                changed = True

        if not changed:
            break

    for cell in open_cells:
        if cell not in distance:
            continue
        for neighbor in neighbors(cell):
            if distance[cell] + costs.get(neighbor, 1) < distance.get(neighbor, float("inf")):
                raise ValueError("reachable negative cycle")

    if target not in distance:
        return []

    path = [target]
    while path[-1] != start:
        path.append(parent[path[-1]])
    path.reverse()
    return path
