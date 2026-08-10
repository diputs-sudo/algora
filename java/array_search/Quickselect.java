public class Quickselect {
    private static int partition(int[] values, int left, int right) {
        int pivot = values[right];
        int store = left;

        for (int scan = left; scan < right; scan++) {
            if (values[scan] < pivot) {
                int temp = values[store];
                values[store] = values[scan];
                values[scan] = temp;
                store++;
            }
        }

        int temp = values[store];
        values[store] = values[right];
        values[right] = temp;
        return store;
    }

    public static int quickselect(int[] values, int k) {
        int left = 0;
        int right = values.length - 1;
        int target = k - 1;

        while (left <= right) {
            int pivotIndex = partition(values, left, right);

            if (pivotIndex == target) {
                return values[pivotIndex];
            }
            if (pivotIndex > target) {
                right = pivotIndex - 1;
            } else {
                left = pivotIndex + 1;
            }
        }

        return -1;
    }
}
