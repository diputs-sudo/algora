import heapq


Cell = tuple[int, int]


def a_star(
    width: int,
    height: int,
    walls: set[Cell],
    start: Cell,
    target: Cell,
) -> list[Cell]:
    def heuristic(cell: Cell) -> int:
        return abs(cell[0] - target[0]) + abs(cell[1] - target[1])

    open_set = [(heuristic(start), 0, start)]
    g_score = {start: 0}
    parent: dict[Cell, Cell] = {}
    closed: set[Cell] = set()

    while open_set:
        _, current_g, current = heapq.heappop(open_set)
        if current in closed: 
            continue
        closed.add(current)

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
            if neighbor in walls or neighbor in closed: 
                continue

            next_g = current_g + 1 
            if next_g >= g_score.get(neighbor, float("inf")):
                continue

            g_score[neighbor] = next_g
            parent[neighbor] = current
            heapq.heappush(open_set, (next_g + heuristic(neighbor), next_g, neighbor))

    return []
