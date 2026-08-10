#include <algorithm>
#include <vector>
using namespace std;

int partition(vector<int>& values, int left, int right) {
    int pivot = values[right];
    int store = left;

    for (int scan = left; scan < right; scan++) {
        if (values[scan] < pivot) {
            swap(values[store], values[scan]);
            store++;
        }
    }

    swap(values[store], values[right]);
    return store;
}

int quickselect(vector<int>& values, int k) {
    int left = 0;
    int right = static_cast<int>(values.size()) - 1;
    int target = k - 1;

    while (left <= right) {
        int pivot_index = partition(values, left, right);

        if (pivot_index == target) {
            return values[pivot_index];
        }
        if (pivot_index > target) {
            right = pivot_index - 1;
        } else {
            left = pivot_index + 1;
        }
    }

    return -1;
}
