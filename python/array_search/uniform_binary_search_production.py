from dataclasses import dataclass


@dataclass(frozen=True)
class UniformBinarySearchResult:
    found: bool
    index: int
    comparisons: int


def build_step_table(length):
    if length <= 0:
        return []

    largest = 1
    while largest <= length // 2:
        largest *= 2

    steps = []
    step = largest
    while step >= 1:
        steps.append(step)
        if step == 1:
            break
        step //= 2
    return steps


def uniform_binary_search(values, target, *, start=0, stop=None):
    length = len(values)
    end = length if stop is None else stop

    if start < 0 or start > length or end < start or end > length:
        raise ValueError("range must satisfy 0 <= start <= stop <= len(values)")

    range_length = end - start
    base = -1
    comparisons = 0

    for step in build_step_table(range_length):
        probe = base + step
        if probe >= range_length:
            continue

        index = start + probe
        comparisons += 1

        if values[index] == target:
            return UniformBinarySearchResult(True, index, comparisons)
        if values[index] < target:
            base = probe

    return UniformBinarySearchResult(False, -1, comparisons)

