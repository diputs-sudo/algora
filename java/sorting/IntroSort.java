import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class IntroSort {

    public static int[] introSort(int[] arr) {
        int maxDepth = 2 * (32 - Integer.numberOfLeadingZeros(arr.length));
        return introSortRecursive(Arrays.copyOf(arr, arr.length), maxDepth);
    }

    private static int[] introSortRecursive(int[] a, int maxDepth) {
        if (a.length <= 16) {
            return InsertionSort.insertionSort(a);
        }

        if (maxDepth == 0) {
            return HeapSort.heapSort(a);
        }

        int pivot = a[a.length / 2];
        List<Integer> left = new ArrayList<>();
        List<Integer> middle = new ArrayList<>();
        List<Integer> right = new ArrayList<>();

        for (int value : a) {
            if (value < pivot) {
                left.add(value);
            } else if (value == pivot) {
                middle.add(value);
            } else {
                right.add(value);
            }
        }

        return concatenate(
                introSortRecursive(left.stream().mapToInt(i -> i).toArray(), maxDepth - 1),
                middle.stream().mapToInt(i -> i).toArray(),
                introSortRecursive(right.stream().mapToInt(i -> i).toArray(), maxDepth - 1)
        );
    }

    private static int[] concatenate(int[] left, int[] middle, int[] right) {
        int[] result = new int[left.length + middle.length + right.length];
        int index = 0;

        for (int value : left) {
            result[index++] = value;
        }
        for (int value : middle) {
            result[index++] = value;
        }
        for (int value : right) {
            result[index++] = value;
        }

        return result;
    }
}
