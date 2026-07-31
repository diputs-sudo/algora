def quick_sort_in_place(values, *, key=None, reverse=False):
    if len(values) < 2:
        return values

    key_fn = key or (lambda value: value)
    keys = [key_fn(value) for value in values]
    _quick_range(values, keys, 0, len(values), reverse)
    _insertion_range(values, keys, 0, len(values), reverse)
    return values


def _quick_range(values, keys, low, high, reverse):
    while high - low > 24:
        pivot_key = keys[_median_index(keys, low, low + (high - low) // 2, high - 1, reverse)]
        left, right = _partition(values, keys, low, high, pivot_key, reverse)

        if left - low < high - right:
            _quick_range(values, keys, low, left, reverse)
            low = right
        else:
            _quick_range(values, keys, right, high, reverse)
            high = left


def _partition(values, keys, low, high, pivot_key, reverse):
    left = low
    index = low
    right = high

    while index < right:
        if _before_key(keys[index], pivot_key, reverse):
            _swap(values, keys, left, index)
            left += 1
            index += 1
        elif _before_key(pivot_key, keys[index], reverse):
            right -= 1
            _swap(values, keys, index, right)
        else:
            index += 1

    return left, right


def _median_index(keys, left, mid, right, reverse):
    if _before_key(keys[mid], keys[left], reverse):
        left, mid = mid, left
    if _before_key(keys[right], keys[left], reverse):
        left, right = right, left
    if _before_key(keys[right], keys[mid], reverse):
        mid, right = right, mid
    return mid


def _insertion_range(values, keys, low, high, reverse):
    for index in range(low + 1, high):
        current = values[index]
        current_key = keys[index]
        position = index

        while position > low and _before_key(current_key, keys[position - 1], reverse):
            values[position] = values[position - 1]
            keys[position] = keys[position - 1]
            position -= 1

        values[position] = current
        keys[position] = current_key


def _before_key(left, right, reverse):
    return left > right if reverse else left < right


def _swap(values, keys, left, right):
    if left != right:
        values[left], values[right] = values[right], values[left]
        keys[left], keys[right] = keys[right], keys[left]
