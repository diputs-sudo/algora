from collections import deque 


Cell = tuple[int, int]


def bfs(
    width: int,
    height: int,
    walls: set[Cell],
    start: Cell,
    target: Cell,
) -> list[Cell]:
    queue = deque([start])
    visited = {start}
    parent: dict[Cell, Cell] = {}

    while queue: 
        current = queue.popleft()
        if current == target:
            path = [current]
            while path[-1] != start: 
                path.append(parent[path[-1]])
            path.reverse()
            return path

        row, col = current
        for neighbor in (
            (row - 1, col),
            (row, col + 1),
            (row + 1, col),
            (row, col - 1),
        ):
            next_row, next_col = neighbor
            if not (0 <= next_row < height and 0 <= next_col < width):
                continue
            if neighbor in walls or neighbor in visited:
                continue

            visited.add(neighbor)
            parent[neighbor] = current
            queue.append(neighbor)

    return []
