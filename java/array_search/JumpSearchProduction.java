import java.util.Comparator;
import java.util.List;

public final class JumpSearchProduction {
    public record SearchResult(boolean found, int index, int insertionPoint, int blockSize) {
    }

    private JumpSearchProduction() {
    }

    public static <T extends Comparable<? super T>> SearchResult jumpSearchFirst(List<T> values, T target) {
        return jumpSearchFirst(values, target, Comparator.naturalOrder(), 0);
    }

    public static <T extends Comparable<? super T>> SearchResult jumpSearchFirst(List<T> values, T target, int blockSize) {
        return jumpSearchFirst(values, target, Comparator.naturalOrder(), blockSize);
    }

    public static <T> SearchResult jumpSearchFirst(List<T> values, T target, Comparator<? super T> comparator, int blockSize) {
        if (values == null || comparator == null) {
            throw new IllegalArgumentException("values and comparator must not be null");
        }

        int length = values.size();

        if (length == 0) {
            return new SearchResult(false, -1, 0, 0);
        }

        int step = blockSize > 0 ? blockSize : (int) Math.sqrt(length);

        if (step < 1) {
            step = 1;
        }

        int left = 0;
        int right = Math.min(step, length);

        while (right < length && comparator.compare(values.get(right - 1), target) < 0) {
            left = right;
            right = Math.min(right + step, length);
        }

        int insertionPoint = lowerBound(values, target, left, right, comparator);
        boolean found = insertionPoint < length && comparator.compare(values.get(insertionPoint), target) == 0;

        return new SearchResult(found, found ? insertionPoint : -1, insertionPoint, step);
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
