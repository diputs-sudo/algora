from bisect import bisect_left
from dataclasses import dataclass


@dataclass(frozen=True)
class Entry:
    value: int
    catalog_position: int
    next_position: int


@dataclass(frozen=True)
class CascadingQueryResult:
    positions: tuple[int, ...]
    matches: tuple[bool, ...]


class FractionalCascade:
    def __init__(self, catalogs):
        self.catalogs = tuple(tuple(catalog) for catalog in catalogs)
        self.layers = self._build_layers()

    def _build_layers(self):
        layers = [()] * len(self.catalogs)

        for index in range(len(self.catalogs) - 1, -1, -1):
            catalog = self.catalogs[index]
            next_layer = layers[index + 1] if index + 1 < len(layers) else ()
            sampled_next = next_layer[1::2]
            values = sorted(catalog + tuple(entry.value for entry in sampled_next))

            layers[index] = tuple(
                Entry(
                    value=value,
                    catalog_position=bisect_left(catalog, value),
                    next_position=self._entry_lower_bound(next_layer, value),
                )
                for value in values
            )

        return tuple(layers)

    @staticmethod
    def _entry_lower_bound(layer, target):
        left = 0
        right = len(layer)

        while left < right:
            mid = (left + right) // 2
            if layer[mid].value < target:
                left = mid + 1
            else:
                right = mid

        return left

    @staticmethod
    def _repair_position(layer, position, target):
        while position > 0 and layer[position - 1].value >= target:
            position -= 1

        while position < len(layer) and layer[position].value < target:
            position += 1

        return position

    def query(self, target):
        if not self.layers:
            return CascadingQueryResult((), ())

        positions = []
        matches = []
        position = self._entry_lower_bound(self.layers[0], target)

        for index, catalog in enumerate(self.catalogs):
            layer = self.layers[index]
            position = self._repair_position(layer, position, target)
            catalog_position = len(catalog) if position == len(layer) else layer[position].catalog_position

            positions.append(catalog_position)
            matches.append(catalog_position < len(catalog) and catalog[catalog_position] == target)

            if index + 1 < len(self.layers):
                position = len(self.layers[index + 1]) if position == len(layer) else layer[position].next_position

        return CascadingQueryResult(tuple(positions), tuple(matches))
