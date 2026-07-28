static int _find_peak(int *arr, int n)
{
    int left = 0;
    int right = n - 1;

    while (left < right)
    {
        int mid = left + (right - left) / 2;

        if (arr[mid] < arr[mid + 1]) left = mid + 1;
        else right = mid;
    }

    return left;
}

static int _binary_search_increasing(int *arr, int target, int left, int right)
{
    while (left <= right)
    {
        int mid = left + (right - left) / 2;

        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }

    return -1;
}

static int _binary_search_decreasing(int *arr, int target, int left, int right)
{
    while (left <= right)
    {
        int mid = left + (right - left) / 2;

        if (arr[mid] == target) return mid;
        if (arr[mid] > target) left = mid + 1;
        else right = mid - 1;
    }

    return -1;
}

int bitonic_search(int *arr, int n, int target)
{
    if (n <= 0) return -1;

    int peak = _find_peak(arr, n);
    int index = _binary_search_increasing(arr, target, 0, peak);

    if (index != -1) return index;

    return _binary_search_decreasing(arr, target, peak + 1, n - 1);
}
