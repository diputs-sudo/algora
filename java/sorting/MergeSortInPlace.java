import java.util.Arrays;

public class MergeSortInPlace {

    private static void inplaceMerge(int[] a, int left, int mid, int right) {
        int i = left;
        int j = mid;

        while (i < j && j < right) {
            if (a[i] <= a[j]) {
                i++;
            } else {
                int value = a[j];
                int k = j;

                while (k > i) {
                    a[k] = a[k - 1];
                    k--;
                }

                a[i] = value;
                i++;
                j++;
                mid++;
            }
        }
    }

    private static void mergeSortInplaceRecursive(int[] a, int left, int right) {
        if (right - left <= 1) {
            return;
        }

        int mid = (left + right) / 2;
        mergeSortInplaceRecursive(a, left, mid);
        mergeSortInplaceRecursive(a, mid, right);
        inplaceMerge(a, left, mid, right);
    }

    public static int[] mergeSortInplace(int[] arr) {
        int[] a = Arrays.copyOf(arr, arr.length);
        mergeSortInplaceRecursive(a, 0, a.length);
        return a;
    }
}
