public final class UniformBinarySearchProduction {
    public record SearchResult(boolean found, int index, int comparisons) {
    }

    private UniformBinarySearchProduction() {
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

        int[] steps = buildStepTable(stop - start);
        int left = start;
        int right = stop - 1;
        int comparisons = 0;

        for (int ignoredStep : steps) {
            if (left > right) {
                break;
            }

            int mid = left + (right - left) / 2;
            comparisons += 1;

            if (values[mid] == target) {
                return new SearchResult(true, mid, comparisons);
            }

            if (values[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return new SearchResult(false, -1, comparisons);
    }

    private static int[] buildStepTable(int length) {
        int count = 0;

        for (int step = (length + 1) / 2; step >= 1; step /= 2) {
            count += 1;
        }

        int[] steps = new int[count];
        int index = 0;

        for (int step = (length + 1) / 2; step >= 1; step /= 2) {
            steps[index] = step;
            index += 1;
        }

        return steps;
    }

    private static void validateRange(int length, int start, int stop) {
        if (start < 0 || start > length || stop < start || stop > length) {
            throw new IllegalArgumentException("range must satisfy 0 <= start <= stop <= values.length");
        }
    }
}
