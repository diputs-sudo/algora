from bisect import bisect_left
from dataclasses import dataclass


@dataclass(frozen=True)
class _Entry:
    value: int
    catalog_position: int
    next_position: int


def _entry_lower_bound(layer, target):
    low = 0
    high = len(layer)
    while low < high:
        mid = (low + high) // 2
        if layer[mid].value < target:
            low = mid + 1
        else:
            high = mid
    return low


def _build_layers(catalogs):
    layers = [()] * len(catalogs)

    for index in range(len(catalogs) - 1, -1, -1):
        catalog = catalogs[index]
        next_layer = layers[index + 1] if index + 1 < len(layers) else ()
        values = list(catalog)
        values.extend(entry.value for entry in next_layer[1::2])
        values.sort()

        layers[index] = tuple(
            _Entry(
                value=value,
                catalog_position=bisect_left(catalog, value),
                next_position=_entry_lower_bound(next_layer, value),
            )
            for value in values
        )
    return tuple(layers)


def fractional_cascading(catalogs, target):
    """Return lower-bound positions using sampled bridge layers."""
    if not catalogs:
        return []

    catalogs = tuple(tuple(catalog) for catalog in catalogs)
    layers = _build_layers(catalogs)
    position = _entry_lower_bound(layers[0], target)
    results = []

    for index, catalog in enumerate(catalogs):
        layer = layers[index]
        while position > 0 and layer[position - 1].value >= target:
            position -= 1
        while position < len(layer) and layer[position].value < target:
            position += 1

        results.append(len(catalog) if position == len(layer) else layer[position].catalog_position)

        if index + 1 < len(layers):
            position = len(layers[index + 1]) if position == len(layer) else layer[position].next_position

    return results
