#include <stddef.h>

typedef struct {
    int found;
    size_t index;
    size_t comparisons;
} ternary_search_result;

ternary_search_result ternary_search_range(
    const int *values,
    size_t length,
    int target,
    size_t start,
    size_t stop
) {
    ternary_search_result result = {0, 0, 0};

    if (values == NULL || start > stop || stop > length) {
        return result;
    }

    size_t left = start;
    size_t right = stop;

    while (left < right) {
        size_t width = right - left;
        size_t third = (width - 1) / 3;
        size_t mid1 = left + third;
        size_t mid2 = right - 1 - third;

        result.comparisons += 1;
        if (values[mid1] == target) {
            result.found = 1;
            result.index = mid1;
            return result;
        }

        if (mid2 != mid1) {
            result.comparisons += 1;
            if (values[mid2] == target) {
                result.found = 1;
                result.index = mid2;
                return result;
            }
        }

        result.comparisons += 1;
        if (target < values[mid1]) {
            right = mid1;
            continue;
        }

        result.comparisons += 1;
        if (target > values[mid2]) {
            left = mid2 + 1;
        } else {
            left = mid1 + 1;
            right = mid2;
        }
    }

    return result;
}

ternary_search_result ternary_search_all(const int *values, size_t length, int target) {
    return ternary_search_range(values, length, target, 0, length);
}
