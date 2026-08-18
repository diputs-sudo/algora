import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class BellmanFord {
    record Cell(int row, int col) {}

    public static List<Cell> bellmanFord(
            boolean[][] walls,
            int[][] costs,
            Cell start,
            Cell target
    ) {
        int height = walls.length;
        int width = walls[0].length;
        int total = width * height;
        int[][] distance = new int[height][width];
        Cell[][] parent = new Cell[height][width];

        for (int row = 0; row < height; row++) {
            java.util.Arrays.fill(distance[row], Integer.MAX_VALUE);
        }
        distance[start.row()][start.col()] = 0;

        for (int pass = 1; pass < total; pass++) {
            boolean changed = false;

            for (int row = 0; row < height; row++) {
                for (int col = 0; col < width; col++) {
                    if (walls[row][col] || distance[row][col] == Integer.MAX_VALUE) {
                        continue;
                    }

                    int[][] moves = {
                        {-1, 0},
                        {0, 1},
                        {1, 0},
                        {0, -1}
                    };

                    for (int[] move : moves) {
                        int nextRow = row + move[0];
                        int nextCol = col + move[1];
                        if (nextRow < 0 || nextRow >= height || nextCol < 0 || nextCol >= width
                                || walls[nextRow][nextCol]) {
                            continue;
                        }

                        int candidate = distance[row][col] + costs[nextRow][nextCol];
                        if (candidate < distance[nextRow][nextCol]) {
                            distance[nextRow][nextCol] = candidate;
                            parent[nextRow][nextCol] = new Cell(row, col);
                            changed = true;
                        }
                    }
                }
            }

            if (!changed) {
                break;
            }
        }

        for (int row = 0; row < height; row++) {
            for (int col = 0; col < width; col++) {
                if (walls[row][col] || distance[row][col] == Integer.MAX_VALUE) {
                    continue;
                }

                int[][] moves = {
                    {-1, 0},
                    {0, 1},
                    {1, 0},
                    {0, -1}
                };

                for (int[] move : moves) {
                    int nextRow = row + move[0];
                    int nextCol = col + move[1];
                    if (nextRow >= 0 && nextRow < height && nextCol >= 0 && nextCol < width
                            && !walls[nextRow][nextCol]
                            && distance[row][col] + costs[nextRow][nextCol] < distance[nextRow][nextCol]) {
                        throw new IllegalStateException("reachable negative cycle");
                    }
                }
            }
        }

        if (distance[target.row()][target.col()] == Integer.MAX_VALUE) {
            return List.of();
        }

        List<Cell> path = new ArrayList<>();
        for (Cell current = target; current != null; current = parent[current.row()][current.col()]) {
            path.add(current);
            if (current.equals(start)) {
                break;
            }
        }
        Collections.reverse(path);
        return path;
    }
}
