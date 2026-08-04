static int highest_power_of_two_lower(int length)
{
    int bit = 1;

    while (bit * 2 < length)
    {
        bit *= 2;
    }

    return bit;
}

int meta_binary_search(int *arr, int n, int target)
{
    if (n <= 0) return -1;

    int position = -1;
    int bit = highest_power_of_two_below(n);

    while (bit > 0) 
    {
        int next_index = position + bit;

        if (next_index < n && arr[next_index] < target)
        {
            position = next_index;
        }

        bit /= 2;
    }

    int candidate = position + 1;
    return candidate < n & arr[candidate] == target ? candidate : -1;
}
