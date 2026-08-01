#include <stddef.h>

typedef int (*exponential_search_compare_fn)(const void *item, const void *target);

typedef struct {
    int found;
    size_t index;
    size_t insertion_point;
    size_t upper_bound;
} exponential_search_result;

static const unsigned char *item_at(const void *base, size_t width, size_t index) {
    return (const unsigned char *)base + index * width;
}

static size_t lower_bound_range(
    const void *base,
    size_t width,
    const void *target,
    size_t left,
    size_t right,
    exponential_search_compare_fn compare
) {
    while (left < right) {
        size_t mid = left + (right - left) / 2;

        if (compare(item_at(base, width, mid), target) < 0) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    return left;
}

exponential_search_result exponential_search_first(
    const void *base,
    size_t length,
    size_t width,
    const void *target,
    exponential_search_compare_fn compare
) {
    exponential_search_result result = {0, 0, 0, 0};

    if (base == NULL || width == 0 || target == NULL || compare == NULL) {
        return result;
    }

    if (length == 0) {
        return result;
    }

    if (compare(item_at(base, width, 0), target) >= 0) {
        result.insertion_point = 0;
        result.upper_bound = 1;

        if (compare(item_at(base, width, 0), target) == 0) {
            result.found = 1;
            result.index = 0;
        }

        return result;
    }

    size_t bound = 1;

    while (bound < length && compare(item_at(base, width, bound), target) < 0) {
        if (bound > length / 2) {
            bound = length;
            break;
        }

        bound *= 2;
    }

    size_t left = bound / 2 + 1;
    size_t right = bound + 1 < length ? bound + 1 : length;
    size_t insertion_point = lower_bound_range(base, width, target, left, right, compare);

    result.insertion_point = insertion_point;
    result.upper_bound = right;

    if (insertion_point < length && compare(item_at(base, width, insertion_point), target) == 0) {
        result.found = 1;
        result.index = insertion_point;
    }

    return result;
}
