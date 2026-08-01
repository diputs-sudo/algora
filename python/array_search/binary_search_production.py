def lower_bound(values, target, *, key=None):
    key_fn = key or (lambda value: value)
    left = 0
    right = len(values)

    while left < right:
        mid = left + (right - left) // 2

        if key_fn(values[mid]) < target:
            left = mid + 1
        else:
            right = mid

    return left


def binary_search_first(values, target, *, key=None):
    index = lower_bound(values, target, key=key)

    if index == len(values):
        return -1

    key_fn = key or (lambda value: value)
    return index if key_fn(values[index]) == target else -1


def binary_search_result(values, target, *, key=None):
    index = lower_bound(values, target, key=key)

    if index == len(values):
        return {
            "found": False,
            "index": -1,
            "insertion_point": index
        }

    key_fn = key or (lambda value: value)
    found = key_fn(values[index]) == target

    return {
        "found": found,
        "index": index if found else -1,
        "insertion_point": index
    }
