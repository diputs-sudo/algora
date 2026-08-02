int fibonacci_search(int *arr, int n, int target)
{
    if (n <= 0) return -1;

    int fib_mm2 = 0;
    int fib_mm1 = 1;
    int fib_m = fib_mm2 + fib_mm1;

    while (fib_m < n)
    {
        fib_mm2 = fib_mm1;
        fib_mm1 = fib_m;
        fib_m = fib_mm2 + fib_mm1;
    }

    int offset = -1;

    while (fib_m > 1)
    {
        int index = offset + fib_mm2;
        if (index >= n) index = n - 1;

        if (arr[index] < target)
        {
            fib_m = fib_mm1;
            fib_mm1 = fib_mm2;
            fib_mm2 = fib_m - fib_mm1;
            offset = index;
        }
        else if (arr[index] > target)
        {
            fib_m = fib_mm2;
            fib_mm1 = fib_mm1 - fib_mm2;
            fib_mm2 = fib_m - fib_mm1;
        }
        else
        {
            return index;
        }
    }

    if (fib_mm1 && offset + 1 < n && arr[offset + 1] == target)
    {
        return offset + 1;
    }

    return -1;
}
