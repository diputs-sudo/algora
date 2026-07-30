#include <math.h>
#include <stddef.h>
#include <stdlib.h>

static int compare_double(const void *left, const void *right)
{
    double a = *(const double *)left;
    double b = *(const double *)right;
    return (a > b) - (a < b);
}

static void free_buckets(double **buckets, size_t bucket_count)
{
    if (buckets == NULL) {
        return;
    }

    for (size_t bucket = 0; bucket < bucket_count; bucket++) {
        free(buckets[bucket]);
    }

    free(buckets);
}

double *bucket_sort(
    const double *values,
    size_t length,
    double bucket_size,
    size_t max_buckets,
    size_t *out_length
) {
    if (out_length == NULL) {
        return NULL;
    }

    *out_length = 0;

    if (values == NULL || bucket_size <= 0.0 || !isfinite(bucket_size) || max_buckets == 0) {
        return NULL;
    }

    if (length == 0) {
        return NULL;
    }

    double minimum = values[0];
    double maximum = values[0];

    for (size_t index = 0; index < length; index++) {
        if (!isfinite(values[index])) {
            return NULL;
        }

        if (values[index] < minimum) {
            minimum = values[index];
        }

        if (values[index] > maximum) {
            maximum = values[index];
        }
    }

    size_t bucket_count = (size_t)((maximum - minimum) / bucket_size) + 1;
    double *result = malloc(length * sizeof(double));

    if (result == NULL) {
        return NULL;
    }

    if (bucket_count > max_buckets) {
        for (size_t index = 0; index < length; index++) {
            result[index] = values[index];
        }

        qsort(result, length, sizeof(double), compare_double);
        *out_length = length;
        return result;
    }

    double **buckets = calloc(bucket_count, sizeof(double *));
    size_t *sizes = calloc(bucket_count, sizeof(size_t));
    size_t *capacities = calloc(bucket_count, sizeof(size_t));

    if (buckets == NULL || sizes == NULL || capacities == NULL) {
        free(result);
        free(buckets);
        free(sizes);
        free(capacities);
        return NULL;
    }

    for (size_t index = 0; index < length; index++) {
        size_t bucket_index = (size_t)((values[index] - minimum) / bucket_size);

        if (bucket_index >= bucket_count) {
            bucket_index = bucket_count - 1;
        }

        if (sizes[bucket_index] == capacities[bucket_index]) {
            size_t next_capacity = capacities[bucket_index] == 0 ? 4 : capacities[bucket_index] * 2;
            double *next_bucket = realloc(buckets[bucket_index], next_capacity * sizeof(double));

            if (next_bucket == NULL) {
                free(result);
                free_buckets(buckets, bucket_count);
                free(sizes);
                free(capacities);
                return NULL;
            }

            buckets[bucket_index] = next_bucket;
            capacities[bucket_index] = next_capacity;
        }

        buckets[bucket_index] [sizes[bucket_index]++] = values[index];
    }

    size_t position = 0;

    for (size_t bucket = 0; bucket < bucket_count; bucket++) {
        qsort(buckets[bucket], sizes[bucket], sizeof(double), compare_double);

        for (size_t index = 0; index < sizes[bucket]; index++) {
            result[position++] = buckets[bucket][index];
        }
    }

    free_buckets(buckets, bucket_count);
    free(sizes);
    free(capacities);

    *out_length = position;
    return result;
}
