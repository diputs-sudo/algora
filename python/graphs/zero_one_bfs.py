from collections import deque


Cell = tuple[int, int]


def zero_one_bfs(
    width: int,
    height: int,
    walls: set[Cell],
    weights: dict[Cell, int],
    start: Cell,
    target: Cell,
) -> list[Cell]:
    distances = {start: 0}
    parent: dict[Cell, Cell] = {}
    queue = deque([start])

    while queue:
        current = queue.popleft()

        if current == target:
            path = [current]
            while path[-1] != start:
                path.append(parent[path[-1]])
            path.reverse()
            return path

        row, col = current
        neighbors = (
            (row - 1, col),
            (row, col + 1),
            (row + 1, col),
            (row, col - 1),
        )

        for neighbor in neighbors:
            next_row, next_col = neighbor
            if not (0 <= next_row < height and 0 <= next_col < width):
                continue
            if neighbor in walls:
                continue

            weight = weights.get(neighbor, 0)
            distance = distances[current] + weight
            if distance >= distances.get(neighbor, float("inf")):
                continue

            distances[neighbor] = distance
            parent[neighbor] = current
            if weight == 0:
                queue.appendleft(neighbor)
            else:
                queue.append(neighbor)

    return []
