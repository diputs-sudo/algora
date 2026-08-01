import java.util.Comparator;
import java.util.List;

public final class BitonicArraySearchProduction {
    public record SearchResult(boolean found, int index, int peakIndex) {
    }

    private BitonicArraySearchProduction() {
    }

    public static <T extends Comparable<? super T>> SearchResult bitonicSearch(List<T> values, T target) {
        return bitonicSearch(values, target, Comparator.naturalOrder());
    }

    public static <T> SearchResult bitonicSearch(List<T> values, T target, Comparator<? super T> comparator) {
        if (values == null || comparator == null) {
            throw new IllegalArgumentException("values and comparator must not be null");
        }

        if (values.isEmpty()) {
            return new SearchResult(false, -1, -1);
        }

        int peak = findPeak(values, comparator);
        T peakValue = values.get(peak);

        if (comparator.compare(target, peakValue) == 0) {
            return new SearchResult(true, peak, peak);
        }

        if (comparator.compare(peakValue, target) < 0) {
            return new SearchResult(false, -1, peak);
        }

        if (comparator.compare(target, values.get(0)) < 0 && comparator.compare(target, values.get(values.size() - 1)) < 0) {
            return new SearchResult(false, -1, peak);
        }

        int index = binarySearch(values, target, 0, peak - 1, comparator, true);

        if (index != -1) {
            return new SearchResult(true, index, peak);
        }

        index = binarySearch(values, target, peak + 1, values.size() - 1, comparator, false);
        return new SearchResult(index != -1, index, peak);
    }

    private static <T> int findPeak(List<T> values, Comparator<? super T> comparator) {
        int left = 0;
        int right = values.size() - 1;

        while (left < right) {
            int mid = left + (right - left) / 2;

            if (comparator.compare(values.get(mid), values.get(mid + 1)) < 0) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        return left;
    }

    private static <T> int binarySearch(List<T> values, T target, int left, int right, Comparator<? super T> comparator, boolean ascending) {
        while (left <= right) {
            int mid = left + (right - left) / 2;
            int order = comparator.compare(values.get(mid), target);

            if (order == 0) {
                return mid;
            }

            if ((order < 0) == ascending) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return -1;
    }
}
