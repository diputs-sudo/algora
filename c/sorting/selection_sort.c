#include <stdlib.h>

int* selection_sort(int *arr, int n)
{
    int *a = malloc(sizeof(int) * n);
    for (int i = 0; i < n; i++) a[i] = arr[i];

    for (int i = 0; i < n; i++)
    {
        int min_idx = i;
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[min_idx]) min_idx = j;
        if (min_idx != i)
        {
            int temp = a[i];
            a[i] = a[min_idx];
            a[min_idx] = temp;
        }
    }
    return a;
}
