#include <stdlib.h>
#include <math.h>
#include <float.h>

static int _next_power_of_two(int n)
{
    int size = 1;
    while (size < n) size <<= 1;
    return size;
}

static void _build_tree(double *arr, int n, double *tree, int offset)
{
    for (int i = 0; i < 2 * offset; i++) tree[i] = INFINITY;
    for (int i = 0; i < n; i++) tree[offset + i] = arr[i];
    for (int i = offset - 1; i > 0; i--)
        tree[i] = tree[2 * i] < tree[2 * i + 1] ? tree[2 * i] : tree[2 * i + 1];
}

static void _update_tree(double *tree, int index)
{
    int i = index / 2;
    while (i >= 1)
    {
        tree[i] = tree[2 * i] < tree[2 * i + 1] ? tree[2 * i] : tree[2 * i + 1];
        i /= 2;
    }
}

double* tournament_sort(double *arr, int n)
{
    int offset = _next_power_of_two(n > 0 ? n : 1);
    double *tree = malloc(sizeof(double) * (2 * offset));
    double *result = malloc(sizeof(double) * n);
    _build_tree(arr, n, tree, offset);

    for (int t = 0; t < n; t++)
    {
        double winner = tree[1];
        result[t] = winner;
        int i = 1;
        while (i < offset)
        {
            int left = 2 * i, right = 2 * i + 1;
            i = tree[left] == winner ? left : right;
        }
        tree[i] = INFINITY;
        _update_tree(tree, i);
    }

    free(tree);
    return result;
}
