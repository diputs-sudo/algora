#include <vector>
#include <cmath>

using namespace std;

vector<int> heap_sort(const vector<int>& arr);
vector<int> insertion_sort(const vector<int>& arr);

vector<int> _intro_sort(vector<int> a, int max_depth) {
    if ((int)a.size() <= 16) return insertion_sort(a);
    if (max_depth == 0) return heap_sort(a);

    int pivot = a[a.size() / 2];
    vector<int> left, middle, right;
    for (int x : a) {
        if (x < pivot) left.push_back(x);
        else if (x == pivot) middle.push_back(x);
        else right.push_back(x);
    }

    vector<int> result;
    vector<int> left_sorted = _intro_sort(left, max_depth - 1);
    vector<int> right_sorted = _intro_sort(right, max_depth - 1);
    result.insert(result.end(), left_sorted.begin(), left_sorted.end());
    result.insert(result.end(), middle.begin(), middle.end());
    result.insert(result.end(), right_sorted.begin(), right_sorted.end());
    return result;
}

vector<int> intro_sort(const vector<int>& arr) {
    int max_depth = 2 * (int)log2(arr.size() > 0 ? arr.size() : 1);
    return _intro_sort(arr, max_depth);
}
