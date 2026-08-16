#include <algorithm>
#include <deque>
#include <stdexcept>
#include <utility>
#include <vector>

using Cell = std::pair<int, int>;

std::vector<Cell> zeroOneBfsPath(
    int width,
    int height,
    const std::vector<std::vector<bool>>& walls,
    const std::vector<std::vector<int>>& weights,
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

    const int total = width * height;
    const int infinity = total + 1;
    std::vector<int> distance(total, infinity);
    std::vector<int> parent(total, -1);
    std::deque<int> deque;

    auto id = [width](Cell cell) {
        return cell.first * width + cell.second;
    };

    const int startId = id(start);
    const int targetId = id(target);
    distance[startId] = 0;
    deque.push_back(startId);

    while (!deque.empty()) {
        const int currentId = deque.front();
        deque.pop_front();
        const Cell current{currentId / width, currentId % width};

        if (currentId == targetId) {
            std::vector<Cell> path;
            for (int stepId = targetId; stepId != -1; stepId = parent[stepId]) {
                path.push_back({stepId / width, stepId % width});
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
            if (!inside(next) || walls[next.first][next.second]) {
                continue;
            }

            const int weight = weights[next.first][next.second];
            if (weight != 0 && weight != 1) {
                throw std::invalid_argument("edge weights must be 0 or 1");
            }

            const int nextId = id(next);
            const int nextDistance = distance[currentId] + weight;
            if (nextDistance >= distance[nextId]) {
                continue;
            }

            distance[nextId] = nextDistance;
            parent[nextId] = currentId;
            if (weight == 0) {
                deque.push_front(nextId);
            } else {
                deque.push_back(nextId);
            }
        }
    }

    return {};
}
