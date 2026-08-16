import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.List;

public class ZeroOneBfsProduction {
    record Cell(int row, int col) {}

    public static List<Cell> zeroOneBfsPath(
            boolean[][] walls,
            int[][] weights,
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
        Deque<Integer> deque = new ArrayDeque<>();

        java.util.Arrays.fill(distance, Integer.MAX_VALUE);
        java.util.Arrays.fill(parent, -1);
        distance[startId] = 0;
        deque.addLast(startId);

        while (!deque.isEmpty()) {
            int currentId = deque.removeFirst();
            if (currentId == targetId) {
                return pathTo(parent, targetId, width);
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
                if (nextRow < 0 || nextRow >= height || nextCol < 0 || nextCol >= width) {
                    continue;
                }
                if (walls[nextRow][nextCol]) {
                    continue;
                }

                int weight = weights[nextRow][nextCol];
                if (weight != 0 && weight != 1) {
                    throw new IllegalArgumentException("edge weights must be 0 or 1");
                }

                int nextId = nextRow * width + nextCol;
                int nextDistance = distance[currentId] + weight;
                if (nextDistance >= distance[nextId]) {
                    continue;
                }

                distance[nextId] = nextDistance;
                parent[nextId] = currentId;
                if (weight == 0) {
                    deque.addFirst(nextId);
                } else {
                    deque.addLast(nextId);
                }
            }
        }

        return List.of();
    }

    private static int id(Cell cell, int width) {
        return cell.row() * width + cell.col();
    }

    private static void validateCell(Cell cell, int width, int height) {
        if (cell.row() < 0 || cell.row() >= height || cell.col() < 0 || cell.col() >= width) {
            throw new IllegalArgumentException("start and target must be inside the grid");
        }
    }

    private static List<Cell> pathTo(int[] parent, int targetId, int width) {
        List<Cell> path = new ArrayList<>();
        for (int currentId = targetId; currentId != -1; currentId = parent[currentId]) {
            path.add(new Cell(currentId / width, currentId % width));
        }
        Collections.reverse(path);
        return path;
    }
}
