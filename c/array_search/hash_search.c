#include <stdlib.h>

static int _hash_index(int value, int capacity)
{
    int index = value % capacity;
    return index < 0 ? index + capacity : index;
}

int hash_search(int *arr, int n, int target)
{
    if (n <= 0) return -1;

    int capacity = n * 2 + 1;
    int *keys = malloc(sizeof(int) * capacity);
    int *values = malloc(sizeof(int) * capacity);
    char *used = calloc(capacity, sizeof(char));

    if (keys == NULL || values == NULL || used == NULL)
    {
        free(keys);
        free(values);
        free(used);
        return -1;
    }

    for (int i = 0; i < n; i++)
    {
        int index = _hash_index(arr[i], capacity);

        while (used[index] && keys[index] != arr[i])
        {
            index = (index + 1) % capacity;
        }

        if (!used[index])
        {
            used[index] = 1;
            keys[index] = arr[i];
            values[index] = i;
        }
    }

    int index = _hash_index(target, capacity);
    while (used[index])
    {
        if (keys[index] == target)
        {
            int result = values[index];
            free(keys);
            free(values);
            free(used);
            return result;
        }

        index = (index + 1) % capacity;
    }

    free(keys);
    free(values);
    free(used);
    return -1;
}
