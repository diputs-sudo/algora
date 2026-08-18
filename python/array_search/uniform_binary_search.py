def uniform_binary_search(array, target):
    if not array:
        return -1

    largest = 1
    while largest <= len(array) // 2:
        largest *= 2

    base = -1
    step = largest
    while step >= 1:
        probe = base + step
        if probe < len(array):
            if array[probe] == target:
                return probe
            if array[probe] < target:
                base = probe
        step //= 2

    return -1

