from dataclasses import dataclass 
from math import isqrt


@dataclass(frozen=True)
class JumpSearchResult: 
    found: bool 
    index: int 
    insertion_point: int 
    block_size: int 


def _lower_bound(values, target, left, right, key):
    while left < right: 
        mid = left + (right - left) // 2

        if key(values[mid]) < target:
            left = mid + 1
        else:
            right = mid 

    return left 


def jump_search_first(values, target, *, key=None, block_size=None):
    key_fn = key or (lambda value: value)
    length = len(values)

    if length == 0: 
        return JumpSearchResult(False, -1, 0, 0) 

    step = block_size or isqrt(length)

    if step < 1: 
        raise ValueError("block_size must be positive")

    left = 0
    right = min(step, length)

    while right < length and key_fn(values[right - 1]) < target:
        left = right 
        right = min(right + step, length)

    insertion_point = _lower_bound(values, target, left, right, key_fn)
    found = insertion_point < length and key_fn(values[insertion_point]) == target

    return JumpSearchResult(
        found,
        insertion_point if found else -1,
        insertion_point,
        step
    )
