def selection_sort(arr):
    a = arr[:]
    n = len(a)

    for i in range(n):
        min_idx = 1
        for j in range(i + 1, n):
            if a[j] < a[min_idx]:
                min_idx = j

        if min_idx != i:
            a[i], a[min_idx] = a[min_idx], a[i]

    return a
