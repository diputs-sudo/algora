def dfs_grid(width, height, walls, start, target):
    wall_set = set(walls)
    visited = set()
    parent = {}
    stack = [start]

    def neighbors(cell):
        row, col = cell
        for next_cell in ((row - 1, col), (row, col + 1), (row + 1, col), (row, col - 1)):
            next_row, next_col = next_cell
            if 0 <= next_row < height and 0 <= next_col < width and next_cell not in wall_set:
                yield next_cell

    while stack: 
        cell = stack.pop()

        if cell in visited:
            continue

        visited.add(cell)

        if cell == target:
            path = [cell]
            while path[-1] != start: 
                path.append(parent[path[-1]])
            return list(reversed(path))

        for neighbor in neighbors(cell):
            if neighbor not in visited and neighbor not in stack: 
                parent[neighbor] = cell
                stack.append(neighbor)

    return[]
