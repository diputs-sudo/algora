import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class TimSort {

    private static final int MIN_RUN = 5;

    private static int[] merge(int[] left, int[] right) {
        List<Integer> result = new ArrayList<>();
        int i = 0;
        int j = 0;

        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) {
                result.add(left[i++]);
            } else {
                result.add(right[j++]);
            }
        }

        while (i < left.length) {
            result.add(left[i++]);
        }
        while (j < right.length) {
            result.add(right[j++]);
        }

        return result.stream().mapToInt(x -> x).toArray();
    }

    public static int[] timSort(int[] arr) {
        int[] a = Arrays.copyOf(arr, arr.length);
        int n = a.length;

        for (int start = 0; start < n; start += MIN_RUN) {
            int end = Math.min(start + MIN_RUN, n);
            int[] sortedRun = InsertionSort.insertionSort(Arrays.copyOfRange(a, start, end));
            System.arraycopy(sortedRun, 0, a, start, sortedRun.length);
        }

        int size = MIN_RUN;
        while (size < n) {
            for (int left = 0; left < n; left += 2 * size) {
                int mid = Math.min(left + size, n);
                int right = Math.min(left + 2 * size, n);
                int[] merged = merge(Arrays.copyOfRange(a, left, mid), Arrays.copyOfRange(a, mid, right));
                System.arraycopy(merged, 0, a, left, merged.length);
            }

            size *= 2;
        }

        return a;
    }
}
