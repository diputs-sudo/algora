static int _binary_search_range(int *arr, int target, int left, int right)
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

int exponential_search(int *arr, int n, int target)
{
    if (n <= 0) return -1;
    if (arr[0] == target) return 0;

    int bound = 1;
    while (bound < n && arr[bound] <= target)
    {
        bound *= 2;
    }

    int right = bound < n ? bound : n - 1;
    return _binary_search_range(arr, target, bound / 2, right);
}
