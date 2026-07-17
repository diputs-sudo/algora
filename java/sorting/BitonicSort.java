import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class BitonicSort {

    private static int nextPowerOfTwo(int n) {
        return 1 << (32 - Integer.numberOfLeadingZeros(n - 1));
    }

    private static void compareAndSwap(int[] a, int i, int j, boolean ascending) {
        if ((ascending && a[i] > a[j]) || (!ascending && a[i] < a[j])) {
            int temp = a[i];
            a[i] = a[j];
            a[j] = temp;
        }
    }

    private static void bitonicMerge(int[] a, int low, int count, boolean ascending) {
        if (count > 1) {
            int half = count / 2;
            for (int i = low; i < low + half; i++) {
                compareAndSwap(a, i, i + half, ascending);
            }

            bitonicMerge(a, low, half, ascending);
            bitonicMerge(a, low + half, half, ascending);
        }
    }

    private static void bitonicSortRecursive(int[] a, int low, int count, boolean ascending) {
        if (count > 1) {
            int half = count / 2;
            bitonicSortRecursive(a, low, half, true);
            bitonicSortRecursive(a, low + half, half, false);
            bitonicMerge(a, low, count, ascending);
        }
    }

    public static int[] bitonicSort(int[] arr) {
        int[] a = Arrays.copyOf(arr, arr.length);
        int target = nextPowerOfTwo(a.length);

        if (target != a.length) {
            a = Arrays.copyOf(a, target);
            for (int i = arr.length; i < target; i++) {
                a[i] = Integer.MAX_VALUE;
            }
        }

        bitonicSortRecursive(a, 0, a.length, true);

        List<Integer> cleaned = new ArrayList<>();
        for (int value : a) {
            if (value != Integer.MAX_VALUE) {
                cleaned.add(value);
            }
        }

        return cleaned.stream().mapToInt(x -> x).toArray();
    }
}
