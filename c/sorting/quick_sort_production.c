#include <stddef.h>
#include <stdlib.h>
#include <string.h>

typedef int (*quick_compare_fn)(const void *left, const void *right);

static void swap_bytes(unsigned char *left, unsigned char *right, size_t width, unsigned char *slot) {
    if (left != right) {
        memcpy(slot, left, width);
        memcpy(left, right, width);
        memcpy(right, slot, width);
    }
}

static size_t median_index(unsigned char *items, size_t left, size_t mid, size_t right, size_t width, quick_compare_fn compare) {
    unsigned char *left_item = items + left * width;
    unsigned char *mid_item = items + mid * width;
    unsigned char *right_item = items + right * width;

    if (compare(mid_item, left_item) < 0) {
        size_t temp = left;
        left = mid;
        mid = temp;
        left_item = items + left * width;
        mid_item = items + mid * width;
    }

    if (compare(right_item, left_item) < 0) {
        size_t temp = left;
        left = right;
        right = temp;
        left_item = items + left * width;
        right_item = items + right * width;
    }

    if (compare(right_item, mid_item) < 0) {
        mid = right;
    }

    return mid;
}

static void insertion_range(unsigned char *items, size_t low, size_t high, size_t width, quick_compare_fn compare, unsigned char *slot) {
    for (size_t index = low + 1; index < high; ++index) {
        memcpy(slot, items + index * width, width);
        size_t position = index;

        while (position > low && compare(slot, items + (position - 1) * width) < 0) {
            memcpy(items + position * width, items + (position - 1) * width, width);
            --position;
        }

        memcpy(items + position * width, slot, width);
    }
}

static void quick_range(unsigned char *items, size_t low, size_t high, size_t width, quick_compare_fn compare, unsigned char *slot, unsigned char *pivot) {
    while (high - low > 24) {
        size_t pivot_index = median_index(items, low, low + (high - low) / 2, high - 1, width, compare);
        memcpy(pivot, items + pivot_index * width, width);

        size_t left = low;
        size_t index = low;
        size_t right = high;

        while (index < right) {
            int order = compare(items + index * width, pivot);

            if (order < 0) {
                swap_bytes(items + left * width, items + index * width, width, slot);
                ++left;
                ++index;
            } else if (order > 0) {
                --right;
                swap_bytes(items + index * width, items + right * width, width, slot);
            } else {
                ++index;
            }
        }

        if (left - low < high - right) {
            quick_range(items, low, left, width, compare, slot, pivot);
            low = right;
        } else {
            quick_range(items, right, high, width, compare, slot, pivot);
            high = left;
        }
    }
}

int quick_sort_in_place(void *base, size_t length, size_t width, quick_compare_fn compare) {
    if (length < 2) {
        return 0;
    }

    if (base == NULL || width == 0 || compare == NULL) {
        return -1;
    }

    unsigned char *slot = malloc(width);
    unsigned char *pivot = malloc(width);

    if (slot == NULL || pivot == NULL) {
        free(slot);
        free(pivot);
        return -1;
    }

    unsigned char *items = base;
    quick_range(items, 0, length, width, compare, slot, pivot);
    insertion_range(items, 0, length, width, compare, slot);

    free(slot);
    free(pivot);
    return 0;
}
