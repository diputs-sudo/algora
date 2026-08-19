#include <algorithm>
#include <queue>
#include <utility>
#include <vector>

using Cell = std::pair<int, int>;

std::vector<Cell> bfs(
    int width,
    int height,
    const std::vector<std::vector<bool>>& walls,
    Cell start,
    Cell target
) {
    std::queue<Cell> queue;
    std::vector<std::vector<bool>> visited(height, std::vector<bool>(width, false));
    std::vector<std::vector<Cell>> parent(height, std::vector<Cell>(width, {-1, -1}));

    queue.push(start);
    visited[start.first][start.second] = true;

    while (!queue.empty()) {
        Cell current = queue.front();
        queue.pop();

        if (current == target) {
            std::vector<Cell> path;
            for (Cell step = target; step != Cell{-1, -1}; step = parent[step.first][step.second]) {
                path.push_back(step);
                if (step == start) {
                    break;
                }
            }
            std::reverse(path.begin(), path.end());
            return path;
        }

        const std::vector<Cell> neighbors = {
            {current.first - 1, current.second},
            {current.first, current.second + 1},
            {current.first + 1, current.second},
            {current.first, current.second - 1},
        };

        for (Cell next : neighbors) {
            if (next.first < 0 || next.first >= height || next.second < 0 || next.second >= width) {
                continue;
            }
            if (walls[next.first][next.second] || visited[next.first][next.second]) {
                continue;
            }

            visited[next.first][next.second] = true;
            parent[next.first][next.second] = current;
            queue.push(next);
        }
    }

    return {};
}
