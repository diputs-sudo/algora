def uniform_binary_search(array, target):
    low = 0
    high = len(array) - 1
    steps = []
    step = (len(array) + 1) // 2

    while step >= 1:
        steps.append(step)
        step //= 2

    step_index = 0
    while low <= high:
        mid = (low + high) // 2

        if array[mid] == target:
            return mid
        if array[mid] < target:
            low = mid + 1
        else:
            high = mid - 1

        step_index += 1

    return -1
