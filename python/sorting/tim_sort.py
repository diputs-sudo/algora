from .insertion_sort import insertion_sort

MIN_RUN = 5


def _merge(left, right):
    result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])
    return result


def tim_sort(arr):
    a = arr[:]
    n = len(a)

    for start in range(0, n, MIN_RUN):
        end = min(start + MIN_RUN, n)
        a[start:end] = insertion_sort(a[start:end])

    size = MIN_RUN
    while size < n:
        for left in range(0, n, 2 * size):
            mid = min(left + size, n)
            right = min(left + 2 * size, n)
            a[left:right] = _merge(a[left:mid], a[mid:right])

        size *= 2

    return a
