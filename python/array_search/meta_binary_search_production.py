from dataclasses import dataclass


@dataclass(frozen=True)
class MetaBinarySearchResult:
    found: bool 
    index: int 
    insertion_point: int 


def _highest_power_of_two_below(length):
    bit = 1 

    while bit <= length // 2:
        bit *= 2

    return bit 


def meta_binary_lower_bound(values, target, *, key=None):
    key_fn = key or (lambda value: value)
    length = len(values)

    if length == 0:
        return 0

    position = -1 
    bit = _highest_power_of_two_below(length)

    while bit > 0: 
        next_index = position + bit 

        if next_index < length and key_fn(values[next_index]) < target:
            position = next_index

        bit //= 2

    return position + 1 


def meta_binary_search_first(values, target, *, key=None):
    insertion_point = meta_binary_lower_bound(values, target, key=key)
    key_fn = key or (lambda value: value)
    found = insertion_point < len(values) and key_fn(values[insertion_point]) == target

    return MetaBinarySearchResult(
        found,
        insertion_point if found else -1,
        insertion_point
    )
