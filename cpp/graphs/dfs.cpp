#include <algorithm>
#include <stack>
#include <utility>
#include <vector>
using namespace std;

using Cell = pair<int, int>;

vector<Cell> dfsGrid(int width, int height, const vector<Cell>& walls, Cell start, Cell target) {
    vector<vector<bool>> blocked(height, vector<bool>(width, false));
    vector<vector<bool>> visited(height, vector<bool>(width, false));
    vector<vector<Cell>> parent(height, vector<Cell>(width, {-1, -1}));
    stack<Cell> cells;

    for (Cell wall : walls) {
        blocked[wall.first][wall.second] = true;
    }

    cells.push(start);

    auto inside = [&](Cell cell) {
        return cell.first >= 0 && cell.first < height && cell.second >= 0 && cell.second < width;
    };

    while (!cells.empty()) {
        Cell cell = cells.top();
        cells.pop();

        if (visited[cell.first][cell.second]) continue;
        visited[cell.first][cell.second] = true;

        if (cell == target) {
            vector<Cell> path;
            for (Cell current = target; current != Cell{-1, -1}; current = parent[current.first][current.second]) {
                path.push_back(current);
                if (current == start) break;
            }
            reverse(path.begin(), path.end());
            return path;
        }

        vector<Cell> neighbors = {
            {cell.first - 1, cell.second},
            {cell.first, cell.second + 1},
            {cell.first + 1, cell.second},
            {cell.first, cell.second - 1}
        };

        for (Cell next : neighbors) {
            if (inside(next) && !blocked[next.first][next.second] && !visited[next.first][next.second]) {
                parent[next.first][next.second] = cell;
                cells.push(next);
            }
        }
    }

    return {};
}
