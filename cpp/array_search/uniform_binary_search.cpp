#include <vector>
using namespace std;

int uniform_binary_search(const vector<int>& array, int target) {
    int low = 0;
    int high = static_cast<int>(array.size()) - 1;
    vector<int> steps;

    for (int step = (static_cast<int>(array.size()) + 1) / 2; step >= 1; step /= 2) {
        steps.push_back(step);
    }

    int step_index = 0;
    while (low <= high) {
        int mid = low + (high - low) / 2;

        if (array[mid] == target) return mid;
        if (array[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }

        step_index++;
    }

    return -1;
}
