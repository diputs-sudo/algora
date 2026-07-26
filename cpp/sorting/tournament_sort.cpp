#include <vector>
#include <cmath>
#include <limits>

using namespace std;

struct BuildResult {
    vector<double> tree;
    int offset;
};

BuildResult build_tree(const vector<int>& a) {
    int n = (int)a.size();
    int size = 1 << (int)ceil(log2(n > 0 ? n : 1));
    int offset = size;
    vector<double> tree(2 * size, numeric_limits<double>::infinity());
    for (int i = 0; i < n; ++i) tree[offset + i] = a[i];
    for (int i = offset - 1; i > 0; --i) tree[i] = min(tree[2 * i], tree[2 * i + 1]);
    return {tree, offset};
}

void update_tree(vector<double>& tree, int index) {
    int i = index / 2;
    while (i >= 1) {
        tree[i] = min(tree[2 * i], tree[2 * i + 1]);
        i /= 2;
    }
}

vector<int> tournament_sort(const vector<int>& arr) {
    BuildResult build = build_tree(arr);
    vector<double> tree = build.tree;
    int offset = build.offset;
    vector<int> result;

    for (int t = 0; t < (int)arr.size(); ++t) {
        double winner = tree[1];
        result.push_back((int)winner);
        int i = 1;
        while (i < offset) {
            int left = 2 * i;
            int right = 2 * i + 1;
            i = tree[left] == winner ? left : right;
        }
        tree[i] = numeric_limits<double>::infinity();
        update_tree(tree, i);
    }
    return result;
}
