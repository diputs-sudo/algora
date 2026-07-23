def radix_sort(arr):
    a = arr[:]
    if not a:
        return a

    max_num = max(a)
    exp = 1

    while max_num // exp > 0:
        buckets = [[] for _ in range(10)]
        for num in a:
            digit = (num // exp) % 10
            buckets[digit].append(num)

        a = []
        for bucket in buckets:
            a.extend(bucket)

        exp *= 10

    return a
