#include <vector>
#include <algorithm>

using namespace std;

vector<int> insertion_sort(const vector<int>& arr);
const int MIN_RUN = 5;

vector<int> merge_runs(const vector<int>& left, const vector<int>& right) {
    vector<int> result;
    int i = 0, j = 0;
    while (i < (int)left.size() && j < (int)right.size()) {
        if (left[i] <= right[j]) result.push_back(left[i++]);
        else result.push_back(right[j++]);
    }
    result.insert(result.end(), left.begin() + i, left.end());
    result.insert(result.end(), right.begin() + j, right.end());
    return result;
}

vector<int> tim_sort(const vector<int>& arr) {
    vector<int> a = arr;
    int n = (int)a.size();
    for (int start = 0; start < n; start += MIN_RUN) {
        int end = min(start + MIN_RUN, n);
        vector<int> run(a.begin() + start, a.begin() + end);
        vector<int> sorted_run = insertion_sort(run);
        copy(sorted_run.begin(), sorted_run.end(), a.begin() + start);
    }

    int size = MIN_RUN;
    while (size < n) {
        for (int left = 0; left < n; left += 2 * size) {
            int mid = min(left + size, n);
            int right = min(left + 2 * size, n);
            vector<int> left_part(a.begin() + left, a.begin() + mid);
            vector<int> right_part(a.begin() + mid, a.begin() + right);
            vector<int> merged = merge_runs(left_part, right_part);
            copy(merged.begin(), merged.end(), a.begin() + left);
        }
        size *= 2;
    }
    return a;
}
