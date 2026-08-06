from dataclasses import dataclass

@dataclass(frozen=True)


class UniformBinarySearchResult:
    found: bool
    index: int
    comparisons: int


def build_step_table(length):
    steps = []
    step = (length + 1) // 2

    while step >= 1:
        steps.append(step)
        step //= 2

    return steps


def uniform_binary_search(values, target, *, start=0, stop=None):
    length = len(values)
    end = length if stop is None else stop

    if start < 0 or start > length or end < start or end > length:
        raise ValueError("range must satisfy 0 <= start <= stop <= len(values)")

    steps = build_step_table(end - start)
    left = start
    right = end - 1
    comparisons = 0

    for _step in steps:
        if left > right:
            break

        mid = left + (right - left) // 2
        comparisons += 1

        if values[mid] == target:
            return UniformBinarySearchResult(True, mid, comparisons)

        if values[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return UniformBinarySearchResult(False, -1, comparisons)
