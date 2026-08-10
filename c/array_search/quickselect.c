#include <stddef.h>

static void swap_int(int *left, int *right) {
    int temp = *left;
    *left = *right;
    *right = temp;
}

static size_t partition(int *values, size_t left, size_t right) {
    int pivot = values[right];
    size_t store = left;

    for (size_t scan = left; scan < right; scan++) {
        if (values[scan] < pivot) {
            swap_int(&values[store], &values[scan]);
            store++;
        }
    }

    swap_int(&values[store], &values[right]);
    return store;
}

int quickselect(int *values, size_t length, size_t k) {
    size_t left = 0;
    size_t right = length - 1;
    size_t target = k - 1;

    while (left <= right) {
        size_t pivot_index = partition(values, left, right);

        if (pivot_index == target) {
            return values[pivot_index];
        }
        if (pivot_index > target) {
            right = pivot_index - 1;
        } else {
            left = pivot_index + 1;
        }
    }

    return 0;
}
