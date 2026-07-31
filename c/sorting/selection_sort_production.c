#include <stddef.h>
#include <stdlib.h>
#include <string.h>

typedef int (*selection_compare_fn)(const void *left, const void *right);

static void swap_bytes(unsigned char *left, unsigned char *right, size_t width, unsigned char *slot) {
    if (left != right) {
        memcpy(slot, left, width);
        memcpy(left, right, width);
        memcpy(right, slot, width);
    }
}

int selection_sort_in_place(void *base, size_t length, size_t width, selection_compare_fn compare) {
    if (length < 2) {
        return 0;
    }

    if (base == NULL || width == 0 || compare == NULL) {
        return -1;
    }

    unsigned char *items = base;
    unsigned char *slot = malloc(width);

    if (slot == NULL) {
        return -1;
    }

    size_t left = 0;
    size_t right = length - 1;

    while (left < right) {
        size_t min_index = left;
        size_t max_index = left;

        for (size_t index = left + 1; index <= right; ++index) {
            if (compare(items + index * width, items + min_index * width) < 0) {
                min_index = index;
            }

            if (compare(items + max_index * width, items + index * width) < 0) {
                max_index = index;
            }
        }

        swap_bytes(items + left * width, items + min_index * width, width, slot);

        if (max_index == left) {
            max_index = min_index;
        }

        swap_bytes(items + right * width, items + max_index * width, width, slot);
        ++left;
        --right;
    }

    free(slot);
    return 0;
}
