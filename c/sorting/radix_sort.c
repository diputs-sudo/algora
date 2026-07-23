#include <stdlib.h>

int* radix_sort(int *arr, int n)
{
    int *a = malloc(sizeof(int) * n);
    for (int i = 0; i < n; i++) a[i] = arr[i];
    if (n == 0) return a;

    int max_num = a[0];
    for (int i = 1; i < n; i++) if (a[i] > max_num) max_num = a[i];
    int exp = 1;

    while (max_num / exp > 0)
    {
        int buckets[10][n];
        int sizes[10] = {0};
        for (int i = 0; i < n; i++)
        {
            int digit = (a[i] / exp) % 10;
            buckets[digit][sizes[digit]++] = a[i];
        }
        int pos = 0;
        for (int i = 0; i < 10; i++)
            for (int j = 0; j < sizes[i]; j++)
                a[pos++] = buckets[i][j];
        exp *= 10;
    }
    return a;
}
