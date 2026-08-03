#include <math.h>
#include <stddef.h>

typedef int (*jump_search_compare_fn)(const void *item, const void *target);

typedef struct {
    int found;
    size_t index; 
    size_t insertion_point;
    size_t block_size;
} jump_search_result;

static const unsigned char *item_at(const void *base, size_t width, size_t index) {
    return (const unsigned char *)base + index * width;
}

static size_t lower_bound_range(
    const void *base,
    size_t width,
    const void *target,
    size_t left,
    size_t right,
    jump_search_compare_fn compare 
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

jump_search_result jump_search_first(
    const void *base,
    size_t length,
    size_t width,
    const void *target,
    jump_search_compare_fn compare,
    size_t block_size 
) {
    jump_search_result result = {0, 0, 0, 0};

    if (base == NULL || width == 0 || target == NULL || compare == NULL) {
        return result;
    }

    if (length == 0) {
        return result;
    }

    size_t step = block_size > 0 ? block_size : (size_t)sqrt((double)length);

    if (step < 1) {
        step = 1;
    }

    size_t left = 0;
    size_t right = step < length ? step : length;

    while (right < length && compare(item_at(base, width, right - 1), target) < 0) {
        left = right; 
        size_t next = right + step;
        right = next < length ? next : length;
    }

    size_t insertion_point = lower_bound_range(base, width, target, left, right, compare);
    result.insertion_point = insertion_point;
    result.block_size = step;

    if (insertion_point < length && compare(item_at(base, width, insertion_point), target) == 0) {
        result.found = 1;
        result.index = insertion_point;
    } 

    return result;
}
