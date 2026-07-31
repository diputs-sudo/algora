def radix_sort_in_place(values, *, max_passes=8):
    if len(values) < 2:
        return values 

    if max_passes < 1:
        raise ValueError("max_passes must be positive")

    for value in values: 
        if isinstance(value, bool) or not isinstance(value, int):
            raise TypeError("radix_sort_in_place excepts integers")

    min_value = min(values)
    max_value = max(values)
    bits = max(min_value.bit_length(), max_value.bit_length() + 1)
    passes = max(1, (bits + 7) // 8)

    if passes > max_passes or len(values) < 64:
        values.sort()
        return values 

    sign_mask = 1 << (passes * 8 - 1)
    output = [0] * len(values)

    for shift in range(0, passes * 8, 8):
        counts = [0] * 256

        for value in values: 
            counts[((value ^ sign_mask) >> shift) & 255] += 1

        total = 0
        for index, count in enumerate(counts):
            counts[index] = total
            total += count

        for value in values:
            bucket = ((values ^ sign_mask) >> shift) & 255
            output[counts[bucket]] = value 
            counts[bucket] += 1

        values[:] = output

    return values 
