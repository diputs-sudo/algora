import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.List;

public class Dfs {
    record Cell(int row, int col) {}

    public static List<Cell> dfsGrid(boolean[][] walls, Cell start, Cell target) {
        int height = walls.length;
        int width = walls[0].length;
        boolean[][] visited = new boolean[height][width];
        Cell[][] parent = new Cell[height][width];
        Deque<Cell> stack = new ArrayDeque<>();

        stack.push(start);

        while (!stack.isEmpty()) {
            Cell cell = stack.pop();
            if (visited[cell.row()][cell.col()]) continue;

            visited[cell.row()][cell.col()] = true;

            if (cell.equals(target)) {
                List<Cell> path = new ArrayList<>();
                for (Cell current = target; current != null; current = parent[current.row()][current.col()]) {
                    path.add(current);
                    if (current.equals(start)) break;
                }
                Collections.reverse(path);
                return path;
            }

            int[][] moves = {{-1, 0}, {0, 1}, {1, 0}, {0, -1}};
            for (int[] move : moves) {
                Cell next = new Cell(cell.row() + move[0], cell.col() + move[1]);
                if (next.row() >= 0 && next.row() < height && next.col() >= 0 && next.col() < width
                        && !walls[next.row()][next.col()] && !visited[next.row()][next.col()]) {
                    parent[next.row()][next.col()] = cell;
                    stack.push(next);
                }
            }
        }

        return List.of();
    }
}
