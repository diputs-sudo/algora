#include <vector>

using namespace std;

void inplace_merge(vector<int>& a, int left, int mid, int right) {
    int i = left;
    int j = mid;
    while (i < j && j < right) {
        if (a[i] <= a[j]) {
            i++;
        } else {
            int value = a[j];
            int k = j;
            while (k > i) {
                a[k] = a[k - 1];
                k--;
            }
            a[i] = value;
            i++;
            j++;
            mid++;
        }
    }
}

void merge_sort_inplace_recursive(vector<int>& a, int left, int right) {
    if (right - left <= 1) return;
    int mid = (left + right) / 2;
    merge_sort_inplace_recursive(a, left, mid);
    merge_sort_inplace_recursive(a, mid, right);
    inplace_merge(a, left, mid, right);
}

vector<int> merge_sort_inplace(const vector<int>& arr) {
    vector<int> a = arr;
    merge_sort_inplace_recursive(a, 0, (int)a.size());
    return a;
}
