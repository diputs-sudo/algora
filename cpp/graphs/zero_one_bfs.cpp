#include <algorithm>
#include <deque>
#include <limits>
#include <utility>
#include <vector>

using Cell = std::pair<int, int>;

std::vector<Cell> zeroOneBfs(
    int width,
    int height,
    const std::vector<std::vector<bool>>& walls,
    const std::vector<std::vector<int>>& weights,
    Cell start,
    Cell target
) {
    const int infinity = std::numeric_limits<int>::max();
    std::vector<std::vector<int>> distance(height, std::vector<int>(width, infinity));
    std::vector<std::vector<Cell>> parent(height, std::vector<Cell>(width, {-1, -1}));
    std::deque<Cell> deque;

    distance[start.first][start.second] = 0;
    deque.push_back(start);

    while (!deque.empty()) {
        Cell current = deque.front();
        deque.pop_front();

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
            if (walls[next.first][next.second]) {
                continue;
            }

            const int weight = weights[next.first][next.second];
            const int nextDistance = distance[current.first][current.second] + weight;
            if (nextDistance >= distance[next.first][next.second]) {
                continue;
            }

            distance[next.first][next.second] = nextDistance;
            parent[next.first][next.second] = current;
            if (weight == 0) {
                deque.push_front(next);
            } else {
                deque.push_back(next);
            }
        }
    }

    return {};
}
