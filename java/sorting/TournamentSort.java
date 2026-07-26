import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class TournamentSort {

    private static BuildResult buildTree(int[] a) {
        int n = a.length;
        int size = 1 << (32 - Integer.numberOfLeadingZeros(n - 1));
        int offset = size;

        double[] tree = new double[2 * size];
        Arrays.fill(tree, Double.POSITIVE_INFINITY);

        for (int i = 0; i < n; i++) {
            tree[offset + i] = a[i];
        }

        for (int i = offset - 1; i > 0; i--) {
            tree[i] = Math.min(tree[2 * i], tree[2 * i + 1]);
        }

        return new BuildResult(tree, offset);
    }

    private static void updateTree(double[] tree, int index) {
        int i = index / 2;
        while (i >= 1) {
            tree[i] = Math.min(tree[2 * i], tree[2 * i + 1]);
            i /= 2;
        }
    }

    public static int[] tournamentSort(int[] arr) {
        int[] a = Arrays.copyOf(arr, arr.length);
        BuildResult build = buildTree(a);
        double[] tree = build.tree;
        int offset = build.offset;

        List<Integer> result = new ArrayList<>();

        for (int count = 0; count < a.length; count++) {
            double winner = tree[1];
            result.add((int) winner);

            int i = 1;
            while (i < offset) {
                int left = 2 * i;
                int right = 2 * i + 1;
                i = tree[left] == winner ? left : right;
            }

            tree[i] = Double.POSITIVE_INFINITY;
            updateTree(tree, i);
        }

        return result.stream().mapToInt(x -> x).toArray();
    }

    private static class BuildResult {
        double[] tree;
        int offset;

        BuildResult(double[] tree, int offset) {
            this.tree = tree;
            this.offset = offset;
        }
    }
}
