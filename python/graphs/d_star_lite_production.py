from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from enum import Enum
from heapq import heappop, heappush
from math import hypot, inf, sqrt


@dataclass(frozen=True, order=True)
class Cell:
    row: int
    col: int


class Heuristic(str, Enum):
    MANHATTAN = "manhattan"
    EUCLIDEAN = "euclidean"
    CHEBYSHEV = "chebyshev"
    OCTILE = "octile"


Key = tuple[float, float]


class DStarLite:
    def __init__(
        self,
        grid: Sequence[Sequence[bool]],
        start: Cell,
        goal: Cell,
        heuristic: Heuristic = Heuristic.MANHATTAN,
    ) -> None:
        if not grid or not grid[0]:
            raise ValueError("grid must be non-empty")

        self.rows = len(grid)
        self.cols = len(grid[0])
        if any(len(row) != self.cols for row in grid):
            raise ValueError("grid must be rectangular")

        self._validate_cell(start, "start")
        self._validate_cell(goal, "goal")

        self._start_id = self._id(start)
        self._goal_id = self._id(goal)
        self.heuristic = heuristic
        self.km = 0.0
        self.blocked = bytearray(self.rows * self.cols)
        for row, values in enumerate(grid):
            for col, value in enumerate(values):
                self.blocked[self._id(Cell(row, col))] = bool(value)

        if self.blocked[self._start_id] or self.blocked[self._goal_id]:
            raise ValueError("start and goal must be traversable")

        self.g = [inf] * self.cell_count
        self.rhs = [inf] * self.cell_count
        self.rhs[self._goal_id] = 0.0
        self._queue: list[tuple[float, float, int]] = []
        self._open_keys: list[Key | None] = [None] * self.cell_count
        self._push(self._goal_id)

    @property
    def cell_count(self) -> int:
        return self.rows * self.cols

    @property
    def start(self) -> Cell:
        return self._cell(self._start_id)

    @property
    def goal(self) -> Cell:
        return self._cell(self._goal_id)

    def replan(self) -> list[Cell]:
        self.compute_shortest_path()
        return self.extract_path()

    def set_blocked(self, cell: Cell, blocked: bool) -> bool:
        self._validate_cell(cell, "cell")
        cell_id = self._id(cell)
        if cell_id == self._start_id or cell_id == self._goal_id:
            raise ValueError("start and goal cannot be changed")
        if bool(self.blocked[cell_id]) == blocked:
            return False

        self.blocked[cell_id] = blocked
        if blocked:
            self.g[cell_id] = inf
            self.rhs[cell_id] = inf
            self._open_keys[cell_id] = None
        else:
            self._update_vertex(cell_id)

        for neighbor in self._adjacent(cell_id):
            if not self.blocked[neighbor]:
                self._update_vertex(neighbor)
        return True

    def move_start(self, new_start: Cell) -> None:
        self._validate_cell(new_start, "new start")
        new_start_id = self._id(new_start)
        if self.blocked[new_start_id]:
            raise ValueError("new start must be traversable")

        self.km += self._heuristic(self._start_id, new_start_id)
        self._start_id = new_start_id

    def compute_shortest_path(self) -> None:
        start_id = self._start_id
        while (
            self._key_less(self._top_key(), self._calculate_key(start_id))
            or self.rhs[start_id] != self.g[start_id]
        ):
            item = self._pop()
            if item is None:
                return

            old_key, current = item
            new_key = self._calculate_key(current)
            if self._key_less(old_key, new_key):
                self._push(current)
            elif self.g[current] > self.rhs[current]:
                self.g[current] = self.rhs[current]
                for predecessor in self._neighbors(current):
                    self._update_vertex(predecessor)
            else:
                self.g[current] = inf
                self._update_vertex(current)
                for predecessor in self._neighbors(current):
                    self._update_vertex(predecessor)

    def extract_path(self) -> list[Cell]:
        current = self._start_id
        if self.g[current] == inf:
            return []

        path = [self.start]
        for _ in range(self.cell_count):
            if current == self._goal_id:
                return path

            successors = self._neighbors(current)
            if not successors:
                return []

            current = min(successors, key=lambda node: (1.0 + self.g[node], node))
            if self.g[current] == inf:
                return []
            path.append(self._cell(current))

        return []

    def _update_vertex(self, cell_id: int) -> None:
        if self.blocked[cell_id]:
            self._open_keys[cell_id] = None
            return

        if cell_id != self._goal_id:
            self.rhs[cell_id] = min(
                (1.0 + self.g[neighbor] for neighbor in self._neighbors(cell_id)),
                default=inf,
            )

        self._open_keys[cell_id] = None
        if self.g[cell_id] != self.rhs[cell_id]:
            self._push(cell_id)

    def _push(self, cell_id: int) -> None:
        key = self._calculate_key(cell_id)
        self._open_keys[cell_id] = key
        heappush(self._queue, (*key, cell_id))

    def _top_key(self) -> Key:
        while self._queue:
            first, second, cell_id = self._queue[0]
            if self._open_keys[cell_id] == (first, second):
                return first, second
            heappop(self._queue)
        return inf, inf

    def _pop(self) -> tuple[Key, int] | None:
        while self._queue:
            first, second, cell_id = heappop(self._queue)
            if self._open_keys[cell_id] == (first, second):
                self._open_keys[cell_id] = None
                return (first, second), cell_id
        return None

    def _calculate_key(self, cell_id: int) -> Key:
        value = min(self.g[cell_id], self.rhs[cell_id])
        return value + self._heuristic(self._start_id, cell_id) + self.km, value

    def _heuristic(self, left_id: int, right_id: int) -> float:
        left = self._cell(left_id)
        right = self._cell(right_id)
        rows = abs(left.row - right.row)
        cols = abs(left.col - right.col)
        if self.heuristic is Heuristic.EUCLIDEAN:
            return hypot(rows, cols)
        if self.heuristic is Heuristic.CHEBYSHEV:
            return max(rows, cols)
        if self.heuristic is Heuristic.OCTILE:
            return max(rows, cols) + (sqrt(2) - 1) * min(rows, cols)
        return rows + cols

    def _neighbors(self, cell_id: int) -> list[int]:
        return [neighbor for neighbor in self._adjacent(cell_id) if not self.blocked[neighbor]]

    def _adjacent(self, cell_id: int) -> list[int]:
        row, col = divmod(cell_id, self.cols)
        result: list[int] = []
        if row > 0:
            result.append(cell_id - self.cols)
        if col + 1 < self.cols:
            result.append(cell_id + 1)
        if row + 1 < self.rows:
            result.append(cell_id + self.cols)
        if col > 0:
            result.append(cell_id - 1)
        return result

    def _id(self, cell: Cell) -> int:
        return cell.row * self.cols + cell.col

    def _cell(self, cell_id: int) -> Cell:
        return Cell(*divmod(cell_id, self.cols))

    def _validate_cell(self, cell: Cell, name: str) -> None:
        if not (0 <= cell.row < self.rows and 0 <= cell.col < self.cols):
            raise ValueError(f"{name} must be inside the grid")

    @staticmethod
    def _key_less(left: Key, right: Key) -> bool:
        return left < right
