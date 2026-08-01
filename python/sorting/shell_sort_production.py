def shell_sort_in_place(values, *, key=None, reverse=False):
    if len(values) < 2:
        return values

    key_fn = key or (lambda value: value)
    keys = [key_fn(value) for value in values]

    for gap in _ciura_gaps(len(values)):
        for index in range(gap, len(values)):
            current = values[index]
            current_key = keys[index]
            position = index

            while position >= gap:
                candidate_key = keys[position - gap]
                should_shift = candidate_key < current_key if reverse else candidate_key > current_key

                if not should_shift:
                    break

                values[position] = values[position - gap]
                keys[position] = candidate_key
                position -= gap

            values[position] = current
            keys[position] = current_key

    return values


def _ciura_gaps(length):
    gaps = [1, 4, 10, 23, 57, 132, 301, 701, 1750]

    while gaps[-1] < length:
        gaps.append(max(gaps[-1] + 1, int(gaps[-1] * 2.25)))

    for gap in reversed(gaps):
        if gap < length:
            yield gap
