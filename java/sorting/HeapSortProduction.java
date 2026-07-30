import java.util.Comparator;
import java.util.List;
import java.util.Objects;

public final class HeapSortProduction {

    private HeapSortProduction() {
    }

    public static <T extends Comparable<? super T>> void heapSortInPlace(List<T> values) {
        heapSortInPlace(values, Comparator.naturalOrder());
    }

    public static <T> void heapSortInPlace(List<T> values, Comparator<? super T> comparator) {
        Objects.requireNonNull(values, "values");
        Objects.requireNonNull(comparator, "comparator");

        int length = values.size();

        for (int start = length / 2 - 1; start >= 0; start--) {
            siftDown(values, start, length, comparator);
        }

        for (int end = length - 1; end > 0; end--) {
            swap(values, 0, end);
            siftDown(values, 0, end, comparator);
        }
    }

    private static <T> void siftDown(List<T> values, int start, int end, Comparator<? super T> comparator) {
        int root = start;

        while (true) {
            int child = root * 2 + 1;

            if (child >= end) {
                break;
            }

            int right = child + 1;

            if (right < end && comparator.compare(values.get(child), values.get(right)) < 0) {
                child = right;
            }

            if (comparator.compare(values.get(root), values.get(child)) >= 0) {
                break;
            }

            swap(values, root, child);
            root = child;
        }
    }

    private static <T> void swap(List<T> values, int left, int right) {
        T value = values.get(left);
        values.set(left, values.get(right));
        values.set(right, value);
    }
}
