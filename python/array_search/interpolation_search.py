def interpolation_search(arr, target):
    if not arr:
        return -1

    low = 0
    high = len(arr) - 1

    while low <= high and arr[low] <= target <= arr[high]:
        if arr[high] == arr[low]:
            return low if arr[low] == target else -1

        position = low + int(
            (target - arr[low]) * (high - low) / (arr[high] - arr[low])
        )

        if arr[position] == target:
            return position
        if arr[position] < target:
            low = position + 1
        else:
            high = position - 1

    return -1
