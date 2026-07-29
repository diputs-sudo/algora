from collections.abc import Callable, MutableSequence
from typing import Any, TypeVar

T = TypeVar("T")


def bubble_sort_in_place(
    values: MutableSequence[T],
    *,
    key: Callable[[T], Any] | None = None,
    reverse: bool = False,
) -> MutableSequence[T]:
    key_fn = key or (lambda item: item)
    unsorted_end = len(values)

    while unsorted_end > 1:
        last_swap = 0

        for index in range(1, unsorted_end):
            left_key = key_fn(values[index - 1])
            right_key = key_fn(values[index])
            should_swap = left_key < right_key if reverse else left_key > right_key

            if should_swap:
                values[index - 1], values[index] = values[index], values[index - 1]
                last_swap = index

        if last_swap == 0:
            break

        unsorted_end = last_swap

    return values
