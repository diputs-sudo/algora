from dataclasses import dataclass


@dataclass(frozen=True)
class GallopingSearchResult:
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


def galloping_search_first(values, target, *, key=None, start=0):
    key_fn = key or (lambda value: value)
    length = len(values)

    if start < 0 or start > length:
        raise ValueError("start must be between 0 and len(values)")

    if start == length:
        return GallopingSearchResult(False, -1, length, length)

    if key_fn(values[start]) >= target:
        found = key_fn(values[start]) == target
        return GallopingSearchResult(found, start if found else -1, start, start + 1)

    jump = 1

    while start + jump < length and key_fn(values[start + jump]) < target:
        if jump > (length - start) // 2:
            jump = length - start
            break

        jump *= 2

    left = start + jump // 2 + 1
    right = min(start + jump + 1, length)
    insertion_point = _lower_bound(values, target, left, right, key_fn)
    found = insertion_point < length and key_fn(values[insertion_point]) == target

    return GallopingSearchResult(
        found,
        insertion_point if found else -1,
        insertion_point,
        right
    )
