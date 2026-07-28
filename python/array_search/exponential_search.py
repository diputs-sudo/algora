def _binary_search_range(arr, target, left, right):
    while left <= right: 
        mid = (left + right) // 2

        if arr[mid] == target:
            return mid
        if arr[mid] < target: 
            left = mid + 1
        else:
            right = mid - 1

    return -1 


def exponential_search(arr, target):
    n = len(arr)

    if n == 0: 
        return -1 
    if arr[0] == target:
        return 0

    bound = 1
    while bound < n and arr[bound] <= target:
        bound *= 2

    return _binary_search_range(arr, target, bound // 2, min(bound, n - 1))
