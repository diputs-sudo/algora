#include <stddef.h>

typedef int (*fibonacci_search_compare_fn)(const void *item, const void *target);

typedef struct {
    int found;
    size_t index;
    size_t insertion_point;
} fibonacci_search_result;

static const unsigned char *item_at(const void *base, size_t width, size_t index) {
    return (const unsigned char *)base + index * width;
}

size_t fibonacci_lower_bound(
    const void *base,
    size_t length,
    size_t width,
    const void *target,
    fibonacci_search_compare_fn compare
) {
    size_t fib_mm2 = 0;
    size_t fib_mm1 = 1;
    size_t fib_m = 1;

    if (base == NULL || width == 0 || target == NULL || compare == NULL) {
        return 0;
    }

    while (fib_m < length) {
        size_t next = fib_mm2 + fib_mm1;

        if (next < fib_m) {
            fib_m = length;
            break;
        }

        fib_mm2 = fib_mm1;
        fib_mm1 = fib_m;
        fib_m = next;
    }

    size_t offset = (size_t)-1;

    while (fib_m > 1) {
        size_t probe = offset + fib_mm2;

        if (probe >= length) {
            probe = length - 1;
        }

        if (compare(item_at(base, width, probe), target) < 0) {
            fib_m = fib_mm1;
            fib_mm1 = fib_mm2;
            fib_mm2 = fib_m - fib_mm1;
            offset = probe;
        } else {
            fib_m = fib_mm2;
            fib_mm1 = fib_mm1 - fib_mm2;
            fib_mm2 = fib_m - fib_mm1;
        }
    }

    return offset + 1;
}

fibonacci_search_result fibonacci_search_first(
    const void *base,
    size_t length,
    size_t width,
    const void *target,
    fibonacci_search_compare_fn compare
) {
    fibonacci_search_result result = {0, 0, 0};

    if (base == NULL || width == 0 || target == NULL || compare == NULL) {
        return result;
    }

    size_t position = fibonacci_lower_bound(base, length, width, target, compare);
    result.insertion_point = position;

    if (position < length && compare(item_at(base, width, position), target) == 0) {
        result.found = 1;
        result.index = position;
    }

    return result;
}
