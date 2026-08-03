from dataclasses import dataclass


@dataclass(frozen=True)
class InterpolationSearchResult:
    found: bool
    index: int
    insertion_point: int


def _lower_bound(values, target, left, right):
    while left < right:
        mid = left + (right - left) // 2

        if values[mid] < target:
            left = mid + 1
        else:
            right = mid

    return left


def interpolation_search_first(values, target):
    length = len(values)
    low = 0
    high = length - 1
    candidate_left = 0

    while low <= high and values[low] <= target <= values[high]:
        if values[low] == values[high]:
            found = values[low] == target
            return InterpolationSearchResult(found, low if found else -1, low)

        numerator = (target - values[low]) * (high - low)
        denominator = values[high] - values[low]
        probe = low + numerator // denominator
        probe = max(low, min(high, probe))
        value = values[probe]

        if value < target:
            low = probe + 1
            candidate_left = low
        else:
            high = probe

            if value == target:
                break

    insertion_point = _lower_bound(values, target, candidate_left, high + 1 if high >= candidate_left else length)
    found = insertion_point < length and values[insertion_point] == target

    return InterpolationSearchResult(
        found,
        insertion_point if found else -1,
        insertion_point
    )
