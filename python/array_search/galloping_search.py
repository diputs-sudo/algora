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


def galloping_search(arr, target):
    n = len(arr)

    if n == 0:
        return -1
    if arr[0] == target:
        return 0

    previous = 0
    jump = 1

    while jump < n and arr[jump] < target:
        previous = jump
        jump *= 2

    left = previous + 1
    right = min(jump, n - 1)

    return _binary_search_range(arr, target, left, right)
