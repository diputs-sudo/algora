import java.util.Comparator;
import java.util.List;

public final class GallopingSearchProduction {
    public record SearchResult(boolean found, int index, int insertionPoint, int upperBound) {
    }

    private GallopingSearchProduction() {
    }

    public static <T extends Comparable<? super T>> SearchResult gallopingSearchFirst(List<T> values, T target) {
        return gallopingSearchFirst(values, target, Comparator.naturalOrder(), 0);
    }

    public static <T extends Comparable<? super T>> SearchResult gallopingSearchFirst(List<T> values, T target, int start) {
        return gallopingSearchFirst(values, target, Comparator.naturalOrder(), start);
    }

    public static <T> SearchResult gallopingSearchFirst(List<T> values, T target, Comparator<? super T> comparator, int start) {
        if (values == null || comparator == null) {
            throw new IllegalArgumentException("values and comparator must not be null");
        }

        int length = values.size();

        if (start < 0 || start > length) {
            throw new IllegalArgumentException("start must be between 0 and values.size()");
        }

        if (start == length) {
            return new SearchResult(false, -1, length, length);
        }

        if (comparator.compare(values.get(start), target) >= 0) {
            boolean found = comparator.compare(values.get(start), target) == 0;
            return new SearchResult(found, found ? start : -1, start, start + 1);
        }

        int remaining = length - start;
        int jump = 1;

        while (jump < remaining && comparator.compare(values.get(start + jump), target) < 0) {
            if (jump > remaining / 2) {
                jump = remaining;
                break;
            }

            jump *= 2;
        }

        int left = start + jump / 2 + 1;
        int right = Math.min(start + jump + 1, length);
        int insertionPoint = lowerBound(values, target, left, right, comparator);
        boolean found = insertionPoint < length && comparator.compare(values.get(insertionPoint), target) == 0;

        return new SearchResult(found, found ? insertionPoint : -1, insertionPoint, right);
    }

    private static <T> int lowerBound(List<T> values, T target, int left, int right, Comparator<? super T> comparator) {
        while (left < right) {
            int mid = left + (right - left) / 2;

            if (comparator.compare(values.get(mid), target) < 0) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        return left;
    }
}
