from collections.abc import Callable, MutableSequence
from typing import Any, TypeVar

T = TypeVar("T")


def heap_sort_in_place(
    values: MutableSequence[T],
    *,
    key: Callable[[T], Any] | None = None,
    reverse: bool = False,
) -> MutableSequence[T]:
    key_fn = key or (lambda item: item)
    length = len(values)

    def before(left: T, right: T) -> bool:
        left_key = key_fn(left)
        right_key = key_fn(right)
        return left_key > right_key if reverse else left_key < right_key

    def sift_down(start: int, end: int) -> None:
        root = start

        while True:
            child = root * 2 + 1

            if child >= end:
                break

            right = child + 1

            if right < end and before(values[child], values[right]):
                child = right

            if not before(values[root], values[child]):
                break

            values[root], values[child] = values[child], values[root]
            root = child 

    for start in range(length // 2 - 1, -1, -1):
        sift_down(start, length)

    for end in range(length - 1, 0, -1):
        values[0], values[end] = values[end], values[0]
        sift_down(0, end)

    return values
