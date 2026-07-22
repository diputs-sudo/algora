#include <stdlib.h>

static void _inplace_merge(int *a, int left, int mid, int right)
{
    int i = left, j = mid;
    while (i < j && j < right)
    {
        if (a[i] <= a[j]) i += 1;
        else
        {
            int value = a[j];
            int k = j;
            while (k > i) { a[k] = a[k - 1]; k -= 1; }
            a[i] = value;
            i += 1; j += 1; mid += 1;
        }
    }
}

static void _merge_sort_inplace(int *a, int left, int right)
{
    if (right - left <= 1) return;
    int mid = (left + right) / 2;
    _merge_sort_inplace(a, left, mid);
    _merge_sort_inplace(a, mid, right);
    _inplace_merge(a, left, mid, right);
}

int* merge_sort_inplace(int *arr, int n)
{
    int *a = malloc(sizeof(int) * n);
    for (int i = 0; i < n; i++) a[i] = arr[i];
    _merge_sort_inplace(a, 0, n);
    return a;
}
