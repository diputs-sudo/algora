from bisect import bisect_left
from dataclasses import dataclass

@dataclass(frozen=True)
class CascadingQueryResult:
    positions: tuple[int, ...]
    matches: tuple[bool, ...]


class FractionalCascade:
    def __init__(self, catalogs):
        self.catalogs = tuple(tuple(catalog) for catalog in catalogs)

    def query(self, target):
        if not self.catalogs:
            return CascadingQueryResult((), ())

        positions = []
        matches = []
        position = bisect_left(self.catalogs[0], target)

        for catalog in self.catalogs:
            position = min(position, len(catalog))

            while position > 0 and catalog[position - 1] >= target:
                position -= 1

            while position < len(catalog) and catalog[position] < target:
                position += 1

            positions.append(position)
            matches.append(position < len(catalog) and catalog[position] == target)

        return CascadingQueryResult(tuple(positions), tuple(matches))
