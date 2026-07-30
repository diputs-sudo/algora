#include <stddef.h>

typedef int (*heap_compare_fn)(const void *left, const void *right);

static void swap_bytes(unsigned char *left, unsigned char *right, size_t width)
{
    while (width-- > 0) {
        unsigned char temp = *left;
        *left++ = *right;
        *right++ = temp;
    }
}

static void sift_down(
    unsigned char *items,
    size_t width,
    size_t start,
    size_t end,
    heap_compare_fn compare
) {
    size_t root = start;

    while (1) {
        size_t child = root * 2 + 1;

        if (child >= end) {
            break;
        }

        size_t right = child + 1;
        unsigned char *child_item = items + child * width;

        if (right < end) {
            unsigned char *right_item = items + right * width;

            if (compare(child_item, right_item) < 0) {
                child = right;
                child_item = right_item;
            }
        }

        unsigned char *root_item = items + root * width;

        if (compare(root_item, child_item) >= 0) {
            break;
        }

        swap_bytes(root_item, child_item, width);
        root = child;
    }
}

int heap_sort_in_place(void *base, size_t length, size_t width, heap_compare_fn compare)
{
    if (base == NULL || compare == NULL || width == 0) {
        return -1;
    }

    if (length < 2) {
        return 0;
    }

    unsigned char *items = (unsigned char *)base;

    for (size_t start = length / 2; start > 0; start--) {
        sift_down(items, width, start - 1, length, compare);
    }

    for (size_t end = length - 1; end > 0; end--) {
        swap_bytes(items, items + end * width, width);
        sift_down(items, width, 0, end, compare);
    }

    return 0;
}
