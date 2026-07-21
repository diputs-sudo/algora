from .heap_sort import heap_sort
from .insertion_sort import insertion_sort


def intro_sort(arr):
    max_depth = 2 * len(arr).bit_length()
    return _intro_sort(arr[:], max_depth)


def _intro_sort(a, max_depth):
    if len(a) <= 16:
        return insertion_sort(a)

    if max_depth == 0:
        return heap_sort(a)

    pivot = a[len(a) // 2]
    left = [x for x in a if x < pivot]
    middle = [x for x in a if x == pivot]
    right = [x for x in a if x > pivot]

    return _intro_sort(left, max_depth - 1) + middle + _intro_sort(right, max_depth - 1)
