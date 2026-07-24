import java.util.Arrays;

public class SelectionSort {

    public static int[] selectionSort(int[] arr) {
        int[] a = Arrays.copyOf(arr, arr.length);
        int n = a.length;

        for (int i = 0; i < n; i++) {
            int minIdx = i;

            for (int j = i + 1; j < n; j++) {
                if (a[j] < a[minIdx]) {
                    minIdx = j;
                }
            }

            if (minIdx != i) {
                int temp = a[i];
                a[i] = a[minIdx];
                a[minIdx] = temp;
            }
        }

        return a;
    }
}
