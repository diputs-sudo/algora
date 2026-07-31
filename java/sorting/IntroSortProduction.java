import java.util.Comparator;
import java.util.List;

public final class IntroSortProduction {
    private static final int INSERTION_THRESHOLD = 24;

    private IntroSortProduction() {
    }

    public static <T extends Comparable<? super T>> void introSortInPlace(List<T> values) {
        introSortInPlace(values, Comparator.naturalOrder());
    }

    public static <T> void introSortInPlace(List<T> values, Comparator<? super T> comparator) {
        if (values == null || comparator == null) {
            throw new IllegalArgumentException("values and comparator must not be null");
        }

        if (values.size() < 2) {
            return;
        }

        int depthLimit = 2 * (32 - Integer.numberOfLeadingZeros(values.size()));
        introRange(values, 0, values.size(), depthLimit, comparator);
        insertionRange(values, 0, values.size(), comparator);
    }

    private static <T> void introRange(List<T> values, int low, int high, int depthLimit, Comparator<? super T> comparator) {
        while (high - low > INSERTION_THRESHOLD) {
            if (depthLimit == 0) {
                heapRange(values, low, high, comparator);
                return;
            }

            depthLimit--;
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
                introRange(values, low, left, depthLimit, comparator);
                low = right;
            } else {
                introRange(values, right, high, depthLimit, comparator);
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

    private static <T> void heapRange(List<T> values, int low, int high, Comparator<? super T> comparator) {
        int length = high - low;

        for (int start = length / 2 - 1; start >= 0; start--) {
            siftDown(values, low, start, length, comparator);
        }

        for (int end = length - 1; end > 0; end--) {
            swap(values, low, low + end);
            siftDown(values, low, 0, end, comparator);
        }
    }

    private static <T> void siftDown(List<T> values, int offset, int start, int end, Comparator<? super T> comparator) {
        int root = start;

        while (true) {
            int child = root * 2 + 1;

            if (child >= end) {
                break;
            }

            if (child + 1 < end && comparator.compare(values.get(offset + child), values.get(offset + child + 1)) < 0) {
                child++;
            }

            if (comparator.compare(values.get(offset + root), values.get(offset + child)) >= 0) {
                break;
            }

            swap(values, offset + root, offset + child);
            root = child;
        }
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
