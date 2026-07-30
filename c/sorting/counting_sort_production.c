#include <stddef.h>
#include <stdlib.h>

static int compare_int(const void *left, const void *right)
{
    int a = *(const int *)left;
    int b = *(const int *)right;
    return (a > b) - (a < b);
}

int *counting_sort(const int *values, size_t length, size_t max_range, size_t *out_length)
{
    if (out_length == NULL) {
        return NULL;
    }

    *out_length = 0;

    if (values == NULL || max_range == 0) {
        return NULL;
    }

    if (length == 0) {
        return NULL;
    }

    int minimum = values[0];
    int maximum = values[0];

    for (size_t index = 1; index < length; index++) {
        if (values[index] < minimum) {
            minimum = values[index];
        }

        if (values[index] > maximum) {
            maximum = values[index];
        }
    }

    size_t value_range = (size_t)((long long)maximum - (long long)minimum + 1LL);
    int *result = malloc(length * sizeof(int));

    if (result == NULL) {
        return NULL;
    }

    if (value_range > max_range) {
        for (size_t index = 0; index < length; index++) {
            result[index] = values[index];
        }

        qsort(result, length, sizeof(int), compare_int);
        *out_length = length;
        return result;
    }

    size_t *counts = calloc(value_range, sizeof(size_t));

    if (counts == NULL) {
        free(result);
        return NULL;
    }

    for (size_t index = 0; index < length; index++) {
        counts[(size_t)((long long)values[index] - (long long)minimum)] += 1;
    }

    size_t position = 0;

    for (size_t offset = 0; offset < value_range; offset++) {
        int value = minimum + (int)offset;

        for (size_t count = 0; count < counts[offset]; count++) {
            result[position++] = value;
        }
    }

    free(counts);
    *out_length = position;
    return result;
}
