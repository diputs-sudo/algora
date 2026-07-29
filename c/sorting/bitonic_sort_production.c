#include <stddef.h>

typedef int (*bitonic_compare_fn)(const void *left, const void *right);

static int is_power_of_two(size_t value)
{
    return value > 0 && (value & (value - 1)) == 0;
}

static void swap_bytes(unsigned char *left, unsigned char *right, size_t width)
{
    while (width-- > 0) {
        unsigned char temp = *left;
        *left++ = *right;
        *right++ = temp;
    }
}

static void compare_and_swap(
    unsigned char *items,
    size_t width,
    size_t left,
    size_t right,
    int ascending,
    bitonic_compare_fn compare
) {
    unsigned char *left_item = items + left * width;
    unsigned char *right_item = items + right * width;
    int order = compare(left_item, right_item);

    if ((ascending && order > 0) || (!ascending && order < 0)) {
        swap_bytes(left_item, right_item, width);
    }
}

static void bitonic_merge(
    unsigned char *items,
    size_t width,
    size_t start,
    size_t count,
    int ascending,
    bitonic_compare_fn compare
) {
    if (count <= 1) {
        return;
    }

    size_t half = count / 2;

    for (size_t index = start; index < start + half; index++) {
        compare_and_swap(items, width, index, index + half, ascending, compare);
    }

    bitonic_merge(items, width, start, half, ascending, compare);
    bitonic_merge(items, width, start + half, half, ascending, compare);
}

static void bitonic_sort_impl(
    unsigned char *items,
    size_t width,
    size_t start,
    size_t count,
    int ascending,
    bitonic_compare_fn compare
) {
    if (count <= 1) {
        return;
    }

    size_t half = count / 2;
    bitonic_sort_impl(items, width, start, half, 1, compare);
    bitonic_sort_impl(items, width, start + half, half, 0, compare);
    bitonic_merge(items, width, start, count, ascending, compare);
}

int bitonic_sort_in_place(void *base, size_t length, size_t width, bitonic_compare_fn compare)
{
    if (base == NULL || compare == NULL || width == 0) {
        return -1;
    }

    if (length < 2) {
        return 0;
    }

    if (!is_power_of_two(length)) {
        return -1;
    }

    bitonic_sort_impl((unsigned char *)base, width, 0, length, 1, compare);
    return 0;
}
