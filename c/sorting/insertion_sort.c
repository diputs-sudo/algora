#include <stdlib.h>

int* insertion_sort(int *arr, int n)
{
    int *a = malloc(sizeof(int) * n);
    for (int i = 0; i < n; i++)
        a[i] = arr[i];

    for (int i = 1; i < n; i++)
    {
        int key = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > key)
        {
            a[j + 1] = a[j];
            j -= 1;
        }
        a[j + 1] = key;
    }
    return a;
}
