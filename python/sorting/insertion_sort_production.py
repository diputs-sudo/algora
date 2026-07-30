def binary_insertion_sort_in_place(values, *, key=None, reverse=False):
    key_fn = key or (lambda value: value)

    for index in range(1, len(values)):
        current = values[index]
        current_key = key_fn(current)
        insert_at = _upper_bound(values, current_key, 0, index, key_fn, reverse)

        if insert_at == index:
            continue

        values[insert_at + 1:index + 1] = values[insert_at:index]
        values[insert_at] = current

    return values


def _upper_bound(values, target_key, low, high, key_fn, reverse):
    while low < high:
        mid = low + (high - low) // 2
        mid_key = key_fn(values[mid])

        if mid_key >= target_key if reverse else mid_key <= target_key:
            low = mid + 1
        else:
            high = mid

    return low
