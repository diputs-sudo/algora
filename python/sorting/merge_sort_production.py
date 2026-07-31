def merge_sort_in_place(values, *, key=None, reverse=False):
    length = len(values)
    if length < 2:
        return values

    key_fn = key or (lambda value: value)
    buffer = list(values)
    source = values
    target = buffer
    width = 1

    while width < length:
        for start in range(0, length, width * 2):
            mid = min(start + width, length)
            end = min(start + width * 2, length)
            _merge(source, target, start, mid, end, key_fn, reverse)

        source, target = target, source
        width *= 2

    if source is not values:
        values[:] = source

    return values


def _merge(source, target, start, mid, end, key_fn, reverse):
    left = start
    right = mid
    write = start

    while left < mid and right < end:
        left_key = key_fn(source[left])
        right_key = key_fn(source[right])
        take_right = right_key > left_key if reverse else right_key < left_key

        if take_right:
            target[write] = source[right]
            right += 1
        else:
            target[write] = source[left]
            left += 1

        write += 1

    while left < mid:
        target[write] = source[left]
        left += 1
        write += 1

    while right < end:
        target[write] = source[right]
        right += 1
        write += 1
