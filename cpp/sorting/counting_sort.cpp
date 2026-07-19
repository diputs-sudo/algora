#include <vector> 
#include <algorithm>

using namespace std;

vector<int> counting_sort(const vector<int> & arr) {
    if (arr.empty()) return {};

    int max_val = *max_element(arr.begin(), arr.end());
    vector<int> count (max_val + 1, 0);

    for (int num : arr) count [num]++;

    vector<int> result;
    for (int value = 0; value <=max_val; value++) {
        for (int i = 0; i < count[value]; i++) {
            result.push_back(value);
        }
    }

    return result;
}