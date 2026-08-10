#include <algorithm>
#include <random>
#include <stdexcept>
#include <vector>
using namespace std; 

namespace {
    int partition(vector<int>& values, int left, int right, int pivot_index) {
        int pivot = values[pivot_index];
        swap(values[pivot_index], values[right]);
        int store = left;

        for (int scan = left; scan < right; scan++) {
            if (values[scan] < pivot) {
                swap(values[store], values[scan]);
                store++;
            }
        }

        swap(values[store], values[right]);
        return store; 
}
}

int quickselect(vector<int>& values, int k) {
    if (values.empty()) {
        throw invalid_argument("values must not be empty");
    }
    if (k < 1 || k > static_cast<int>(values.size())) {
        throw invalid_argument("k must be inside the array length");
    }

    random_device device; 
    mt19937 generator(device());
    int left = 0;
    int right = static_cast<int>(values.size()) - 1;
    int target = k - 1;

    while (true) {
        if (left == right) {
            return values[left];
        }

        uniform_int_distribution<int> distribution(left, right);
        int pivot_index = partition(values, left, right, distribution(generator));

        if (pivot_index == target) {
            return values[pivot_index];
        }
        if (pivot_index > target) {
            right = pivot_index - 1;
        } else {
            left = pivot_index + 1;
        }
    }
}
