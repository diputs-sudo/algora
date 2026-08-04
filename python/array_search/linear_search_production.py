from dataclasses import dataclass 


@dataclass(frozen=True)
class LinearSearchResult:
    found: bool 
    index: int 
    inspected: int


def find_first(values, target, *, key=None, start=0, stop=None):
    key_fn = key or (lambda value: value)
    length = len(values)
    end = length if stop is None else min(stop, length)

    if start < 0 or start > length:
        raise ValueError("start must be between 0 and len(values)")

    if end < start: 
        raise ValueError("stop must be greater than or equal to start")

    inspected = 0 

    for index in range(start, end):
        inspected += 1

        if key_fn(values[index]) == target:
            return LinearSearchResult(True, index, inspected)

    return LinearSearchResult(False, -1, inspected)


def find_first_where(values, predicate, *, start=0, stop=None):
    length = len(values)
    end = length if stop is None else min(stop, length)

    if start < 0 or start > length:
        raise ValueError("start must be between 0 and len(values)")

    if end < start: 
        raise ValueError("stop must be greater than or equal to start")

    inspected = 0 

    for index in range(start, end):
        inspected += 1 

        if predicate(values[index]):
            return LinearSearchResult(True, index, inspected)

    return LinearSearchResult(False, -1, inspected)
