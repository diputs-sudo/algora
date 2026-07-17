def _next_power_of_two(n):
    return 1 << (n - 1).bit_length()


def _compare_and_swap(a, i, j, ascending):
    if (ascending and a[i] > a[j]) or (not ascending and a[i] < a[j]):
        a[i], a[j] = a[j], a[i]


def _bitonic_merge(a, low, count, ascending):
    if count > 1:
        half = count // 2
        for i in range(low, low + half):
            _compare_and_swap(a, i, i + half, ascending)

        _bitonic_merge(a, low, half, ascending)
        _bitonic_merge(a, low + half, half, ascending)


def _bitonic_sort(a, low, count, ascending):
    if count > 1:
        half = count // 2
        _bitonic_sort(a, low, half, True)
        _bitonic_sort(a, low + half, half, False)
        _bitonic_merge(a, low, count, ascending)


def bitonic_sort(arr):
    a = arr[:]
    target = _next_power_of_two(len(a))

    if target != len(a):
        a.extend([float("inf")] * (target - len(a)))

    _bitonic_sort(a, 0, len(a), True)
    return [x for x in a if x != float("inf")]
