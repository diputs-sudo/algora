import java.util.concurrent.ThreadLocalRandom;

public class QuickselectProduction {
    private static int partition(int[] values, int left, int right, int pivotIndex) {
        int pivot = values[pivotIndex];
        swap(values, pivotIndex, right);
        int store = left;

        for (int scan = left; scan < right; scan++) {
            if (values[scan] < pivot) {
                swap(values, store, scan);
                store++;
            }
        }

        swap(values, store, right);
        return store;
    }

    private static void swap(int[] values, int left, int right) {
        int temp = values[left];
        values[left] = values[right];
        values[right] = temp;
    }

    public static int quickselect(int[] values, int k) {
        if (values == null || values.length == 0) {
            throw new IllegalArgumentException("values must not be empty");
        }
        if (k < 1 || k > values.length) {
            throw new IllegalArgumentException("k must be inside the array length");
        }

        int left = 0;
        int right = values.length - 1;
        int target = k - 1;

        while (true) {
            if (left == right) {
                return values[left];
            }

            int chosenPivot = ThreadLocalRandom.current().nextInt(left, right + 1);
            int pivotIndex = partition(values, left, right, chosenPivot);

            if (pivotIndex == target) {
                return values[pivotIndex];
            }
            if (pivotIndex > target) {
                right = pivotIndex - 1;
            } else {
                left = pivotIndex + 1;
            }
        }
    }
}
