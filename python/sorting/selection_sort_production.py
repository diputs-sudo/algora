def selection_sort_in_place(values, *, key=None, reverse=False):
    if len(values) < 2:
        return values

    key_fn = key or (lambda value: value)
    keys = [key_fn(value) for value in values]
    left = 0
    right = len(values) - 1

    while left < right:
        min_index = left
        max_index = left

        for index in range(left + 1, right + 1):
            if _before(keys[index], keys[min_index], reverse):
                min_index = index
            if _before(keys[max_index], keys[index], reverse):
                max_index = index

        _swap(values, keys, left, min_index)

        if max_index == left:
            max_index = min_index

        _swap(values, keys, right, max_index)
        left += 1
        right -= 1

    return values


def _before(left, right, reverse):
    return left > right if reverse else left < right


def _swap(values, keys, left, right):
    if left != right:
        values[left], values[right] = values[right], values[left]
        keys[left], keys[right] = keys[right], keys[left]
