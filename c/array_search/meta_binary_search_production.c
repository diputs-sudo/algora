#include <stddef.h>

typedef int (*meta_binary_compare_fn)(const void *item, const void *target);

typedef struct {
    int found;
    size_t index;
    size_t insertion_point;
} meta_binary_search_result;

static const unsigned char *item_at(const void *base, size_t width, size_t index) {
    return (const unsigned char *)base + index * width;
}

static size_t highest_power_of_two_below(size_t length) {
    size_t bit = 1;

    while (bit * 2 < length) {
        bit *= 2;
    }

    return bit;
}

size_t meta_binary_lower_bound(
    const void *base,
    size_t length,
    size_t width,
    const void *target,
    meta_binary_compare_fn compare
) {
    if (base == NULL || length == 0 || width == 0 || target == NULL || compare == NULL) {
        return 0;
    }

    size_t position = (size_t)-1;
    size_t bit = highest_power_of_two_below(length);

    while (bit > 0) {
        size_t next = position + bit;

        if (next < length && compare(item_at(base, width, next), target) < 0) {
            position = next;
        }

        bit /= 2;
    }

    return position + 1;
}

meta_binary_search_result meta_binary_search_first(
    const void *base,
    size_t length,
    size_t width,
    const void *target,
    meta_binary_compare_fn compare
) {
    meta_binary_search_result result = {0, 0, 0};
    size_t insertion_point = meta_binary_lower_bound(base, length, width, target, compare);
    result.insertion_point = insertion_point;

    if (base != NULL && target != NULL && compare != NULL && insertion_point < length && compare(item_at(base, width, insertion_point), target) == 0) {
        result.found = 1;
        result.index = insertion_point;
    }

    return result;
}
