def heap_sort(arr):
    a = arr[:]
    n = len(a)

    def heapify(length, i):
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2

        if left < length and a[left] > a[largest]:
            largest = left
        if right < length and a[right] > a[largest]:
            largest = right

        if largest != i:
            a[i], a[largest] = a[largest], a[i]
            heapify(length, largest)

    for i in range(n // 2 - 1, -1, -1):
        heapify(n, i)

    for i in range(n - 1, 0, -1):
        a[0], a[i] = a[i], a[0]
        heapify(i, 0)

    return a
