#include <algorithm>
#include <cstdint>
#include <stdexcept>
#include <utility>
#include <vector>
using namespace std;

using Cell = pair<int, int>;

vector<Cell> dfsGridPath(int width, int height, const vector<Cell>& walls, Cell start, Cell target) {
    if (width <= 0 || height <= 0) {
        throw invalid_argument("grid dimensions must be positive");
    }

    auto inside = [&](Cell cell) {
        return cell.first >= 0 && cell.first < height && cell.second >= 0 && cell.second < width;
    };

    if (!inside(start) || !inside(target)) {
        throw out_of_range("start and target must be inside the grid");
    }

    int total = width * height;
    vector<uint8_t> blocked(total, 0);
    vector<uint8_t> visited(total, 0);
    vector<int> parent(total, -1);
    vector<int> cells;

    for (Cell wall : walls) {
        if (inside(wall)) blocked[wall.first * width + wall.second] = 1;
    }

    int startId = start.first * width + start.second;
    int targetId = target.first * width + target.second;
    if (blocked[startId] || blocked[targetId]) {
        return {};
    }

    cells.push_back(startId);
    visited[startId] = 1;

    while (!cells.empty()) {
        int cellId = cells.back();
        cells.pop_back();
        Cell cell{cellId / width, cellId % width};

        if (cellId == targetId) {
            vector<Cell> path;
            for (int currentId = targetId; currentId != -1; currentId = parent[currentId]) {
                path.push_back({currentId / width, currentId % width});
            }
            reverse(path.begin(), path.end());
            return path;
        }

        Cell neighbors[4] = {
            {cell.first - 1, cell.second},
            {cell.first, cell.second + 1},
            {cell.first + 1, cell.second},
            {cell.first, cell.second - 1}
        };

        for (Cell next : neighbors) {
            if (inside(next)) {
                int nextId = next.first * width + next.second;
                if (!blocked[nextId] && !visited[nextId]) {
                    visited[nextId] = 1;
                    parent[nextId] = cellId;
                    cells.push_back(nextId);
                }
            }
        }
    }

    return {};
}
