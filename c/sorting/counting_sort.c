#include <stdlib.h>

int* counting_sort(int *arr, int n, int *out_size)
{
    if (n == 0)
    {
        *out_size = 0;
        return NULL;
    }

    int max_val = arr[0];
    for (int i = 1; i < n; i++)
        if (arr[i] > max_val)
            max_val = arr[i];

    int *count = calloc(max_val + 1, sizeof(int));
    for (int i = 0; i < n; i++)
        count[arr[i]] += 1;

    int *result = malloc(sizeof(int) * n);
    int pos = 0;
    for (int value = 0; value <= max_val; value++)
        for (int j = 0; j < count[value]; j++)
            result[pos++] = value;

    *out_size = pos;
    return result;
}
