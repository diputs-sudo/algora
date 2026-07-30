from collections.abc import Iterable


def counting_sort(values: Iterable[int], *, max_range: int = 1_000_000) -> list[int]:
    items = list(values)

    if max_range <= 0:
        raise ValueError("max_range must be greater than zero")

    if not items:
        return []

    if any(not isinstance(value, int) for value in items):
        raise TypeError("counting_sort only accepts integers")

    minimum = min(items)
    maximum = max(items)
    value_range = maximum - minimum + 1

    if value_range > max_range:
        return sorted(items)

    counts = [0] * value_range

    for value in items:
        counts[value - minimum] += 1

    result: list[int] = []

    for offset, frequency in enumerate(counts):
        result.extend([minimum + offset] * frequency)

    return result
