import java.util.Comparator;
import java.util.List;

public final class MergeSortInplaceProduction {
    private static final int INSERTION_THRESHOLD = 24;

    private MergeSortInplaceProduction() {
    }

    public static <T extends Comparable<? super T>> void mergeSortInplaceInPlace(List<T> values) {
        mergeSortInplaceInPlace(values, Comparator.naturalOrder());
    }

    public static <T> void mergeSortInplaceInPlace(List<T> values, Comparator<? super T> comparator) {
        if (values == null || comparator == null) {
            throw new IllegalArgumentException("values and comparator must not be null");
        }

        sortRange(values, 0, values.size(), comparator);
    }

    private static <T> void sortRange(List<T> values, int first, int last, Comparator<? super T> comparator) {
        if (last - first <= INSERTION_THRESHOLD) {
            insertionRange(values, first, last, comparator);
            return;
        }

        int mid = first + (last - first) / 2;
        sortRange(values, first, mid, comparator);
        sortRange(values, mid, last, comparator);
        mergeRange(values, first, mid, last, comparator);
    }

    private static <T> void mergeRange(List<T> values, int first, int mid, int last, Comparator<? super T> comparator) {
        if (first >= mid || mid >= last) {
            return;
        }

        if (comparator.compare(values.get(mid), values.get(mid - 1)) >= 0) {
            return;
        }

        if (last - first == 2) {
            if (comparator.compare(values.get(mid), values.get(first)) < 0) {
                swap(values, first, mid);
            }

            return;
        }

        if (mid - first > last - mid) {
            int leftMid = first + (mid - first) / 2;
            int rightCut = lowerBound(values, mid, last, values.get(leftMid), comparator);
            int newMid = leftMid + (rightCut - mid);
            rotate(values, leftMid, mid, rightCut);
            mergeRange(values, first, leftMid, newMid, comparator);
            mergeRange(values, newMid, rightCut, last, comparator);
        } else {
            int rightMid = mid + (last - mid) / 2;
            int leftCut = upperBound(values, first, mid, values.get(rightMid), comparator);
            int newMid = leftCut + (rightMid - mid);
            rotate(values, leftCut, mid, rightMid);
            mergeRange(values, first, leftCut, newMid, comparator);
            mergeRange(values, newMid, rightMid, last, comparator);
        }
    }

    private static <T> int lowerBound(List<T> values, int first, int last, T target, Comparator<? super T> comparator) {
        while (first < last) {
            int mid = first + (last - first) / 2;

            if (comparator.compare(values.get(mid), target) < 0) {
                first = mid + 1;
            } else {
                last = mid;
            }
        }

        return first;
    }

    private static <T> int upperBound(List<T> values, int first, int last, T target, Comparator<? super T> comparator) {
        while (first < last) {
            int mid = first + (last - first) / 2;

            if (comparator.compare(target, values.get(mid)) >= 0) {
                first = mid + 1;
            } else {
                last = mid;
            }
        }

        return first;
    }

    private static <T> void rotate(List<T> values, int first, int mid, int last) {
        reverse(values, first, mid);
        reverse(values, mid, last);
        reverse(values, first, last);
    }

    private static <T> void reverse(List<T> values, int first, int last) {
        int left = first;
        int right = last - 1;

        while (left < right) {
            swap(values, left++, right--);
        }
    }

    private static <T> void insertionRange(List<T> values, int first, int last, Comparator<? super T> comparator) {
        for (int index = first + 1; index < last; index++) {
            T current = values.get(index);
            int position = index;

            while (position > first && comparator.compare(current, values.get(position - 1)) < 0) {
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
