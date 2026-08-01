from dataclasses import dataclass


@dataclass(frozen=True)
class BitonicSearchResult:
    found: bool 
    index: int 
    peak_index: int


def _find_peak(values):
    left = 0 
    right = len(values) - 1

    while left < right: 
        mid = left + (right - left) // 2

        if values[mid] < values[mid + 1]:
            left = mid + 1
        else: 
            right = mid 

    return left


def _binary_search(values, target, left, right, *, ascending):
    while left <= right: 
        mid = left + (right - left) // 2
        value = values[mid]

        if value == target:
            return mid 

        if (value < target) == ascending:
            left = mid + 1
        else: 
            right = mid - 1

    return -1 


def bitonic_search(values, target):
    if not values: 
        return BitonicSearchResult(False, -1, -1)

    peak = _find_peak(values)
    peak_value = values[peak]

    if target == peak_value:
        return BitonicSearchResult(True, peak, peak)

    if target > peak_value:
        return BitonicSearchResult(False, -1, peak)

    if target < values[0] and target < values[-1]:
        return BitonicSearchResult(False, -1, peak) 

    index = _binary_search(values, target, 0, peak - 1, ascending=True)

    if index != -1:
        return BitonicSearchResult(True, index, peak)

    index = _binary_search(values, target, peak + 1, len(values) - 1, ascending=False)
    return BitonicSearchResult(index != -1, index, peak)
