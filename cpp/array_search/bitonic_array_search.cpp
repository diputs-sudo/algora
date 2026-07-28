#include <vector>

using namespace std;

static int find_peak(const vector<int>& arr) {
    int left = 0;
    int right = static_cast<int>(arr.size()) - 1;

    while (left < right) {
        int mid = left + (right - left) / 2;

        if (arr[mid] < arr[mid + 1]) left = mid + 1;
        else right = mid;
    }

    return left;
}

static int binary_search_increasing(const vector<int>& arr, int target, int left, int right) {
    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }

    return -1;
}

static int binary_search_decreasing(const vector<int>& arr, int target, int left, int right) {
    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (arr[mid] == target) return mid;
        if (arr[mid] > target) left = mid + 1;
        else right = mid - 1;
    }

    return -1;
}

int bitonic_search(const vector<int>& arr, int target) {
    if (arr.empty()) return -1;

    int peak = find_peak(arr);
    int index = binary_search_increasing(arr, target, 0, peak);

    if (index != -1) return index;

    return binary_search_decreasing(arr, target, peak + 1, static_cast<int>(arr.size()) - 1);
}
