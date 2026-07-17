import java.util.Arrays;

public class BubbleSort {

    public static int[] bubbleSort(int[] arr) {
        int[] a = Arrays.copyOf(arr, arr.length);
        int n = a.length;

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (a[j] > a[j + 1]) {
                    int temp = a[j];
                    a[j] = a[j + 1];
                    a[j + 1] = temp;
                }
            }
        }

        return a;
    }
}
