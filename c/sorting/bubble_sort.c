#include <stdlib.h>

double* bubble_sort(double *arr, int n)
{
    double *a = malloc(sizeof(double) * n);
    for (int i = 0; i < n; i++)
        a[i] = arr[i];

    for (int i = 0; i < n; i++)
        for (int j = 0; j < n - i - 1; j++)
            if (a[j] > a[j + 1])
            {
                double temp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }

    return a;
}
