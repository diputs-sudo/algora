from collections.abc import Sequence


def _can_ship(weights: Sequence[int], days: int, capacity: int) -> bool:
    used_days = 1
    current_load = 0

    for weight in weights:
        if current_load + weight > capacity:
            used_days += 1
            current_load = 0
            if used_days > days:
                return False
        current_load += weight

    return True


def minimum_ship_capacity(weights: Sequence[int], days: int) -> int:
    if not weights:
        raise ValueError("weights must not be empty")
    if days <= 0:
        raise ValueError("days must be positive")

    low = max(weights)
    high = sum(weights)

    while low < high:
        mid = low + (high - low) // 2

        if _can_ship(weights, days, mid):
            high = mid
        else:
            low = mid + 1

    return low
