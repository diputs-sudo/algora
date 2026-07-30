#include <stddef.h>
#include <stdlib.h>
#include <string.h>

typedef int (*insertion_compare_fn)(const void *left, const void *right);

static size_t upper_bound(unsigned char *items, const unsigned char *target, size_t low, size_t high, size_t width, insertion_compare_fn compare) {
    while (low < high) {
        size_t mid = low + (high - low) / 2;

        if (compare(items + mid * width, target) <= 0) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }

    return low;
}

int binary_insertion_sort_in_place(void *base, size_t length, size_t width, insertion_compare_fn compare) {
    if (length < 2) {
        return 0;
    }

    if (base == NULL || width == 0 || compare == NULL) {
        return -1;
    }

    unsigned char *items = base;
    unsigned char *current = malloc(width);

    if (current == NULL) {
        return -1;
    }

    for (size_t index = 1; index < length; ++index) {
        memcpy(current, items + index * width, width);
        size_t insert_at = upper_bound(items, current, 0, index, width, compare);

        if (insert_at == index) {
            continue;
        }

        memmove(items + (insert_at + 1) * width, items + insert_at * width, (index - insert_at) * width);
        memcpy(items + insert_at * width, current, width);
    }

    free(current);
    return 0;
}
