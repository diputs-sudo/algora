#include <stdlib.h>
#include <math.h>

int _next_power_of_two(int n)
{
    int p = 1;
    while (p < n)
        p <<= 1;
    return p;
}

void _compare_and_swap_plain(double *a, int i, int j, int ascending)
{
    if ((ascending && a[i] > a[j]) || (!ascending && a[i] < a[j]))
    {
        double temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
}

void _bitonic_merge_plain(double *a, int low, int cnt, int ascending)
{
    if (cnt > 1)
    {
        int k = cnt / 2;
        for (int i = low; i < low + k; i++)
            _compare_and_swap_plain(a, i, i + k, ascending);
        _bitonic_merge_plain(a, low, k, ascending);
        _bitonic_merge_plain(a, low + k, k, ascending);
    }
}

void _bitonic_sort_plain(double *a, int low, int cnt, int ascending)
{
    if (cnt > 1)
    {
        int k = cnt / 2;
        _bitonic_sort_plain(a, low, k, 1);
        _bitonic_sort_plain(a, low + k, k, 0);
        _bitonic_merge_plain(a, low, cnt, ascending);
    }
}

double *bitonic_sort(double *arr, int n, int *out_size)
{
    double *a = malloc(sizeof(double) * _next_power_of_two(n));
    for (int i = 0; i < n; i++)
        a[i] = arr[i];

    int target = _next_power_of_two(n);
    for (int i = n; i < target; i++)
        a[i] = INFINITY;

    _bitonic_sort_plain(a, 0, target, 1);

    int new_size = 0;
    for (int i = 0; i < target; i++)
        if (a[i] != INFINITY)
            a[new_size++] = a[i];

    *out_size = new_size;
    return a;
}
