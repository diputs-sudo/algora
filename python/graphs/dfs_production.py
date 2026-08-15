from collections.abc import Iterable

Cell = tuple[int, int]


def dfs_grid_path(
    width: int,
    height: int,
    walls: Iterable[Cell],
    start: Cell,
    target: Cell,
) -> list[Cell]:
    if width <= 0 or height <= 0:
        raise ValueError("grid dimensions must be positive")

    def inside(cell: Cell) -> bool:
        row, col = cell
        return 0 <= row < height and 0 <= col < width

    if not inside(start) or not inside(target):
        raise ValueError("start and target must be inside the grid")

    total = width * height
    start_id = start[0] * width + start[1]
    target_id = target[0] * width + target[1]
    blocked = bytearray(total)

    for row, col in walls:
        if inside((row, col)):
            blocked[row * width + col] = 1

    if blocked[start_id] or blocked[target_id]:
        return []

    visited = bytearray(total)
    parent = [-1] * total
    stack = [start_id]
    visited[start_id] = 1

    while stack:
        cell_id = stack.pop()

        if cell_id == target_id:
            path: list[Cell] = []
            while cell_id != -1:
                path.append(divmod(cell_id, width))
                cell_id = parent[cell_id]
            path.reverse()
            return path

        row, col = divmod(cell_id, width)
        for next_row, next_col in ((row - 1, col), (row, col + 1), (row + 1, col), (row, col - 1)):
            if 0 <= next_row < height and 0 <= next_col < width:
                next_id = next_row * width + next_col
                if not blocked[next_id] and not visited[next_id]:
                    visited[next_id] = 1
                    parent[next_id] = cell_id
                    stack.append(next_id)

    return []
