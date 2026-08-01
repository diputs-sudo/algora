def tournament_sort_in_place(values, *, key=None, reverse=False):
    length = len(values)
    if length < 2:
        return values

    key_fn = key or (lambda value: value)
    keys = [key_fn(value) for value in values]
    size = 1 << (length - 1).bit_length()
    tree = [-1] * (2 * size)

    for index in range(length):
        tree[size + index] = index

    for index in range(size - 1, 0, -1):
        tree[index] = _winner(tree[index * 2], tree[index * 2 + 1], keys, reverse)

    output = []

    for _ in range(length):
        winner = tree[1]
        output.append(values[winner])
        leaf = size + winner
        tree[leaf] = -1
        leaf //= 2

        while leaf:
            tree[leaf] = _winner(tree[leaf * 2], tree[leaf * 2 + 1], keys, reverse)
            leaf //= 2

    values[:] = output
    return values


def _winner(left, right, keys, reverse):
    if left == -1:
        return right
    if right == -1:
        return left

    if reverse:
        return right if keys[left] < keys[right] else left

    return right if keys[right] < keys[left] else left
