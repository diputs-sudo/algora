#include <vector>

using namespace std;

vector<int> shell_sort(const vector<int>& arr) {
    vector<int> a = arr;
    int n = (int)a.size();
    int gap = n / 2;
    while (gap > 0) {
        for (int i = gap; i < n; i++) {
            int temp = a[i];
            int j = i;
            while (j >= gap && a[j - gap] > temp) {
                a[j] = a[j - gap];
                j -= gap;
            }
            a[j] = temp;
        }
        gap /= 2;
    }
    return a;
}
