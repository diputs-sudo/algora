def bucket_sort(arr, bucket_size=5):
    if not arr:
        return []

    a = arr[:]
    min_val = min(a)
    max_val = max(a)

    bucket_count = (max_val - min_val) // bucket_size + 1
    buckets = [[] for _ in range(bucket_count)]

    for num in a:
        index = (num - min_val) // bucket_size
        buckets[index].append(num)

    result = []
    for bucket in buckets:
        bucket.sort()
        result.extend(bucket)

    return result
