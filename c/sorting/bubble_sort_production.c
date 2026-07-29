#include <stddef.h>

typedef int (*bubble_compare_fn)(const void *left, const void *right);

static void swap_bytes(unsigned char *left, unsigned char *right, size_t width)
{
    while (width-- > 0) {
        unsigned char temp = *left;
        *left++ = *right;
        *right++ = temp;
    }
}

int bubble_sort_in_place(void *base, size_t length, size_t width, bubble_compare_fn compare)
{
    if (base == NULL || compare == NULL || width == 0) {
        return -1;
    }

    if (length < 2) {
        return 0;
    }

    unsigned char *items = (unsigned char *)base;
    size_t unsorted_end = length - 1;

    while (unsorted_end > 0) {
        size_t last_swap = 0;

        for (size_t index = 0; index < unsorted_end; index++) {
            unsigned char *left = items + index * width;
            unsigned char *right = left + width;

            if (compare(left, right) > 0) {
                swap_bytes(left, right, width);
                last_swap = index;
            }
        }

        if (last_swap == 0) {
            break;
        }

        unsorted_end = last_swap;
    }

    return 0;
}
