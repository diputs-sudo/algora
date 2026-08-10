from collections.abc import MutableSequence
from random import randrange 


def _partition(values: MutableSequence[int], left: int, right: int, pivot_index: int) -> int:
    pivot = values[pivot_index]
    values[pivot_index], values[right] = values[right], values[pivot_index]
    store = left 

    for scan in range(left, right):
        if values[scan] < pivot: 
            values[store], values[scan] = values[scan], values[store]
            store += 1

    values[store], values[right] = values[right], values[store]
    return store


def quickselect(values: MutableSequence[int], k: int) -> int:
    if not values:
        raise ValueError("values must not be empty")
    if k < 1 or k > len(values):
        raise ValueError("k must be inside the array length")

    left = 0 
    right = len(values) - 1 
    target = k - 1 

    while True: 
        if left == right:
            return values[left]

        pivot_index = randrange(left, right + 1)
        pivot_index = _partition(values, left, right, pivot_index)

        if pivot_index == target:
            return values[pivot_index]
        if pivot_index > target: 
            right = pivot_index - 1 
        else: 
            left = pivot_index + 1 
