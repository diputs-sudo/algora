#include <vector>

using namespace std;

vector<int> quick_sort(const vector<int>& arr) {
    if (arr.size() <= 1) return arr;

    int pivot = arr[arr.size() / 2];
    vector<int> left, middle, right;
    for (int x : arr) {
        if (x < pivot) left.push_back(x);
        else if (x == pivot) middle.push_back(x);
        else right.push_back(x);
    }

    vector<int> result;
    vector<int> sorted_left = quick_sort(left);
    vector<int> sorted_right = quick_sort(right);
    result.insert(result.end(), sorted_left.begin(), sorted_left.end());
    result.insert(result.end(), middle.begin(), middle.end());
    result.insert(result.end(), sorted_right.begin(), sorted_right.end());
    return result;
}
