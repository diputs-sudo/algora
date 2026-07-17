#include <vector>

using namespace std;

vector<int> bubble_sort(const vector<int>& arr) {
    vector<int> a = arr;
    int n = (int)a.size();

    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (a[j] > a[j + 1]) {
                swap(a[j], a[j + 1]);
            }
        }
    }
    return a;
}
