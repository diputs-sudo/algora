public class SentinelLinearSearch {
    public static int sentinelLinearSearch(int[] array, int target) {
        if (array.length == 0) return -1;

        int lastIndex = array.length - 1;
        int savedLast = array[lastIndex];
        array[lastIndex] = target;

        int index = 0;
        while (array[index] != target) {
            index++;
        }

        array[lastIndex] = savedLast;

        if (index < lastIndex || savedLast == target) {
            return index;
        }

        return -1;
    }
}
