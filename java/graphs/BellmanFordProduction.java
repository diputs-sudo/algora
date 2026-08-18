import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class BellmanFordProduction {
    record Cell(int row, int col) {}

    public static List<Cell> bellmanFordPath(
            boolean[][] walls,
            int[][] costs,
            Cell start,
            Cell target
    ) {
        int height = walls.length;
        int width = walls[0].length;
        validateCell(start, width, height);
        validateCell(target, width, height);

        if (walls[start.row()][start.col()] || walls[target.row()][target.col()]) {
            return List.of();
        }

        int total = width * height;
        int startId = id(start, width);
        int targetId = id(target, width);
        int[] distance = new int[total];
        int[] parent = new int[total];
        java.util.Arrays.fill(distance, Integer.MAX_VALUE);
        java.util.Arrays.fill(parent, -1);
        distance[startId] = 0;

        for (int pass = 1; pass < total; pass++) {
            boolean changed = false;

            for (int currentId = 0; currentId < total; currentId++) {
                if (walls[currentId / width][currentId % width]
                        || distance[currentId] == Integer.MAX_VALUE) {
                    continue;
                }

                int row = currentId / width;
                int col = currentId % width;
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

                    int nextId = nextRow * width + nextCol;
                    int candidate = distance[currentId] + costs[nextRow][nextCol];
                    if (candidate < distance[nextId]) {
                        distance[nextId] = candidate;
                        parent[nextId] = currentId;
                        changed = true;
                    }
                }
            }

            if (!changed) {
                break;
            }
        }

        for (int currentId = 0; currentId < total; currentId++) {
            int row = currentId / width;
            int col = currentId % width;
            if (walls[row][col] || distance[currentId] == Integer.MAX_VALUE) {
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
                        && distance[currentId] + costs[nextRow][nextCol]
                        < distance[nextRow * width + nextCol]) {
                    throw new IllegalStateException("reachable negative cycle");
                }
            }
        }

        if (distance[targetId] == Integer.MAX_VALUE) {
            return List.of();
        }

        List<Cell> path = new ArrayList<>();
        for (int currentId = targetId; currentId != -1; currentId = parent[currentId]) {
            path.add(new Cell(currentId / width, currentId % width));
        }
        Collections.reverse(path);
        return path;
    }

    private static int id(Cell cell, int width) {
        return cell.row() * width + cell.col();
    }

    private static void validateCell(Cell cell, int width, int height) {
        if (cell.row() < 0 || cell.row() >= height || cell.col() < 0 || cell.col() >= width) {
            throw new IllegalArgumentException("start and target must be inside the grid");
        }
    }
}
