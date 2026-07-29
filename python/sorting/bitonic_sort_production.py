from collections.abc import Callable, MutableSequence
from typing import TypeVar

T = TypeVar("T")


def _is_power_of_two(value: int) -> bool:
    return value > 0 and value & (value - 1) == 0


def _compare_and_swap(
    values: MutableSequence[T],
    left: int,
    right: int,
    ascending: bool,
    key_fn: Callable[[T], object],
) -> None:
    left_key = key_fn(values[left])
    right_key = key_fn(values[right])
    should_swap = right_key < left_key if ascending else left_key < right_key

    if should_swap:
        values[left], values[right] = values[right], values[left]


def _merge(
    values: MutableSequence[T],
    start: int,
    count: int,
    ascending: bool,
    key_fn: Callable[[T], object],
) -> None:
    if count <= 1:
        return

    half = count // 2

    for index in range(start, start + half):
        _compare_and_swap(values, index, index + half, ascending, key_fn)

    _merge(values, start, half, ascending, key_fn)
    _merge(values, start + half, half, ascending, key_fn)


def _sort(
    values: MutableSequence[T],
    start: int,
    count: int,
    ascending: bool,
    key_fn: Callable[[T], object],
) -> None:
    if count <= 1:
        return

    half = count // 2
    _sort(values, start, half, True, key_fn)
    _sort(values, start + half, half, False, key_fn)
    _merge(values, start, count, ascending, key_fn)


def bitonic_sort_in_place(
    values: MutableSequence[T],
    *,
    key: Callable[[T], object] | None = None,
    reverse: bool = False,
) -> MutableSequence[T]:
    if len(values) < 2:
        return values

    if not _is_power_of_two(len(values)):
        raise ValueError("bitonic_sort_in_place requires a power-of-two length")

    key_fn = key or (lambda item: item)
    _sort(values, 0, len(values), not reverse, key_fn)
    return values
