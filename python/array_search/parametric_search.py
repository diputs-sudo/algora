def can_ship(weights, days, capacity):
    used_days = 1
    current_load = 0

    for weight in weights:
        if current_load + weight > capacity:
            used_days += 1
            current_load = 0
        current_load += weight

    return used_days <= days


def parametric_search(weights, days):
    low = max(weights)
    high = sum(weights)

    while low < high:
        mid = (low + high) // 2

        if can_ship(weights, days, mid):
            high = mid
        else:
            low = mid + 1

    return low
