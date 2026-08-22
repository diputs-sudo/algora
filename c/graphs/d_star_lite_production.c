#include <limits.h>
#include <math.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    int row;
    int col;
} DStarPoint;

typedef enum {
    DSTAR_HEURISTIC_MANHATTAN,
    DSTAR_HEURISTIC_EUCLIDEAN,
    DSTAR_HEURISTIC_CHEBYSHEV,
    DSTAR_HEURISTIC_OCTILE,
} DStarHeuristic;

typedef enum {
    DSTAR_OK,
    DSTAR_NO_PATH,
    DSTAR_INVALID_ARGUMENT,
    DSTAR_OUT_OF_MEMORY,
    DSTAR_BLOCKED_ENDPOINT,
    DSTAR_BUFFER_TOO_SMALL,
} DStarStatus;

typedef struct {
    int rows;
    int cols;
    int count;
    DStarPoint start;
    DStarPoint goal;
    DStarHeuristic heuristic;
    double km;
    unsigned char *blocked;
    double *g;
    double *rhs;
    double *key_first;
    double *key_second;
    int *heap;
    int *position;
    int heap_size;
} DStarPlanner;

static bool inside(const DStarPlanner *planner, DStarPoint cell) {
    return cell.row >= 0 && cell.row < planner->rows
        && cell.col >= 0 && cell.col < planner->cols;
}

static bool same_cell(DStarPoint left, DStarPoint right) {
    return left.row == right.row && left.col == right.col;
}

static int cell_id(const DStarPlanner *planner, DStarPoint cell) {
    return cell.row * planner->cols + cell.col;
}

static DStarPoint cell_from_id(const DStarPlanner *planner, int id) {
    return (DStarPoint){id / planner->cols, id % planner->cols};
}

static bool is_blocked(const DStarPlanner *planner, int id) {
    return planner->blocked[id] != 0;
}

static double estimate(const DStarPlanner *planner, DStarPoint left, DStarPoint right) {
    int rows = abs(left.row - right.row);
    int cols = abs(left.col - right.col);

    switch (planner->heuristic) {
        case DSTAR_HEURISTIC_EUCLIDEAN:
            return hypot((double)rows, (double)cols);
        case DSTAR_HEURISTIC_CHEBYSHEV:
            return rows > cols ? rows : cols;
        case DSTAR_HEURISTIC_OCTILE: {
            int maximum = rows > cols ? rows : cols;
            int minimum = rows < cols ? rows : cols;
            return maximum + (sqrt(2.0) - 1.0) * minimum;
        }
        case DSTAR_HEURISTIC_MANHATTAN:
            return rows + cols;
    }
    return rows + cols;
}

static bool key_less(double left_first, double left_second, double right_first, double right_second) {
    return left_first < right_first || (left_first == right_first && left_second < right_second);
}

static void calculate_key(const DStarPlanner *planner, int id, double *first, double *second) {
    double value = planner->g[id] < planner->rhs[id] ? planner->g[id] : planner->rhs[id];
    *first = value + estimate(planner, planner->start, cell_from_id(planner, id)) + planner->km;
    *second = value;
}

static bool heap_less(const DStarPlanner *planner, int left, int right) {
    if (planner->key_first[left] != planner->key_first[right]) {
        return planner->key_first[left] < planner->key_first[right];
    }
    if (planner->key_second[left] != planner->key_second[right]) {
        return planner->key_second[left] < planner->key_second[right];
    }
    return left < right;
}

static void heap_swap(DStarPlanner *planner, int left, int right) {
    int value = planner->heap[left];
    planner->heap[left] = planner->heap[right];
    planner->heap[right] = value;
    planner->position[planner->heap[left]] = left;
    planner->position[planner->heap[right]] = right;
}

static void sift_up(DStarPlanner *planner, int position) {
    while (position > 0) {
        int parent = (position - 1) / 2;
        if (!heap_less(planner, planner->heap[position], planner->heap[parent])) {
            return;
        }
        heap_swap(planner, position, parent);
        position = parent;
    }
}

static void sift_down(DStarPlanner *planner, int position) {
    while (true) {
        int left = position * 2 + 1;
        int right = left + 1;
        int smallest = position;
        if (left < planner->heap_size && heap_less(planner, planner->heap[left], planner->heap[smallest])) {
            smallest = left;
        }
        if (right < planner->heap_size && heap_less(planner, planner->heap[right], planner->heap[smallest])) {
            smallest = right;
        }
        if (smallest == position) {
            return;
        }
        heap_swap(planner, position, smallest);
        position = smallest;
    }
}

static void heap_remove(DStarPlanner *planner, int id) {
    int position = planner->position[id];
    if (position < 0) {
        return;
    }

    int last = planner->heap[--planner->heap_size];
    planner->position[id] = -1;
    if (position == planner->heap_size) {
        return;
    }

    planner->heap[position] = last;
    planner->position[last] = position;
    sift_down(planner, position);
    sift_up(planner, planner->position[last]);
}

static int heap_pop(DStarPlanner *planner) {
    int id = planner->heap[0];
    heap_remove(planner, id);
    return id;
}

static void enqueue(DStarPlanner *planner, int id) {
    heap_remove(planner, id);
    calculate_key(planner, id, &planner->key_first[id], &planner->key_second[id]);
    planner->position[id] = planner->heap_size;
    planner->heap[planner->heap_size++] = id;
    sift_up(planner, planner->position[id]);
}

static int adjacent(const DStarPlanner *planner, int id, int output[4]) {
    DStarPoint cell = cell_from_id(planner, id);
    int count = 0;
    if (cell.row > 0) {
        output[count++] = id - planner->cols;
    }
    if (cell.col + 1 < planner->cols) {
        output[count++] = id + 1;
    }
    if (cell.row + 1 < planner->rows) {
        output[count++] = id + planner->cols;
    }
    if (cell.col > 0) {
        output[count++] = id - 1;
    }
    return count;
}

static void update_vertex(DStarPlanner *planner, int id) {
    if (is_blocked(planner, id)) {
        heap_remove(planner, id);
        return;
    }

    if (id != cell_id(planner, planner->goal)) {
        int neighbors[4];
        int count = adjacent(planner, id, neighbors);
        double best = INFINITY;
        for (int index = 0; index < count; ++index) {
            int neighbor = neighbors[index];
            if (!is_blocked(planner, neighbor) && planner->g[neighbor] + 1.0 < best) {
                best = planner->g[neighbor] + 1.0;
            }
        }
        planner->rhs[id] = best;
    }

    heap_remove(planner, id);
    if (planner->g[id] != planner->rhs[id]) {
        enqueue(planner, id);
    }
}

static void compute_shortest_path(DStarPlanner *planner) {
    int start_id = cell_id(planner, planner->start);
    while (planner->heap_size > 0) {
        int top = planner->heap[0];
        double start_first;
        double start_second;
        calculate_key(planner, start_id, &start_first, &start_second);
        if (!key_less(planner->key_first[top], planner->key_second[top], start_first, start_second)
            && planner->rhs[start_id] == planner->g[start_id]) {
            return;
        }

        double old_first = planner->key_first[top];
        double old_second = planner->key_second[top];
        int current = heap_pop(planner);
        double new_first;
        double new_second;
        calculate_key(planner, current, &new_first, &new_second);

        if (key_less(old_first, old_second, new_first, new_second)) {
            enqueue(planner, current);
            continue;
        }

        int neighbors[4];
        int count = adjacent(planner, current, neighbors);
        if (planner->g[current] > planner->rhs[current]) {
            planner->g[current] = planner->rhs[current];
        } else {
            planner->g[current] = INFINITY;
            update_vertex(planner, current);
        }
        for (int index = 0; index < count; ++index) {
            if (!is_blocked(planner, neighbors[index])) {
                update_vertex(planner, neighbors[index]);
            }
        }
    }
}

void dstar_production_destroy(DStarPlanner *planner) {
    if (!planner) {
        return;
    }
    free(planner->blocked);
    free(planner->g);
    free(planner->rhs);
    free(planner->key_first);
    free(planner->key_second);
    free(planner->heap);
    free(planner->position);
    memset(planner, 0, sizeof(*planner));
}

DStarStatus dstar_production_init(
    DStarPlanner *planner,
    const unsigned char *grid,
    int rows,
    int cols,
    DStarPoint start,
    DStarPoint goal,
    DStarHeuristic heuristic
) {
    if (!planner || !grid || rows <= 0 || cols <= 0 || rows > INT_MAX / cols) {
        return DSTAR_INVALID_ARGUMENT;
    }

    memset(planner, 0, sizeof(*planner));
    planner->rows = rows;
    planner->cols = cols;
    planner->count = rows * cols;
    planner->start = start;
    planner->goal = goal;
    planner->heuristic = heuristic;
    if (!inside(planner, start) || !inside(planner, goal)) {
        return DSTAR_INVALID_ARGUMENT;
    }

    planner->blocked = malloc((size_t)planner->count * sizeof(*planner->blocked));
    planner->g = malloc((size_t)planner->count * sizeof(*planner->g));
    planner->rhs = malloc((size_t)planner->count * sizeof(*planner->rhs));
    planner->key_first = malloc((size_t)planner->count * sizeof(*planner->key_first));
    planner->key_second = malloc((size_t)planner->count * sizeof(*planner->key_second));
    planner->heap = malloc((size_t)planner->count * sizeof(*planner->heap));
    planner->position = malloc((size_t)planner->count * sizeof(*planner->position));
    if (!planner->blocked || !planner->g || !planner->rhs || !planner->key_first
        || !planner->key_second || !planner->heap || !planner->position) {
        dstar_production_destroy(planner);
        return DSTAR_OUT_OF_MEMORY;
    }

    memcpy(planner->blocked, grid, (size_t)planner->count * sizeof(*grid));
    if (is_blocked(planner, cell_id(planner, start)) || is_blocked(planner, cell_id(planner, goal))) {
        dstar_production_destroy(planner);
        return DSTAR_BLOCKED_ENDPOINT;
    }

    for (int id = 0; id < planner->count; ++id) {
        planner->g[id] = INFINITY;
        planner->rhs[id] = INFINITY;
        planner->position[id] = -1;
    }
    planner->rhs[cell_id(planner, goal)] = 0.0;
    enqueue(planner, cell_id(planner, goal));
    return DSTAR_OK;
}

DStarStatus dstar_production_set_blocked(DStarPlanner *planner, DStarPoint cell, bool blocked) {
    if (!planner || !inside(planner, cell)) {
        return DSTAR_INVALID_ARGUMENT;
    }
    if (same_cell(cell, planner->start) || same_cell(cell, planner->goal)) {
        return DSTAR_BLOCKED_ENDPOINT;
    }

    int id = cell_id(planner, cell);
    if (is_blocked(planner, id) == blocked) {
        return DSTAR_OK;
    }

    planner->blocked[id] = (unsigned char)blocked;
    if (blocked) {
        planner->g[id] = INFINITY;
        planner->rhs[id] = INFINITY;
        heap_remove(planner, id);
    } else {
        update_vertex(planner, id);
    }

    int neighbors[4];
    int count = adjacent(planner, id, neighbors);
    for (int index = 0; index < count; ++index) {
        if (!is_blocked(planner, neighbors[index])) {
            update_vertex(planner, neighbors[index]);
        }
    }
    return DSTAR_OK;
}

DStarStatus dstar_production_move_start(DStarPlanner *planner, DStarPoint new_start) {
    if (!planner || !inside(planner, new_start)) {
        return DSTAR_INVALID_ARGUMENT;
    }
    if (is_blocked(planner, cell_id(planner, new_start))) {
        return DSTAR_BLOCKED_ENDPOINT;
    }

    planner->km += estimate(planner, planner->start, new_start);
    planner->start = new_start;
    return DSTAR_OK;
}

DStarStatus dstar_production_replan(
    DStarPlanner *planner,
    DStarPoint *path,
    size_t path_capacity,
    size_t *path_length
) {
    if (!planner || !path || !path_length || path_capacity == 0) {
        return DSTAR_INVALID_ARGUMENT;
    }

    compute_shortest_path(planner);
    int current = cell_id(planner, planner->start);
    if (!isfinite(planner->g[current])) {
        *path_length = 0;
        return DSTAR_NO_PATH;
    }

    size_t length = 0;
    while (current != cell_id(planner, planner->goal)) {
        if (length == path_capacity) {
            *path_length = 0;
            return DSTAR_BUFFER_TOO_SMALL;
        }
        path[length++] = cell_from_id(planner, current);

        int neighbors[4];
        int count = adjacent(planner, current, neighbors);
        int best = -1;
        for (int index = 0; index < count; ++index) {
            int neighbor = neighbors[index];
            if (is_blocked(planner, neighbor)) {
                continue;
            }
            if (best < 0 || planner->g[neighbor] < planner->g[best]
                || (planner->g[neighbor] == planner->g[best] && neighbor < best)) {
                best = neighbor;
            }
        }
        if (best < 0 || !isfinite(planner->g[best])) {
            *path_length = 0;
            return DSTAR_NO_PATH;
        }
        current = best;
    }

    if (length == path_capacity) {
        *path_length = 0;
        return DSTAR_BUFFER_TOO_SMALL;
    }
    path[length++] = planner->goal;
    *path_length = length;
    return DSTAR_OK;
}
