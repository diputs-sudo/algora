from dataclasses import dataclass


@dataclass(frozen=True)
class ExponentialSearchResult:
    found: bool
    index: int
    insertion_point: int
    upper_bound: int


def _lower_bound(values, target, left, right, key):
    while left < right:
        mid = left + (right - left) // 2

        if key(values[mid]) < target:
            left = mid + 1
        else:
            right = mid

    return left


def exponential_search_first(values, target, *, key=None):
    key_fn = key or (lambda value: value)
    length = len(values)

    if length == 0:
        return ExponentialSearchResult(False, -1, 0, 0)

    if key_fn(values[0]) >= target:
        found = key_fn(values[0]) == target
        return ExponentialSearchResult(found, 0 if found else -1, 0, 1)

    bound = 1

    while bound < length and key_fn(values[bound]) < target:
        bound *= 2

    left = bound // 2 + 1
    right = min(bound + 1, length)
    insertion_point = _lower_bound(values, target, left, right, key_fn)
    found = insertion_point < length and key_fn(values[insertion_point]) == target

    return ExponentialSearchResult(
        found,
        insertion_point if found else -1,
        insertion_point,
        right
    )
