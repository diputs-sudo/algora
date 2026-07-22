#include <stdlib.h>

int* quick_sort(int *arr, int n)
{
    if (n <= 1)
    {
        int *result = malloc(sizeof(int) * n);
        for (int i = 0; i < n; i++) result[i] = arr[i];
        return result;
    }

    int pivot = arr[n / 2];
    int *left = malloc(sizeof(int) * n);
    int *middle = malloc(sizeof(int) * n);
    int *right = malloc(sizeof(int) * n);
    int l = 0, m = 0, r = 0;

    for (int i = 0; i < n; i++)
    {
        if (arr[i] < pivot) left[l++] = arr[i];
        else if (arr[i] == pivot) middle[m++] = arr[i];
        else right[r++] = arr[i];
    }

    int *sorted_left = quick_sort(left, l);
    int *sorted_right = quick_sort(right, r);
    int *result = malloc(sizeof(int) * n);
    int pos = 0;
    for (int i = 0; i < l; i++) result[pos++] = sorted_left[i];
    for (int i = 0; i < m; i++) result[pos++] = middle[i];
    for (int i = 0; i < r; i++) result[pos++] = sorted_right[i];

    free(left); free(middle); free(right); free(sorted_left); free(sorted_right);
    return result;
}
