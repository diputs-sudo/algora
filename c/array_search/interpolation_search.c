int interpolation_search(int *arr, int n, int target) 
{
    if (n <= 0) return -1;

    int low = 0;
    int high = n - 1;

    while (low <= high && target >= arr[low] && target <= arr[high])
    {
        if (arr[high] == arr[low])
        {
            return arr[low] == target ? low : -1;
        }

        int pos = low + (int)((long long)(target - arr[low]) * (high - low) / (arr[high] - arr[low]));

        if (arr[pos] == target) return pos;
        if (arr[pos] < target) low = pos + 1;
        else high = pos - 1;
    }

    return -1;
}
