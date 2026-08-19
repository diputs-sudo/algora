from collections import deque
from collections.abc import Iterable


Cell = tuple[int, int]


def bfs_path(
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

    total = width * height
    blocked = bytearray(total)
    for wall in walls:
        if inside(wall):
            blocked[wall[0] * width + wall[1]] = 1

    start_id = start[0] * width + start[1]
    target_id = target[0] * width + target[1]
    if blocked[start_id] or blocked[target_id]:
        return []

    parent = [-1] * total
    visited = bytearray(total)
    queue = deque([start_id])
    visited[start_id] = 1

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
        for next_row, next_col in (
            (row - 1, col),
            (row, col + 1),
            (row + 1, col),
            (row, col - 1),
        ):
            if not (0 <= next_row < height and 0 <= next_col < width):
                continue

            next_id = next_row * width + next_col
            if blocked[next_id] or visited[next_id]:
                continue

            visited[next_id] = 1
            parent[next_id] = current_id
            queue.append(next_id)

    return []
