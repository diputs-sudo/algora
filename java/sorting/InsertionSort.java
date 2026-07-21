import java.util.Arrays;

public class InsertionSort {

    public static int[] insertionSort(int[] arr) {
        int[] a = Arrays.copyOf(arr, arr.length);

        for (int i = 1; i < a.length; i++) {
            int key = a[i];
            int j = i - 1;

            while (j >= 0 && a[j] > key) {
                a[j + 1] = a[j];
                j--;
            }

            a[j + 1] = key;
        }

        return a;
    }
}
