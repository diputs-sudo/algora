public final class TernarySearchProduction {
    public record SearchResult(boolean found, int index, int comparisons) {
    }

    private TernarySearchProduction() {
    }

    public static SearchResult search(int[] values, int target) {
        if (values == null) {
            throw new IllegalArgumentException("values must not be null");
        }

        return search(values, target, 0, values.length);
    }

    public static SearchResult search(int[] values, int target, int start, int stop) {
        if (values == null) {
            throw new IllegalArgumentException("values must not be null");
        }

        validateRange(values.length, start, stop);

        int left = start;
        int right = stop - 1;
        int comparisons = 0;

        while (left <= right) {
            int third = (right - left) / 3;
            int mid1 = left + third;
            int mid2 = right - third;

            comparisons += 1;
            if (values[mid1] == target) {
                return new SearchResult(true, mid1, comparisons);
            }

            if (mid2 != mid1) {
                comparisons += 1;
                if (values[mid2] == target) {
                    return new SearchResult(true, mid2, comparisons);
                }
            }

            comparisons += 1;
            if (target < values[mid1]) {
                right = mid1 - 1;
                continue;
            }

            comparisons += 1;
            if (target > values[mid2]) {
                left = mid2 + 1;
            } else {
                left = mid1 + 1;
                right = mid2 - 1;
            }
        }

        return new SearchResult(false, -1, comparisons);
    }

    private static void validateRange(int length, int start, int stop) {
        if (start < 0 || start > length || stop < start || stop > length) {
            throw new IllegalArgumentException("range must satisfy 0 <= start <= stop <= values.length");
        }
    }
}
