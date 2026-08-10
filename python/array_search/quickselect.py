def partition(values, left, right):
    pivot = values[right]
    store = left 

    for scan in range(left, right):
        if values[scan] < pivot:
            values[store], values[scan] = values[scan], values[store]
            store += 1 

    values[store], values[right] = values[right], values[store]
    return store


def quickselect(values, k):
    left = 0 
    right = len(values) - 1 
    target = k - 1

    while left <= right: 
        pivot_index = partition(values, left, right)

        if pivot_index == target: 
            return values[pivot_index]
        if pivot_index > target:
            right = pivot_index - 1
        else: 
            left = pivot_index + 1

    return None
