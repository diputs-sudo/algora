def counting_sort(arr):
    if not arr:
        return []

    a = arr[:]
    max_val = max(a)

    count = [0] * (max_val + 1)
    for num in a:
        count[num] += 1

    result = []
    for value, freq in enumerate(count):
        for _ in range(freq):
            result.append(value)

    return result
