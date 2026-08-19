#include <algorithm>
#include <queue>
#include <stdexcept>
#include <utility>
#include <vector>

using Cell = std::pair<int, int>;

std::vector<Cell> bfsPath(
    int width,
    int height,
    const std::vector<std::vector<bool>>& walls,
    Cell start,
    Cell target
) {
    if (width <= 0 || height <= 0) {
        throw std::invalid_argument("grid dimensions must be positive");
    }

    auto inside = [width, height](Cell cell) {
        return cell.first >= 0 && cell.first < height
            && cell.second >= 0 && cell.second < width;
    };

    if (!inside(start) || !inside(target)) {
        throw std::out_of_range("start and target must be inside the grid");
    }

    if (walls[start.first][start.second] || walls[target.first][target.second]) {
        return {};
    }

    auto id = [width](Cell cell) {
        return cell.first * width + cell.second;
    };

    std::queue<int> queue;
    std::vector<bool> visited(width * height, false);
    std::vector<int> parent(width * height, -1);
    const int start_id = id(start);
    const int target_id = id(target);

    queue.push(start_id);
    visited[start_id] = true;

    while (!queue.empty()) {
        int current_id = queue.front();
        queue.pop();
        if (current_id == target_id) {
            std::vector<Cell> path;
            for (int step_id = target_id; step_id != -1; step_id = parent[step_id]) {
                path.push_back({step_id / width, step_id % width});
            }
            std::reverse(path.begin(), path.end());
            return path;
        }

        Cell current{current_id / width, current_id % width};
        const std::vector<Cell> neighbors = {
            {current.first - 1, current.second},
            {current.first, current.second + 1},
            {current.first + 1, current.second},
            {current.first, current.second - 1},
        };

        for (Cell next : neighbors) {
            if (!inside(next) || walls[next.first][next.second]) {
                continue;
            }

            int next_id = id(next);
            if (visited[next_id]) {
                continue;
            }

            visited[next_id] = true;
            parent[next_id] = current_id;
            queue.push(next_id);
        }
    }

    return {};
}
