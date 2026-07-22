import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class QuickSort {

    public static int[] quickSort(int[] arr) {
        if (arr.length <= 1) {
            return Arrays.copyOf(arr, arr.length);
        }

        int pivot = arr[arr.length / 2];
        List<Integer> left = new ArrayList<>();
        List<Integer> middle = new ArrayList<>();
        List<Integer> right = new ArrayList<>();

        for (int value : arr) {
            if (value < pivot) {
                left.add(value);
            } else if (value > pivot) {
                right.add(value);
            } else {
                middle.add(value);
            }
        }

        return concatenate(
                quickSort(left.stream().mapToInt(i -> i).toArray()),
                middle.stream().mapToInt(i -> i).toArray(),
                quickSort(right.stream().mapToInt(i -> i).toArray())
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
