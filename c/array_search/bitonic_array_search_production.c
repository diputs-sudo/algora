#include <stddef.h>

typedef int (*bitonic_search_compare_fn)(const void *item, const void *target);

typedef struct {
    int found;
    size_t index;
    size_t peak_index;
} bitonic_search_result;

static const unsigned char *item_at(const void *base, size_t width, size_t index) {
    return (const unsigned char *)base + index * width;
}

static size_t find_peak(const void *base, size_t length, size_t width, bitonic_search_compare_fn compare) {
    size_t left = 0;
    size_t right = length - 1;

    while (left < right) {
        size_t mid = left + (right - left) / 2;

        if (compare(item_at(base, width, mid), item_at(base, width, mid + 1)) < 0) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    return left;
}

static size_t directional_binary_search(
    const void *base,
    size_t width,
    const void *target,
    size_t left,
    size_t right,
    bitonic_search_compare_fn compare,
    int ascending,
    int *found
) {
    while (left <= right) {
        size_t mid = left + (right - left) / 2;
        int order = compare(item_at(base, width, mid), target);

        if (order == 0) {
            *found = 1;
            return mid;
        }

        if ((order < 0) == ascending) {
            left = mid + 1;
        } else {
            if (mid == 0) break;
            right = mid - 1;
        }
    }

    *found = 0;
    return 0;
}

bitonic_search_result bitonic_search(
    const void *base,
    size_t length,
    size_t width,
    const void *target,
    bitonic_search_compare_fn compare
) {
    bitonic_search_result result = {0, 0, 0};

    if (base == NULL || length == 0 || width == 0 || target == NULL || compare == NULL) {
        return result;
    }

    size_t peak = find_peak(base, length, width, compare);
    result.peak_index = peak;

    if (compare(item_at(base, width, peak), target) == 0) {
        result.found = 1;
        result.index = peak;
        return result;
    }

    if (compare(item_at(base, width, peak), target) < 0) {
        return result;
    }

    if (compare(target, item_at(base, width, 0)) < 0 && compare(target, item_at(base, width, length - 1)) < 0) {
        return result;
    }

    int found = 0;

    if (peak > 0) {
        size_t index = directional_binary_search(base, width, target, 0, peak - 1, compare, 1, &found);

        if (found) {
            result.found = 1;
            result.index = index;
            return result;
        }
    }

    if (peak + 1 < length) {
        size_t index = directional_binary_search(base, width, target, peak + 1, length - 1, compare, 0, &found);

        if (found) {
            result.found = 1;
            result.index = index;
        }
    }

    return result;
}
