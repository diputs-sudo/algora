#include <vector>
#include <limits>

using namespace std;

int next_power_of_two(int n) {
    return 1 << (32 - __builtin_clz(n - 1));
}

void compare_and_swap(int* a, int i, int j, bool ascending) {
    if ((ascending && a[i] > a[j]) || (!ascending && a[i] < a[j])) {
        int temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
}

void bitonic_merge(vector<int>& a, int low, int cnt, bool ascending) {
    if (cnt > 1) {
        int k = cnt / 2;
        for (int i = low; i < low + k; i++) {
            compare_and_swap(a.data(), i, i + k, ascending);
        }
        bitonic_merge(a, low, k, ascending);
        bitonic_merge(a, low + k, k, ascending);
    }
}

void bitonic_sort_recursive(vector<int>& a, int low, int cnt, bool ascending) {
    if (cnt > 1) {
        int k = cnt / 2;
        bitonic_sort_recursive(a, low, k, true);
        bitonic_sort_recursive(a, low + k, k, false);
        bitonic_merge(a, low, cnt, ascending);
    }
}

vector<int> bitonic_sort(const vector<int>& arr) {
    vector<int> a = arr;
    int target = next_power_of_two((int)a.size());
    if (target != (int)a.size()) {
        a.resize(target, numeric_limits<int>::max());
    }
    bitonic_sort_recursive(a, 0, (int)a.size(), true);

    vector<int> result;
    for (int value : a) {
        if (value != numeric_limits<int>::max()) {
            result.push_back(value);
        }
    }
    return result;
}
