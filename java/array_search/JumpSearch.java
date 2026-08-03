public class JumpSearch {

    public static int jumpSearch(int[] arr, int target) {
        int n = arr.length;

        if (n == 0) return -1;

        int step = (int) Math.sqrt(n);
        if (step < 1) step = 1;

        int previous = 0;
        int current = 0;
        
        while (current < n && arr[current] < target) {
            previous = current;
            current += step;
        }

        int end = Math.min(current + 1, n);
        for (int i = previous; i < end; i++) {
            if (arr[i] == target) return i;
        }

        return -1;
    }
}
