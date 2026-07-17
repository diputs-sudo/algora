#include <stdlib.h>

int compare_double(const void *a, const void *b)
{
    double x = *(double *)a;
    double y = *(double *)b;
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
}

double* bucket_sort(double *arr, int n, int bucket_size, int *out_size)
{
    if (n == 0)
    {
        *out_size = 0;
        return NULL;
    }

    double min_val = arr[0], max_val = arr[0];
    for (int i = 1; i < n; i++)
    {
        if (arr[i] < min_val) min_val = arr[i];
        if (arr[i] > max_val) max_val = arr[i];
    }

    int bucket_count = ((int)(max_val - min_val) / bucket_size) + 1;
    double **buckets = malloc(sizeof(double*) * bucket_count);
    int *sizes = calloc(bucket_count, sizeof(int));
    for (int i = 0; i < bucket_count; i++)
        buckets[i] = malloc(sizeof(double) * n);

    for (int i = 0; i < n; i++)
    {
        int index = ((int)(arr[i] - min_val)) / bucket_size;
        buckets[index][sizes[index]++] = arr[i];
    }

    double *result = malloc(sizeof(double) * n);
    int pos = 0;
    for (int i = 0; i < bucket_count; i++)
    {
        qsort(buckets[i], sizes[i], sizeof(double), compare_double);
        for (int j = 0; j < sizes[i]; j++)
            result[pos++] = buckets[i][j];
    }

    *out_size = pos;
    return result;
}
