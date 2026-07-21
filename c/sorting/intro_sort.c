#include <stdlib.h>
#include <math.h>

int* heap_sort(int *arr, int n);
int* insertion_sort(int *arr, int n);

int* _intro_sort(int *a, int n, int max_depth)
{
    if (n <= 16)
        return insertion_sort(a, n);
    if (max_depth == 0)
        return heap_sort(a, n);

    int pivot = a[n / 2];
    int *left = malloc(sizeof(int) * n);
    int *middle = malloc(sizeof(int) * n);
    int *right = malloc(sizeof(int) * n);
    int l = 0, m = 0, r = 0;

    for (int i = 0; i < n; i++)
    {
        if (a[i] < pivot) left[l++] = a[i];
        else if (a[i] == pivot) middle[m++] = a[i];
        else right[r++] = a[i];
    }

    int *sorted_left = _intro_sort(left, l, max_depth - 1);
    int *sorted_right = _intro_sort(right, r, max_depth - 1);
    int *result = malloc(sizeof(int) * n);
    int pos = 0;

    for (int i = 0; i < l; i++) result[pos++] = sorted_left[i];
    for (int i = 0; i < m; i++) result[pos++] = middle[i];
    for (int i = 0; i < r; i++) result[pos++] = sorted_right[i];

    return result;
}

int* intro_sort(int *arr, int n)
{
    int max_depth = 2 * ((int)log2(n) + 1);
    return _intro_sort(arr, n, max_depth);
}
