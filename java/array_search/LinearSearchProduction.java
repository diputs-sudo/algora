import java.util.List;
import java.util.Objects;
import java.util.function.Predicate;

public final class LinearSearchProduction {
    public record SearchResult(boolean found, int index, int inspected) {
    }

    private LinearSearchProduction() {
    }

    public static <T> SearchResult findFirst(List<T> values, T target) {
        if (values == null) {
            throw new IllegalArgumentException("values must not be null");
        }

        return findFirst(values, target, 0, values.size());
    }

    public static <T> SearchResult findFirst(List<T> values, T target, int start, int stop) {
        if (values == null) {
            throw new IllegalArgumentException("values must not be null");
        }

        validateRange(values.size(), start, stop);
        int inspected = 0;

        for (int index = start; index < stop; index++) {
            inspected += 1;

            if (Objects.equals(values.get(index), target)) {
                return new SearchResult(true, index, inspected);
            }
        }

        return new SearchResult(false, -1, inspected);
    }

    public static <T> SearchResult findFirstWhere(List<T> values, Predicate<? super T> predicate) {
        if (values == null || predicate == null) {
            throw new IllegalArgumentException("values and predicate must not be null");
        }

        return findFirstWhere(values, predicate, 0, values.size());
    }

    public static <T> SearchResult findFirstWhere(List<T> values, Predicate<? super T> predicate, int start, int stop) {
        if (values == null || predicate == null) {
            throw new IllegalArgumentException("values and predicate must not be null");
        }

        validateRange(values.size(), start, stop);
        int inspected = 0;

        for (int index = start; index < stop; index++) {
            inspected += 1;

            if (predicate.test(values.get(index))) {
                return new SearchResult(true, index, inspected);
            }
        }

        return new SearchResult(false, -1, inspected);
    }

    private static void validateRange(int length, int start, int stop) {
        if (start < 0 || start > length || stop < start || stop > length) {
            throw new IllegalArgumentException("range must satisfy 0 <= start <= stop <= values.size()");
        }
    }
}
