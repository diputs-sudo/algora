import java.util.Arrays;

public class HeapSort {

    private static void heapify(int[] a, int length, int i) {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;

        if (left < length && a[left] > a[largest]) {
            largest = left;
        }

        if (right < length && a[right] > a[largest]) {
            largest = right;
        }

        if (largest != i) {
            int temp = a[i];
            a[i] = a[largest];
            a[largest] = temp;
            heapify(a, length, largest);
        }
    }

    public static int[] heapSort(int[] arr) {
        int[] a = Arrays.copyOf(arr, arr.length);
        int n = a.length;

        for (int i = n / 2 - 1; i >= 0; i--) {
            heapify(a, n, i);
        }

        for (int i = n - 1; i > 0; i--) {
            int temp = a[0];
            a[0] = a[i];
            a[i] = temp;
            heapify(a, i, 0);
        }

        return a;
    }
}
