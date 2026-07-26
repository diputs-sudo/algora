#include <stdlib.h>

int* insertion_sort(int *arr, int n);
const int MIN_RUN = 5;

static int* merge_runs(int *left, int left_size, int *right, int right_size)
{
    int *result = malloc(sizeof(int) * (left_size + right_size));
    int i = 0, j = 0, k = 0;
    while (i < left_size && j < right_size)
        result[k++] = left[i] <= right[j] ? left[i++] : right[j++];
    while (i < left_size) result[k++] = left[i++];
    while (j < right_size) result[k++] = right[j++];
    return result;
}

int* tim_sort(int *arr, int n)
{
    int *a = malloc(sizeof(int) * n);
    for (int i = 0; i < n; i++) a[i] = arr[i];

    for (int start = 0; start < n; start += MIN_RUN)
    {
        int end = start + MIN_RUN;
        if (end > n) end = n;
        int run_size = end - start;
        int *sorted_run = insertion_sort(a + start, run_size);
        for (int i = 0; i < run_size; i++) a[start + i] = sorted_run[i];
        free(sorted_run);
    }

    int size = MIN_RUN;
    while (size < n)
    {
        for (int left = 0; left < n; left += 2 * size)
        {
            int mid = left + size;
            int right = left + 2 * size;
            if (mid > n) mid = n;
            if (right > n) right = n;
            int left_size = mid - left;
            int right_size = right - mid;
            int *left_part = malloc(sizeof(int) * left_size);
            int *right_part = malloc(sizeof(int) * right_size);
            for (int i = 0; i < left_size; i++) left_part[i] = a[left + i];
            for (int i = 0; i < right_size; i++) right_part[i] = a[mid + i];
            int *merged = merge_runs(left_part, left_size, right_part, right_size);
            for (int i = 0; i < left_size + right_size; i++) a[left + i] = merged[i];
            free(left_part); free(right_part); free(merged);
        }
        size *= 2;
    }
    return a;
}
