from dataclasses import dataclass


@dataclass(frozen=True)
class FibonacciSearchResult:
    found: bool
    index: int
    insertion_point: int


def fibonacci_lower_bound(values, target, *, key=None):
    key_fn = key or (lambda value: value)
    length = len(values)

    fib_mm2 = 0
    fib_mm1 = 1
    fib_m = 1

    while fib_m < length:
        fib_mm2 = fib_mm1
        fib_mm1 = fib_m
        fib_m = fib_mm2 + fib_mm1

    offset = -1

    while fib_m > 1:
        index = min(offset + fib_mm2, length - 1)

        if key_fn(values[index]) < target:
            fib_m = fib_mm1
            fib_mm1 = fib_mm2
            fib_mm2 = fib_m - fib_mm1
            offset = index
        else:
            fib_m = fib_mm2
            fib_mm1 = fib_mm1 - fib_mm2
            fib_mm2 = fib_m - fib_mm1

    return offset + 1


def fibonacci_search_first(values, target, *, key=None):
    index = fibonacci_lower_bound(values, target, key=key)
    key_fn = key or (lambda value: value)
    found = index < len(values) and key_fn(values[index]) == target

    return FibonacciSearchResult(
        found,
        index if found else -1,
        index
    )
