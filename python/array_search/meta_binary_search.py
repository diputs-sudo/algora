def _highest_power_of_two_below(length):
    bit = 1

    while bit * 2 < length:
        bit *= 2

    return bit


def meta_binary_search(arr, target):
    n = len(arr)

    if n == 0:
        return -1

    position = -1
    bit = _highest_power_of_two_below(n)

    while bit > 0:
        next_index = position + bit

        if next_index < n and arr[next_index] < target:
            position = next_index

        bit //= 2

    candidate = position + 1

    if candidate < n and arr[candidate] == target:
        return candidate

    return -1
