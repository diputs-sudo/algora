import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public final class TournamentSortProduction {
    private TournamentSortProduction() {
    }

    public static <T extends Comparable<? super T>> void tournamentSortInPlace(List<T> values) {
        tournamentSortInPlace(values, Comparator.naturalOrder());
    }

    public static <T> void tournamentSortInPlace(List<T> values, Comparator<? super T> comparator) {
        if (values == null || comparator == null) {
            throw new IllegalArgumentException("values and comparator must not be null");
        }

        int length = values.size();
        if (length < 2) {
            return;
        }

        int size = 1;
        while (size < length) {
            size *= 2;
        }

        int[] tree = new int[size * 2];
        for (int index = 0; index < tree.length; index++) {
            tree[index] = -1;
        }

        for (int index = 0; index < length; index++) {
            tree[size + index] = index;
        }

        for (int index = size - 1; index > 0; index--) {
            tree[index] = winner(tree[index * 2], tree[index * 2 + 1], values, comparator);
        }

        List<T> output = new ArrayList<>(length);

        for (int count = 0; count < length; count++) {
            int selected = tree[1];
            output.add(values.get(selected));

            int node = size + selected;
            tree[node] = -1;
            node /= 2;

            while (node > 0) {
                tree[node] = winner(tree[node * 2], tree[node * 2 + 1], values, comparator);
                node /= 2;
            }
        }

        for (int index = 0; index < length; index++) {
            values.set(index, output.get(index));
        }
    }

    private static <T> int winner(int left, int right, List<T> values, Comparator<? super T> comparator) {
        if (left < 0) {
            return right;
        }

        if (right < 0) {
            return left;
        }

        return comparator.compare(values.get(right), values.get(left)) < 0 ? right : left;
    }
}
