#include <stdlib.h>

int* shell_sort(int *arr, int n) 
{
    int *a = malloc(sizeof(int) * n);
    for (int i = 0; i < n; i++) a[i] = arr[i];

    int gap = n / 2;
    while (gap > 0)
    {
        for (int i = gap; i < n; i++)
        {
            int temp = a[i];
            int j = i;
            while (j >= gap && a[j - gap] > temp)
            {
                a[j] = a[j - gap];
                j -= gap;
            }
            a[j] = temp;
        }
        gap /= 2;
    }
    return a;
}
