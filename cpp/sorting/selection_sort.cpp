#include <vector>

using namespace std;

vector<int> selection_sort(const vector<int>& arr) {
    vector<int> a = arr;
    int n = (int)a.size();
    for (int i = 0; i < n; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            if (a[j] < a[min_idx]) min_idx = j;
        }
        if (min_idx != i) swap(a[i], a[min_idx]);
    }
    return a;
}
