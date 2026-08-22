from heapq import heappop, heappush
from math import hypot, inf, sqrt


Cell = tuple[int, int]
Key = tuple[float, float]


class DStarLite:
    def __init__(
        self,
        grid: list[list[int]],
        start: Cell,
        goal: Cell,
        heuristic: str = "manhattan",
    ) -> None:
        self.grid = [row[:] for row in grid]
        self.rows = len(grid)
        self.cols = len(grid[0])
        self.start = start
        self.goal = goal
        self.heuristic_name = heuristic
        self.km = 0.0

        self.g: dict[Cell, float] = {}
        self.rhs: dict[Cell, float] = {goal: 0.0}
        self.queue: list[tuple[float, float, Cell]] = []
        self.open_keys: dict[Cell, Key] = {}
        self._push(goal)

    def replan(self) -> list[Cell]:
        self.compute_shortest_path()
        return self.path()

    def set_blocked(self, cell: Cell, blocked: bool) -> None:
        if cell == self.start or cell == self.goal:
            raise ValueError("start and goal cannot be blocked")

        row, col = cell
        if bool(self.grid[row][col]) == blocked:
            return

        self.grid[row][col] = int(blocked)
        if blocked:
            self.g[cell] = inf
            self.rhs[cell] = inf
            self.open_keys.pop(cell, None)
        else:
            self._update_vertex(cell)

        for neighbor in self._adjacent(cell):
            if not self._blocked(neighbor):
                self._update_vertex(neighbor)

    def move_start(self, new_start: Cell) -> None:
        self.km += self._heuristic(self.start, new_start)
        self.start = new_start

    def compute_shortest_path(self) -> None:
        while (
            self._key_less(self._top_key(), self._calculate_key(self.start))
            or self._value(self.rhs, self.start) != self._value(self.g, self.start)
        ):
            item = self._pop()
            if item is None:
                return

            old_key, cell = item
            new_key = self._calculate_key(cell)
            if self._key_less(old_key, new_key):
                self._push(cell)
            elif self._value(self.g, cell) > self._value(self.rhs, cell):
                self.g[cell] = self._value(self.rhs, cell)
                for predecessor in self._neighbors(cell):
                    self._update_vertex(predecessor)
            else:
                self.g[cell] = inf
                self._update_vertex(cell)
                for predecessor in self._neighbors(cell):
                    self._update_vertex(predecessor)

    def path(self) -> list[Cell]:
        if self._value(self.g, self.start) == inf:
            return []

        result = [self.start]
        current = self.start
        while current != self.goal:
            choices = self._neighbors(current)
            if not choices:
                return []

            current = min(
                choices,
                key=lambda cell: (1.0 + self._value(self.g, cell), cell),
            )
            if self._value(self.g, current) == inf:
                return []
            result.append(current)

        return result

    def _update_vertex(self, cell: Cell) -> None:
        if cell != self.goal:
            self.rhs[cell] = min(
                (1.0 + self._value(self.g, neighbor) for neighbor in self._neighbors(cell)),
                default=inf,
            )

        self.open_keys.pop(cell, None)
        if self._value(self.g, cell) != self._value(self.rhs, cell):
            self._push(cell)

    def _push(self, cell: Cell) -> None:
        key = self._calculate_key(cell)
        self.open_keys[cell] = key
        heappush(self.queue, (*key, cell))

    def _top_key(self) -> Key:
        while self.queue:
            first, second, cell = self.queue[0]
            if self.open_keys.get(cell) == (first, second):
                return first, second
            heappop(self.queue)
        return inf, inf

    def _pop(self) -> tuple[Key, Cell] | None:
        while self.queue:
            first, second, cell = heappop(self.queue)
            if self.open_keys.get(cell) == (first, second):
                del self.open_keys[cell]
                return (first, second), cell
        return None

    def _calculate_key(self, cell: Cell) -> Key:
        value = min(self._value(self.g, cell), self._value(self.rhs, cell))
        return value + self._heuristic(self.start, cell) + self.km, value

    def _heuristic(self, left: Cell, right: Cell) -> float:
        rows = abs(left[0] - right[0])
        cols = abs(left[1] - right[1])
        if self.heuristic_name == "euclidean":
            return hypot(rows, cols)
        if self.heuristic_name == "chebyshev":
            return max(rows, cols)
        if self.heuristic_name == "octile":
            return max(rows, cols) + (sqrt(2) - 1) * min(rows, cols)
        return rows + cols

    def _neighbors(self, cell: Cell) -> list[Cell]:
        return [neighbor for neighbor in self._adjacent(cell) if not self._blocked(neighbor)]

    def _adjacent(self, cell: Cell) -> list[Cell]:
        row, col = cell
        candidates = ((row - 1, col), (row, col + 1), (row + 1, col), (row, col - 1))
        return [
            neighbor
            for neighbor in candidates
            if 0 <= neighbor[0] < self.rows and 0 <= neighbor[1] < self.cols
        ]

    def _blocked(self, cell: Cell) -> bool:
        return bool(self.grid[cell[0]][cell[1]])

    @staticmethod
    def _key_less(left: Key, right: Key) -> bool:
        return left < right

    @staticmethod
    def _value(values: dict[Cell, float], cell: Cell) -> float:
        return values.get(cell, inf)
