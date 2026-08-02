public class FibonacciSearch {

    public static int fibonacciSearch(int[] arr, int target) {
        int n = arr.length;

        if (n == 0) return -1;

        int fibMm2 = 0;
        int fibMm1 = 1;
        int fibM = fibMm2 + fibMm1;

        while (fibM < n) {
            fibMm2 = fibMm1;
            fibMm1 = fibM;
            fibM = fibMm2 + fibMm1;
        }

        int offset = -1;

        while (fibM > 1) {
            int index = Math.min(offset + fibMm2, n - 1);

            if (arr[index] < target) {
                fibM = fibMm1;
                fibMm1 = fibMm2;
                fibMm2 = fibM - fibMm1;
                offset = index;
            } else if (arr[index] > target) {
                fibM = fibMm2;
                fibMm1 -= fibMm2;
                fibMm2 = fibM - fibMm1;
            } else {
                return index;
            }
        }

        if (fibMm1 == 1 && offset + 1 < n && arr[offset + 1] == target) {
            return offset + 1;
        }

        return -1;
    }
}
