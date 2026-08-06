from dataclasses import dataclass 

@dataclass(frozen=True)


class TernarySearchResult: 
    found: bool 
    index: int 
    comparisons: int 


def ternary_search(values, target, *, start=0, stop=None):
    length = len(values)
    end = length if stop is None else stop 

    if start < 0 or start > length or end < start or end > length: 
        raise ValueError("range must satisfy 0 <= start <= stop <= len(values)")

    left = start 
    right = end - 1
    comparisons = 0 

    while left <= right: 
        third = (right - left) // 3
        mid1 = left + third 
        mid2 = right - third 

        comparisons += 1
        if values[mid1] == target: 
            return TernarySearchResult(True, mid1, comparisons)

        if mid2 != mid1: 
            comparisons += 1 
            if values[mid2] == target: 
                return TernarySearchResult(True, mid2, comparisons)

        comparisons += 1
        if target < values[mid1]:
            right = mid1 - 1
            continue

        comparisons += 1
        if target > values[mid2]:
            left = mid2 + 1 
        else: 
            left = mid1 + 1 
            right = mid2 - 1 

    return TernarySearchResult(False, -1, comparisons)
