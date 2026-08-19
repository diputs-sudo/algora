import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.List;

public class Bfs {
    record Cell(int row, int col) {}

    public static List<Cell> bfs(boolean[][] walls, Cell start, Cell target) {
        int height = walls.length;
        int width = walls[0].length;
        boolean[][] visited = new boolean[height][width];
        Cell[][] parent = new Cell[height][width];
        Deque<Cell> queue = new ArrayDeque<>();

        queue.addLast(start);
        visited[start.row()][start.col()] = true;

        while (!queue.isEmpty()) {
            Cell current = queue.removeFirst();
            if (current.equals(target)) {
                List<Cell> path = new ArrayList<>();
                for (Cell step = target; step != null; step = parent[step.row()][step.col()]) {
                    path.add(step);
                    if (step.equals(start)) {
                        break;
                    }
                }
                Collections.reverse(path);
                return path;
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
                if (walls[nextRow][nextCol] || visited[nextRow][nextCol]) {
                    continue;
                }

                visited[nextRow][nextCol] = true;
                parent[nextRow][nextCol] = current;
                queue.addLast(new Cell(nextRow, nextCol));
            }
        }

        return List.of();
    }
}
