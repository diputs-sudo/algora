#include <stddef.h>

typedef int (*binary_search_compare_fn)(const void *item, const void *target);

typedef struct {
    int found;
    size_t index;
    size_t insertion_point;
} binary_search_result;

size_t lower_bound_indexed(const void *base, size_t length, size_t width, const void *target, binary_search_compare_fn compare) {
    const unsigned char *items = base;
    size_t left = 0;
    size_t right = length;

    while (left < right) {
        size_t mid = left + (right - left) / 2;

        if (compare(items + mid * width, target) < 0) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    return left;
}

binary_search_result binary_search_first(const void *base, size_t length, size_t width, const void *target, binary_search_compare_fn compare) {
    binary_search_result result = {0, 0, 0};

    if (base == NULL || width == 0 || compare == NULL) {
        return result;
    }

    const unsigned char *items = base;
    size_t position = lower_bound_indexed(base, length, width, target, compare);
    result.insertion_point = position;

    if (position < length && compare(items + position * width, target) == 0) {
        result.found = 1;
        result.index = position;
    }

    return result;
}
