import java.util.Arrays;

public class ShellSort {
    
    public static int[] shellSort(int[] arr) {
        int[] a = Arrays.copyOf(arr, arr.length);
        int n = a.length;
        int gap = n / 2;

        while (gap > 0) {
            for (int i = gap; i < n; i++) {
                int temp = a[i];
                int j = i;

                while (j >= gap && a[j - gap] > temp) {
                    a[j] = a[j - gap];
                    j -= gap;
                }

                a[j] = temp;
            }

            gap /= 2;
        }

        return a;
    }
}
