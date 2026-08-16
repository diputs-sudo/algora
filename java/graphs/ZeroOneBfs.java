import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.List;

public class ZeroOneBfs {
    record Cell(int row, int col) {}

    public static List<Cell> zeroOneBfs(
            boolean[][] walls,
            int[][] weights,
            Cell start,
            Cell target
    ) {
        int height = walls.length;
        int width = walls[0].length;
        int[][] distance = new int[height][width];
        Cell[][] parent = new Cell[height][width];
        Deque<Cell> deque = new ArrayDeque<>();

        for (int row = 0; row < height; row++) {
            java.util.Arrays.fill(distance[row], Integer.MAX_VALUE);
        }

        distance[start.row()][start.col()] = 0;
        deque.addLast(start);

        while (!deque.isEmpty()) {
            Cell current = deque.removeFirst();
            if (current.equals(target)) {
                return pathTo(parent, start, target);
            }

            int[][] moves = {
                {-1, 0},
                {0, 1},
                {1, 0},
                {0, -1}
            };

            for (int[] move : moves) {
                int nextRow = current.row() + move[0];
                int nextCol = current.col() + move[1];
                if (nextRow < 0 || nextRow >= height || nextCol < 0 || nextCol >= width) {
                    continue;
                }
                if (walls[nextRow][nextCol]) {
                    continue;
                }

                int weight = weights[nextRow][nextCol];
                int nextDistance = distance[current.row()][current.col()] + weight;
                if (nextDistance >= distance[nextRow][nextCol]) {
                    continue;
                }

                distance[nextRow][nextCol] = nextDistance;
                parent[nextRow][nextCol] = current;
                Cell next = new Cell(nextRow, nextCol);
                if (weight == 0) {
                    deque.addFirst(next);
                } else {
                    deque.addLast(next);
                }
            }
        }

        return List.of();
    }

    private static List<Cell> pathTo(Cell[][] parent, Cell start, Cell target) {
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
