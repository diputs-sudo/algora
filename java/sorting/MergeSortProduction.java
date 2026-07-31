import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public final class MergeSortProduction {
    private MergeSortProduction() {
    }

    public static <T extends Comparable<? super T>> void mergeSortInPlace(List<T> values) {
        mergeSortInPlace(values, Comparator.naturalOrder());
    }

    public static <T> void mergeSortInPlace(List<T> values, Comparator<? super T> comparator) {
        if (values == null || comparator == null) {
            throw new IllegalArgumentException("values and comparator must not be null");
        }

        if (values.size() < 2) {
            return;
        }

        List<T> buffer = new ArrayList<>(values);
        boolean sourceIsBuffer = false;

        for (int width = 1; width < values.size(); width *= 2) {
            if (sourceIsBuffer) {
                for (int start = 0; start < values.size(); start += width * 2) {
                    int mid = Math.min(start + width, values.size());
                    int end = Math.min(start + width * 2, values.size());
                    merge(buffer, values, start, mid, end, comparator);
                }
            } else {
                for (int start = 0; start < values.size(); start += width * 2) {
                    int mid = Math.min(start + width, values.size());
                    int end = Math.min(start + width * 2, values.size());
                    merge(values, buffer, start, mid, end, comparator);
                }
            }

            sourceIsBuffer = !sourceIsBuffer;
        }

        if (sourceIsBuffer) {
            for (int index = 0; index < values.size(); index++) {
                values.set(index, buffer.get(index));
            }
        }
    }

    private static <T> void merge(List<T> source, List<T> target, int start, int mid, int end, Comparator<? super T> comparator) {
        int left = start;
        int right = mid;
        int write = start;

        while (left < mid && right < end) {
            if (comparator.compare(source.get(right), source.get(left)) < 0) {
                target.set(write++, source.get(right++));
            } else {
                target.set(write++, source.get(left++));
            }
        }

        while (left < mid) {
            target.set(write++, source.get(left++));
        }

        while (right < end) {
            target.set(write++, source.get(right++));
        }
    }
}
