#include <algorithm>
#include <numeric>
#include <stdexcept>
#include <vector>
using namespace std;

namespace {
bool can_ship(const vector<int>& weights, int days, int capacity) {
    int used_days = 1;
    int current_load = 0;

    for (int weight : weights) {
        if (current_load + weight > capacity) {
            used_days++;
            current_load = 0;
            if (used_days > days) {
                return false;
            }
        }
        current_load += weight;
    }

    return true;
}
}

int minimum_ship_capacity(const vector<int>& weights, int days) {
    if (weights.empty()) {
        throw invalid_argument("weights must not be empty");
    }
    if (days <= 0) {
        throw invalid_argument("days must be positive");
    }

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
