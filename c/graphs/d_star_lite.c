#include <math.h>
#include <stdbool.h>
#include <stddef.h>
#include <limits.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    int row;
    int col;
} DStarPoint;

typedef enum {
    DSTAR_MANHATTAN,
    DSTAR_EUCLIDEAN,
    DSTAR_CHEBYSHEV,
    DSTAR_OCTILE,
} DStarHeuristic;

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
} DStarLite;

void dstar_lite_destroy(DStarLite *planner);

static bool dstar_inside(const DStarLite *planner, DStarPoint cell) {
    return cell.row >= 0 && cell.row < planner->rows
        && cell.col >= 0 && cell.col < planner->cols;
}

static int dstar_id(const DStarLite *planner, DStarPoint cell) {
    return cell.row * planner->cols + cell.col;
}

static DStarPoint dstar_point(const DStarLite *planner, int cell_id) {
    return (DStarPoint){cell_id / planner->cols, cell_id % planner->cols};
}

static bool dstar_same_point(DStarPoint left, DStarPoint right) {
    return left.row == right.row && left.col == right.col;
}

static bool dstar_blocked(const DStarLite *planner, int cell_id) {
    return planner->blocked[cell_id] != 0;
}

static double dstar_estimate(const DStarLite *planner, DStarPoint left, DStarPoint right) {
    int rows = abs(left.row - right.row);
    int cols = abs(left.col - right.col);

    if (planner->heuristic == DSTAR_EUCLIDEAN) {
        return hypot((double)rows, (double)cols);
    }
    if (planner->heuristic == DSTAR_CHEBYSHEV) {
        return rows > cols ? rows : cols;
    }
    if (planner->heuristic == DSTAR_OCTILE) {
        int maximum = rows > cols ? rows : cols;
        int minimum = rows < cols ? rows : cols;
        return maximum + (sqrt(2.0) - 1.0) * minimum;
    }
    return rows + cols;
}

static bool dstar_key_less(double left_first, double left_second, double right_first, double right_second) {
    return left_first < right_first || (left_first == right_first && left_second < right_second);
}

static void dstar_calculate_key(const DStarLite *planner, int cell_id, double *first, double *second) {
    double value = planner->g[cell_id] < planner->rhs[cell_id]
        ? planner->g[cell_id]
        : planner->rhs[cell_id];
    *first = value + dstar_estimate(planner, planner->start, dstar_point(planner, cell_id)) + planner->km;
    *second = value;
}

static bool dstar_heap_less(const DStarLite *planner, int left, int right) {
    if (planner->key_first[left] != planner->key_first[right]) {
        return planner->key_first[left] < planner->key_first[right];
    }
    if (planner->key_second[left] != planner->key_second[right]) {
        return planner->key_second[left] < planner->key_second[right];
    }
    return left < right;
}

static void dstar_heap_swap(DStarLite *planner, int left, int right) {
    int temp = planner->heap[left];
    planner->heap[left] = planner->heap[right];
    planner->heap[right] = temp;
    planner->position[planner->heap[left]] = left;
    planner->position[planner->heap[right]] = right;
}

static void dstar_heap_up(DStarLite *planner, int position) {
    while (position > 0) {
        int parent = (position - 1) / 2;
        if (!dstar_heap_less(planner, planner->heap[position], planner->heap[parent])) {
            break;
        }
        dstar_heap_swap(planner, position, parent);
        position = parent;
    }
}

static void dstar_heap_down(DStarLite *planner, int position) {
    while (true) {
        int left = position * 2 + 1;
        int right = left + 1;
        int smallest = position;
        if (left < planner->heap_size && dstar_heap_less(planner, planner->heap[left], planner->heap[smallest])) {
            smallest = left;
        }
        if (right < planner->heap_size && dstar_heap_less(planner, planner->heap[right], planner->heap[smallest])) {
            smallest = right;
        }
        if (smallest == position) {
            return;
        }
        dstar_heap_swap(planner, position, smallest);
        position = smallest;
    }
}

static void dstar_heap_remove(DStarLite *planner, int cell_id) {
    int position = planner->position[cell_id];
    if (position < 0) {
        return;
    }

    int last = planner->heap[--planner->heap_size];
    planner->position[cell_id] = -1;
    if (position == planner->heap_size) {
        return;
    }

    planner->heap[position] = last;
    planner->position[last] = position;
    dstar_heap_down(planner, position);
    dstar_heap_up(planner, planner->position[last]);
}

static int dstar_heap_pop(DStarLite *planner) {
    int cell_id = planner->heap[0];
    dstar_heap_remove(planner, cell_id);
    return cell_id;
}

static void dstar_push(DStarLite *planner, int cell_id) {
    dstar_heap_remove(planner, cell_id);
    dstar_calculate_key(planner, cell_id, &planner->key_first[cell_id], &planner->key_second[cell_id]);
    planner->position[cell_id] = planner->heap_size;
    planner->heap[planner->heap_size++] = cell_id;
    dstar_heap_up(planner, planner->position[cell_id]);
}

static int dstar_adjacent(const DStarLite *planner, int cell_id, int output[4]) {
    DStarPoint cell = dstar_point(planner, cell_id);
    int count = 0;
    if (cell.row > 0) {
        output[count++] = cell_id - planner->cols;
    }
    if (cell.col + 1 < planner->cols) {
        output[count++] = cell_id + 1;
    }
    if (cell.row + 1 < planner->rows) {
        output[count++] = cell_id + planner->cols;
    }
    if (cell.col > 0) {
        output[count++] = cell_id - 1;
    }
    return count;
}

static void dstar_update_vertex(DStarLite *planner, int cell_id) {
    if (dstar_blocked(planner, cell_id)) {
        dstar_heap_remove(planner, cell_id);
        return;
    }

    if (cell_id != dstar_id(planner, planner->goal)) {
        int neighbors[4];
        int count = dstar_adjacent(planner, cell_id, neighbors);
        double best = INFINITY;
        for (int index = 0; index < count; ++index) {
            int neighbor = neighbors[index];
            if (!dstar_blocked(planner, neighbor) && planner->g[neighbor] + 1.0 < best) {
                best = planner->g[neighbor] + 1.0;
            }
        }
        planner->rhs[cell_id] = best;
    }

    dstar_heap_remove(planner, cell_id);
    if (planner->g[cell_id] != planner->rhs[cell_id]) {
        dstar_push(planner, cell_id);
    }
}

bool dstar_lite_init(
    DStarLite *planner,
    const unsigned char *grid,
    int rows,
    int cols,
    DStarPoint start,
    DStarPoint goal,
    DStarHeuristic heuristic
) {
    if (!planner || !grid || rows <= 0 || cols <= 0 || rows > INT_MAX / cols) {
        return false;
    }

    memset(planner, 0, sizeof(*planner));
    planner->rows = rows;
    planner->cols = cols;
    planner->count = rows * cols;
    planner->start = start;
    planner->goal = goal;
    planner->heuristic = heuristic;
    if (!dstar_inside(planner, start) || !dstar_inside(planner, goal)) {
        dstar_lite_destroy(planner);
        return false;
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
        dstar_lite_destroy(planner);
        return false;
    }

    memcpy(planner->blocked, grid, (size_t)planner->count * sizeof(*grid));
    if (dstar_blocked(planner, dstar_id(planner, start)) || dstar_blocked(planner, dstar_id(planner, goal))) {
        dstar_lite_destroy(planner);
        return false;
    }

    for (int cell_id = 0; cell_id < planner->count; ++cell_id) {
        planner->g[cell_id] = INFINITY;
        planner->rhs[cell_id] = INFINITY;
        planner->position[cell_id] = -1;
    }
    planner->rhs[dstar_id(planner, goal)] = 0.0;
    dstar_push(planner, dstar_id(planner, goal));
    return true;
}

void dstar_lite_destroy(DStarLite *planner) {
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

bool dstar_lite_set_blocked(DStarLite *planner, DStarPoint cell, bool blocked) {
    if (!planner || !dstar_inside(planner, cell) || dstar_same_point(cell, planner->start) || dstar_same_point(cell, planner->goal)) {
        return false;
    }

    int cell_id = dstar_id(planner, cell);
    if (dstar_blocked(planner, cell_id) == blocked) {
        return true;
    }

    planner->blocked[cell_id] = (unsigned char)blocked;
    if (blocked) {
        planner->g[cell_id] = INFINITY;
        planner->rhs[cell_id] = INFINITY;
        dstar_heap_remove(planner, cell_id);
    } else {
        dstar_update_vertex(planner, cell_id);
    }

    int neighbors[4];
    int count = dstar_adjacent(planner, cell_id, neighbors);
    for (int index = 0; index < count; ++index) {
        if (!dstar_blocked(planner, neighbors[index])) {
            dstar_update_vertex(planner, neighbors[index]);
        }
    }
    return true;
}

bool dstar_lite_move_start(DStarLite *planner, DStarPoint new_start) {
    if (!planner || !dstar_inside(planner, new_start) || dstar_blocked(planner, dstar_id(planner, new_start))) {
        return false;
    }
    planner->km += dstar_estimate(planner, planner->start, new_start);
    planner->start = new_start;
    return true;
}

void dstar_lite_compute_shortest_path(DStarLite *planner) {
    int start_id = dstar_id(planner, planner->start);
    while (planner->heap_size > 0) {
        int top = planner->heap[0];
        double start_first;
        double start_second;
        dstar_calculate_key(planner, start_id, &start_first, &start_second);
        if (!dstar_key_less(planner->key_first[top], planner->key_second[top], start_first, start_second)
            && planner->rhs[start_id] == planner->g[start_id]) {
            return;
        }

        double old_first = planner->key_first[top];
        double old_second = planner->key_second[top];
        int current = dstar_heap_pop(planner);
        double new_first;
        double new_second;
        dstar_calculate_key(planner, current, &new_first, &new_second);

        if (dstar_key_less(old_first, old_second, new_first, new_second)) {
            dstar_push(planner, current);
        } else if (planner->g[current] > planner->rhs[current]) {
            planner->g[current] = planner->rhs[current];
            int neighbors[4];
            int count = dstar_adjacent(planner, current, neighbors);
            for (int index = 0; index < count; ++index) {
                if (!dstar_blocked(planner, neighbors[index])) {
                    dstar_update_vertex(planner, neighbors[index]);
                }
            }
        } else {
            planner->g[current] = INFINITY;
            dstar_update_vertex(planner, current);
            int neighbors[4];
            int count = dstar_adjacent(planner, current, neighbors);
            for (int index = 0; index < count; ++index) {
                if (!dstar_blocked(planner, neighbors[index])) {
                    dstar_update_vertex(planner, neighbors[index]);
                }
            }
        }
    }
}

int dstar_lite_path(const DStarLite *planner, DStarPoint *path, int capacity) {
    if (!planner || !path || capacity <= 0) {
        return 0;
    }

    int current = dstar_id(planner, planner->start);
    if (!isfinite(planner->g[current])) {
        return 0;
    }

    int length = 0;
    while (length < capacity && current != dstar_id(planner, planner->goal)) {
        path[length++] = dstar_point(planner, current);
        int neighbors[4];
        int count = dstar_adjacent(planner, current, neighbors);
        int best = -1;
        for (int index = 0; index < count; ++index) {
            int neighbor = neighbors[index];
            if (dstar_blocked(planner, neighbor)) {
                continue;
            }
            if (best < 0 || planner->g[neighbor] < planner->g[best]
                || (planner->g[neighbor] == planner->g[best] && neighbor < best)) {
                best = neighbor;
            }
        }
        if (best < 0 || !isfinite(planner->g[best])) {
            return 0;
        }
        current = best;
    }

    if (current != dstar_id(planner, planner->goal) || length >= capacity) {
        return 0;
    }
    path[length++] = planner->goal;
    return length;
}

int dstar_lite_replan(DStarLite *planner, DStarPoint *path, int capacity) {
    dstar_lite_compute_shortest_path(planner);
    return dstar_lite_path(planner, path, capacity);
}
