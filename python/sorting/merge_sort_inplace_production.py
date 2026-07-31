def merge_sort_inplace_in_place(values, *, key=None, reverse=False):
    if len(values) < 2:
        return values

    key_fn = key or (lambda value: value)
    _sort_range(values, 0, len(values), key_fn, reverse)
    return values


def _sort_range(values, first, last, key_fn, reverse):
    if last - first <= 24:
        _insertion_range(values, first, last, key_fn, reverse)
        return

    mid = first + (last - first) // 2
    _sort_range(values, first, mid, key_fn, reverse)
    _sort_range(values, mid, last, key_fn, reverse)
    _merge_range(values, first, mid, last, key_fn, reverse)


def _merge_range(values, first, mid, last, key_fn, reverse):
    if first >= mid or mid >= last:
        return

    if not _before_key(key_fn(values[mid]), key_fn(values[mid - 1]), reverse):
        return

    if last - first == 2:
        if _before_key(key_fn(values[mid]), key_fn(values[first]), reverse):
            values[first], values[mid] = values[mid], values[first]
        return

    if mid - first > last - mid:
        left_mid = first + (mid - first) // 2
        right_cut = _lower_bound(values, mid, last, key_fn(values[left_mid]), key_fn, reverse)
        new_mid = left_mid + (right_cut - mid)
        _rotate(values, left_mid, mid, right_cut)
        _merge_range(values, first, left_mid, new_mid, key_fn, reverse)
        _merge_range(values, new_mid, right_cut, last, key_fn, reverse)
    else:
        right_mid = mid + (last - mid) // 2
        left_cut = _upper_bound(values, first, mid, key_fn(values[right_mid]), key_fn, reverse)
        new_mid = left_cut + (right_mid - mid)
        _rotate(values, left_cut, mid, right_mid)
        _merge_range(values, first, left_cut, new_mid, key_fn, reverse)
        _merge_range(values, new_mid, right_mid, last, key_fn, reverse)


def _lower_bound(values, first, last, target_key, key_fn, reverse):
    while first < last:
        mid = first + (last - first) // 2

        if _before_key(key_fn(values[mid]), target_key, reverse):
            first = mid + 1
        else:
            last = mid

    return first


def _upper_bound(values, first, last, target_key, key_fn, reverse):
    while first < last:
        mid = first + (last - first) // 2

        if not _before_key(target_key, key_fn(values[mid]), reverse):
            first = mid + 1
        else:
            last = mid

    return first


def _rotate(values, first, mid, last):
    values[first:last] = values[mid:last] + values[first:mid]


def _insertion_range(values, first, last, key_fn, reverse):
    for index in range(first + 1, last):
        current = values[index]
        current_key = key_fn(current)
        position = index

        while position > first and _before_key(current_key, key_fn(values[position - 1]), reverse):
            values[position] = values[position - 1]
            position -= 1

        values[position] = current


def _before_key(left, right, reverse):
    return left > right if reverse else left < right
