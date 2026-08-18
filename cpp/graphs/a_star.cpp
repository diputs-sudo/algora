#include <algorithm>
#include <cstdlib>
#include <queue>
#include <unordered_map>
#include <utility>
#include <vector>

using Cell = std::pair<int, int>;

struct Candidate {
    int f;
    int g;
    Cell cell;

    bool operator>(const Candidate& other) const {
        return f > other.f;
    }
};

std::vector<Cell> aStar(
    int width,
    int height,
    const std::vector<std::vector<bool>>& walls,
    Cell start,
    Cell target
) {
    auto id = [width](Cell cell) {
        return cell.first * width + cell.second;
    };

    auto heuristic = [target](Cell cell) {
        return std::abs(cell.first - target.first) + std::abs(cell.second - target.second);
    };

    std::priority_queue<Candidate, std::vector<Candidate>, std::greater<>> open;
    std::unordered_map<int, int> distance;
    std::unordered_map<int, int> parent;
    std::vector<bool> closed(width * height, false);

    distance[id(start)] = 0;
    open.push({heuristic(start), 0, start});

    while (!open.empty()) {
        Candidate current = open.top();
        open.pop();
        int current_id = id(current.cell);

        if (closed[current_id]) {
            continue;
        }
        closed[current_id] = true;

        if (current.cell == target) {
            std::vector<Cell> path;
            for (int step_id = id(target);; step_id = parent[step_id]) {
                path.push_back({step_id / width, step_id % width});
                if (step_id == id(start)) {
                    break;
                }
            }
            std::reverse(path.begin(), path.end());
            return path;
        }

        const std::vector<Cell> neighbors = {
            {current.cell.first - 1, current.cell.second},
            {current.cell.first, current.cell.second + 1},
            {current.cell.first + 1, current.cell.second},
            {current.cell.first, current.cell.second - 1},
        };

        for (Cell next : neighbors) {
            if (next.first < 0 || next.first >= height || next.second < 0 || next.second >= width) {
                continue;
            }
            if (walls[next.first][next.second] || closed[id(next)]) {
                continue;
            }

            int next_id = id(next);
            int next_g = current.g + 1;
            auto known = distance.find(next_id);
            if (known != distance.end() && next_g >= known->second) {
                continue;
            }

            distance[next_id] = next_g;
            parent[next_id] = current_id;
            open.push({next_g + heuristic(next), next_g, next});
        }
    }

    return {};
}
