#include <algorithm>
#include <cmath>
#include <vector>

using namespace std;

int jump_search(const vector<int>& arr, int target) {
    int n = static_cast<int>(arr.size());

    if (n == 0) return -1;

    int step = static_cast<int>(sqrt(n));
    if (step < 1) step = 1;

    int previous = 0; 
    int current = 0; 

    while (current < n && arr[current] < target) {
        previous = current; 
        current += step;
    }

    int end = min(current + 1, n);
    for (int i = previous; i < end; i++) {
        if (arr[i] == target) return i;
    }

    return -1;
}
