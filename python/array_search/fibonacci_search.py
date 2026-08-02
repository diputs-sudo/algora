def fibonacci_search(arr, target):
    n = len(arr)

    if n == 0:
        return -1

    fib_mm2 = 0
    fib_mm1 = 1
    fib_m = fib_mm2 + fib_mm1

    while fib_m < n:
        fib_mm2 = fib_mm1
        fib_mm1 = fib_m
        fib_m = fib_mm2 + fib_mm1

    offset = -1

    while fib_m > 1:
        index = min(offset + fib_mm2, n - 1)

        if arr[index] < target:
            fib_m = fib_mm1
            fib_mm1 = fib_mm2
            fib_mm2 = fib_m - fib_mm1
            offset = index
        elif arr[index] > target:
            fib_m = fib_mm2
            fib_mm1 -= fib_mm2
            fib_mm2 = fib_m - fib_mm1
        else:
            return index

    if fib_mm1 and offset + 1 < n and arr[offset + 1] == target:
        return offset + 1

    return -1
