#include <algorithm>
#include <cstdlib>
#include <limits>
#include <queue>
#include <stdexcept>
#include <utility>
#include <vector>

using Cell = std::pair<int, int>;

struct Candidate {
    int f;
    int g;
    int id;

    bool operator>(const Candidate& other) const {
        return f > other.f;
    }
};

std::vector<Cell> aStarPath(
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

    auto heuristic = [target, width](int cell_id) {
        int row = cell_id / width;
        int col = cell_id % width;
        return std::abs(row - target.first) + std::abs(col - target.second);
    };

    const int total = width * height;
    const int infinity = std::numeric_limits<int>::max();
    std::vector<int> distance(total, infinity);
    std::vector<int> parent(total, -1);
    std::vector<bool> closed(total, false);
    std::priority_queue<Candidate, std::vector<Candidate>, std::greater<>> open;

    const int start_id = id(start);
    const int target_id = id(target);
    distance[start_id] = 0;
    open.push({heuristic(start_id), 0, start_id});

    while (!open.empty()) {
        Candidate current = open.top();
        open.pop();
        if (closed[current.id]) {
            continue;
        }
        closed[current.id] = true;

        if (current.id == target_id) {
            std::vector<Cell> path;
            for (int step_id = target_id; step_id != -1; step_id = parent[step_id]) {
                path.push_back({step_id / width, step_id % width});
            }
            std::reverse(path.begin(), path.end());
            return path;
        }

        Cell cell{current.id / width, current.id % width};
        const std::vector<Cell> neighbors = {
            {cell.first - 1, cell.second},
            {cell.first, cell.second + 1},
            {cell.first + 1, cell.second},
            {cell.first, cell.second - 1},
        };

        for (Cell next : neighbors) {
            if (!inside(next) || walls[next.first][next.second]) {
                continue;
            }

            int next_id = id(next);
            if (closed[next_id]) {
                continue;
            }

            int next_distance = current.g + 1;
            if (next_distance >= distance[next_id]) {
                continue;
            }

            distance[next_id] = next_distance;
            parent[next_id] = current.id;
            open.push({next_distance + heuristic(next_id), next_distance, next_id});
        }
    }

    return {};
}
