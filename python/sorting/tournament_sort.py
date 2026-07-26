def _build_tree(a):
    size = 1 << (len(a) - 1).bit_length()
    offset = size

    tree = [float("inf")] * (2 * size)

    for i, value in enumerate(a):
        tree[offset + i] = value

    for i in range(offset - 1, 0, -1):
        tree[i] = min(tree[2 * i], tree[2 * i + 1])

    return tree, offset


def _update_tree(tree, index):
    i = index // 2
    while i >= 1:
        tree[i] = min(tree[2 * i], tree[2 * i + 1])
        i //= 2


def tournament_sort(arr):
    a = arr[:]
    n = len(a)
    tree, offset = _build_tree(a)

    result = []

    for _ in range(n):
        winner = tree[1]
        result.append(winner)

        i = 1
        while i < offset:
            left = 2 * i
            right = 2 * i + 1
            i = left if tree[left] == winner else right

        tree[i] = float("inf")
        _update_tree(tree, i)

    return result
