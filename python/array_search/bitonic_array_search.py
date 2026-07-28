def _find_peak(arr):
    left = 0
    right = len(arr) - 1

    while left < right:
        mid = (left + right) // 2
        if arr[mid] < arr[mid + 1]:
            left = mid + 1
        else:
            right = mid

    return left


def _binary_search_increasing(arr, target, left, right):
    while left <= right:
        mid = (left + right) // 2

        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1


def _binary_search_decreasing(arr, target, left, right):
    while left <= right:
        mid = (left + right) // 2

        if arr[mid] == target:
            return mid
        if arr[mid] > target:
            left = mid + 1
        else:
            right = mid - 1

    return -1


def bitonic_search(arr, target):
    if not arr:
        return -1

    peak = _find_peak(arr)
    index = _binary_search_increasing(arr, target, 0, peak)

    if index != -1:
        return index

    return _binary_search_decreasing(arr, target, peak + 1, len(arr) - 1)
