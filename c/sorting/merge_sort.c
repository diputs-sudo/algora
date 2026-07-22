#include <stdlib.h>

int* merge_sort(int *arr, int n)
{
    if (n <= 1)
    {
        int *result = malloc(sizeof(int) * n);
        for (int i = 0; i < n; i++) result[i] = arr[i];
        return result;
    }

    int mid = n / 2;
    int *left = merge_sort(arr, mid);
    int *right = merge_sort(arr + mid, n - mid);
    int *result = malloc(sizeof(int) * n);
    int i = 0, j = 0, k = 0;

    while (i < mid && j < n - mid)
        result[k++] = left[i] <= right[j] ? left[i++] : right[j++];
    while (i < mid) result[k++] = left[i++];
    while (j < n - mid) result[k++] = right[j++];

    free(left);
    free(right);
    return result;
}
