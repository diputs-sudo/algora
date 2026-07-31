#include <stddef.h>
#include <stdlib.h>
#include <string.h>

typedef int (*merge_inplace_compare_fn)(const void *left, const void *right);

static void swap_bytes(unsigned char *left, unsigned char *right, size_t width, unsigned char *slot) {
    if (left != right) {
        memcpy(slot, left, width);
        memcpy(left, right, width);
        memcpy(right, slot, width);
    }
}

static void reverse_range(unsigned char *items, size_t first, size_t last, size_t width, unsigned char *slot) {
    while (first < last) {
        --last;
        if (first >= last) {
            break;
        }

        swap_bytes(items + first * width, items + last * width, width, slot);
        ++first;
    }
}

static void rotate_range(unsigned char *items, size_t first, size_t mid, size_t last, size_t width, unsigned char *slot) {
    reverse_range(items, first, mid, width, slot);
    reverse_range(items, mid, last, width, slot);
    reverse_range(items, first, last, width, slot);
}

static size_t lower_bound_range(unsigned char *items, size_t first, size_t last, unsigned char *target, size_t width, merge_inplace_compare_fn compare) {
    while (first < last) {
        size_t mid = first + (last - first) / 2;

        if (compare(items + mid * width, target) < 0) {
            first = mid + 1;
        } else {
            last = mid;
        }
    }

    return first;
}

static size_t upper_bound_range(unsigned char *items, size_t first, size_t last, unsigned char *target, size_t width, merge_inplace_compare_fn compare) {
    while (first < last) {
        size_t mid = first + (last - first) / 2;

        if (compare(target, items + mid * width) >= 0) {
            first = mid + 1;
        } else {
            last = mid;
        }
    }

    return first;
}

static void insertion_range(unsigned char *items, size_t first, size_t last, size_t width, merge_inplace_compare_fn compare, unsigned char *slot) {
    for (size_t index = first + 1; index < last; ++index) {
        memcpy(slot, items + index * width, width);
        size_t position = index;

        while (position > first && compare(slot, items + (position - 1) * width) < 0) {
            memcpy(items + position * width, items + (position - 1) * width, width);
            --position;
        }

        memcpy(items + position * width, slot, width);
    }
}

static void merge_range(unsigned char *items, size_t first, size_t mid, size_t last, size_t width, merge_inplace_compare_fn compare, unsigned char *slot, unsigned char *target) {
    if (first >= mid || mid >= last) {
        return;
    }

    if (compare(items + mid * width, items + (mid - 1) * width) >= 0) {
        return;
    }

    if (last - first == 2) {
        if (compare(items + mid * width, items + first * width) < 0) {
            swap_bytes(items + first * width, items + mid * width, width, slot);
        }

        return;
    }

    if (mid - first > last - mid) {
        size_t left_mid = first + (mid - first) / 2;
        memcpy(target, items + left_mid * width, width);
        size_t right_cut = lower_bound_range(items, mid, last, target, width, compare);
        size_t new_mid = left_mid + (right_cut - mid);
        rotate_range(items, left_mid, mid, right_cut, width, slot);
        merge_range(items, first, left_mid, new_mid, width, compare, slot, target);
        merge_range(items, new_mid, right_cut, last, width, compare, slot, target);
    } else {
        size_t right_mid = mid + (last - mid) / 2;
        memcpy(target, items + right_mid * width, width);
        size_t left_cut = upper_bound_range(items, first, mid, target, width, compare);
        size_t new_mid = left_cut + (right_mid - mid);
        rotate_range(items, left_cut, mid, right_mid, width, slot);
        merge_range(items, first, left_cut, new_mid, width, compare, slot, target);
        merge_range(items, new_mid, right_mid, last, width, compare, slot, target);
    }
}

static void sort_range(unsigned char *items, size_t first, size_t last, size_t width, merge_inplace_compare_fn compare, unsigned char *slot, unsigned char *target) {
    if (last - first <= 24) {
        insertion_range(items, first, last, width, compare, slot);
        return;
    }

    size_t mid = first + (last - first) / 2;
    sort_range(items, first, mid, width, compare, slot, target);
    sort_range(items, mid, last, width, compare, slot, target);
    merge_range(items, first, mid, last, width, compare, slot, target);
}

int merge_sort_inplace_in_place(void *base, size_t length, size_t width, merge_inplace_compare_fn compare) {
    if (length < 2) {
        return 0;
    }

    if (base == NULL || width == 0 || compare == NULL) {
        return -1;
    }

    unsigned char *slot = malloc(width);
    unsigned char *target = malloc(width);

    if (slot == NULL || target == NULL) {
        free(slot);
        free(target);
        return -1;
    }

    sort_range(base, 0, length, width, compare, slot, target);

    free(slot);
    free(target);
    return 0;
}
