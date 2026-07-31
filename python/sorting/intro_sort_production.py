def intro_sort_in_place(values, *, key=None, reverse=False):
    if len(values) < 2:
        return values

    key_fn = key or (lambda value: value)
    keys = [key_fn(value) for value in values]
    depth_limit = 2 * len(values).bit_length()
    _intro_range(values, keys, 0, len(values), depth_limit, reverse)
    _insertion_range(values, keys, 0, len(values), reverse)
    return values 


def _intro_range(values, keys, low, high, depth_limit, reverse):
    while high - low > 24:
        if depth_limit == 0:
            _heap_range(values, keys, low, high, reverse)
            return 

        depth_limit -= 1
        pivot_key = keys[_median_index(keys, low, low + (high - low) // 2, high - 1, reverse)]
        left, right = _partition(values, keys, low, high, pivot_key, reverse)

        if left - low < high - right: 
            _intro_range(values, keys, low, left, depth_limit, reverse)
            low = right 
        else:
            _intro_range(values, keys, right, high, depth_limit, reverse)
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


def _heap_range(values, keys, low, high, reverse):
    length = high - low

    for start in range(length // 2 - 1, -1, -1):
        _sift_down(values, keys, low, start, length, reverse)

    for end in range(length - 1, 0, -1):
        _swap(values, keys, low, low + end)
        _sift_down(values, keys, low, 0, end, reverse)


def _sift_down(values, keys, offset, start, end, reverse):
    root = start

    while True: 
        child = root * 2 + 1
        if child >= end:
            break 

        if child + 1 < end and _before_key(keys[offset + child], keys[offset + child + 1], reverse):
            child += 1

        if not _before_key(keys[offset + root], keys[offset + child], reverse):
            break 

        _swap(values, keys, offset + root, offset + child)
        root = child


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
