def _inplace_merge(a, left, mid, right):
    i = left
    j = mid

    while i < j and j < right:
        if a[i] <= a[j]:
            i += 1
        else:
            value = a[j]
            k = j

            while k > i:
                a[k] = a[k - 1]
                k -= 1

            a[i] = value
            i += 1
            j += 1
            mid += 1


def _merge_sort_inplace(a, left, right):
    if right - left <= 1:
        return

    mid = (left + right) // 2
    _merge_sort_inplace(a, left, mid)
    _merge_sort_inplace(a, mid, right)
    _inplace_merge(a, left, mid, right)


def merge_sort_inplace(arr):
    a = arr[:]
    _merge_sort_inplace(a, 0, len(a))
    return a
