#include <algorithm>
#include <numeric>
#include <vector>
using namespace std;

bool can_ship(const vector<int>& weights, int days, int capacity) {
    int used_days = 1;
    int current_load = 0;

    for (int weight : weights) {
        if (current_load + weight > capacity) {
            used_days++;
            current_load = 0;
        }
        current_load += weight;
    }

    return used_days <= days;
}

int parametric_search(const vector<int>& weights, int days) {
    int low = *max_element(weights.begin(), weights.end());
    int high = accumulate(weights.begin(), weights.end(), 0);

    while (low < high) {
        int mid = low + (high - low) / 2;

        if (can_ship(weights, days, mid)) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }

    return low;
}
