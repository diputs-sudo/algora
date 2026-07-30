from collections.abc import Iterable
from math import isfinite


def bucket_sort(
    values: Iterable[float],
    bucket_size: float = 5.0,
    *,
    max_buckets: int = 10_000,
) -> list[float]:
    items = list(values)

    if bucket_size <= 0 or not isfinite(bucket_size):
        raise ValueError("bucket_size must be finite and greater than zero")

    if max_buckets <= 0:
        raise ValueError("max_buckets must be greater than zero")

    if not items:
        return []

    if any(not isfinite(value) for value in items):
        raise ValueError("bucket_sort only accepts finite numeric values")

    minimum = min(items)
    maximum = max(items)
    bucket_count = int((maximum - minimum) / bucket_size) + 1

    if bucket_count > max_buckets:
        return sorted(items)

    buckets: list[list[float]] = [[] for _ in range(bucket_count)]

    for value in items:
        index = min(int((value - minimum) / bucket_size), bucket_count - 1)
        buckets[index].append(value)

    result: list[float] = []

    for bucket in buckets:
        bucket.sort()
        result.extend(bucket)

    return result
