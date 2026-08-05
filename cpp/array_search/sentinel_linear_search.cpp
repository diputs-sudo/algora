#include <vector>
using namespace std; 

int sentinel_linear_search(vector<int>& array, int target) {
    if (array.empty()) return -1;

    int last_index = static_cast<int>(array.size()) - 1;
    int saved_last = array[last_index];
    array[last_index] = target;

    int index = 0;
    while (array[index] != target) {
        index++;
    }

    array[last_index] = saved_last;

    if (index < last_index || saved_last == target) {
        return index;
    }

    return -1;
}
