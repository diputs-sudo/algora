import java.util.Comparator;
import java.util.List;

public final class QuickSortProduction {
    private static final int INSERTION_THRESHOLD = 24;

    private QuickSortProduction() {
    }

    public static <T extends Comparable<? super T>> void quickSortInPlace(List<T> values) {
        quickSortInPlace(values, Comparator.naturalOrder());
    }

    public static <T> void quickSortInPlace(List<T> values, Comparator<? super T> comparator) {
        if (values == null || comparator == null) {
            throw new IllegalArgumentException("values and comparator must not be null");
        }

        if (values.size() < 2) {
            return;
        }

        quickRange(values, 0, values.size(), comparator);
        insertionRange(values, 0, values.size(), comparator);
    }

    private static <T> void quickRange(List<T> values, int low, int high, Comparator<? super T> comparator) {
        while (high - low > INSERTION_THRESHOLD) {
            T pivot = values.get(medianIndex(values, low, low + (high - low) / 2, high - 1, comparator));
            int left = low;
            int index = low;
            int right = high;

            while (index < right) {
                int order = comparator.compare(values.get(index), pivot);

                if (order < 0) {
                    swap(values, left++, index++);
                } else if (order > 0) {
                    swap(values, index, --right);
                } else {
                    index++;
                }
            }

            if (left - low < high - right) {
                quickRange(values, low, left, comparator);
                low = right;
            } else {
                quickRange(values, right, high, comparator);
                high = left;
            }
        }
    }

    private static <T> int medianIndex(List<T> values, int left, int mid, int right, Comparator<? super T> comparator) {
        if (comparator.compare(values.get(mid), values.get(left)) < 0) {
            int temp = left;
            left = mid;
            mid = temp;
        }

        if (comparator.compare(values.get(right), values.get(left)) < 0) {
            int temp = left;
            left = right;
            right = temp;
        }

        if (comparator.compare(values.get(right), values.get(mid)) < 0) {
            mid = right;
        }

        return mid;
    }

    private static <T> void insertionRange(List<T> values, int low, int high, Comparator<? super T> comparator) {
        for (int index = low + 1; index < high; index++) {
            T current = values.get(index);
            int position = index;

            while (position > low && comparator.compare(current, values.get(position - 1)) < 0) {
                values.set(position, values.get(position - 1));
                position--;
            }

            values.set(position, current);
        }
    }

    private static <T> void swap(List<T> values, int left, int right) {
        if (left != right) {
            T temp = values.get(left);
            values.set(left, values.get(right));
            values.set(right, temp);
        }
    }
}
