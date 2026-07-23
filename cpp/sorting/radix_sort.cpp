#include <vector>
#include <algorithm>

using namespace std;

vector<int> radix_sort(const vector<int>& arr) {
    vector<int> a = arr;
    if (a.empty()) return a;

    int max_num = *max_element(a.begin(), a.end());
    int exp = 1;
    while (max_num / exp > 0) {
        vector<vector<int>> buckets(10);
        for (int num : a) {
            int digit = (num / exp) % 10;
            buckets[digit].push_back(num);
        }
        a.clear();
        for (auto& bucket : buckets) {
            a.insert(a.end(), bucket.begin(), bucket.end());
        }
        exp *= 10;
    }
    return a;
}
