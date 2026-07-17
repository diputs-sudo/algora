#include <vector>
#include <algorithm>

using namespace std;

vector<int> bucket_sort(const vector<int>& arr, int bucket_size = 5) {
    if (arr.empty()) return {};

    vector<int> a = arr;
    int min_val = *min_element(a.begin(), a.end());
    int max_val = *max_element(a.begin(), a.end());
    int bucket_count = (max_val - min_val) / bucket_size + 1;

    vector<vector<int>> buckets(bucket_count);
    for (int num : a) {
        int index = (num - min_val) / bucket_size;
        buckets[index].push_back(num);
    }

    vector<int> result;
    for (auto& bucket : buckets) {
        sort(bucket.begin(), bucket.end());
        result.insert(result.end(), bucket.begin(), bucket.end());
    }

    return result;
}
