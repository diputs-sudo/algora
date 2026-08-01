import java.util.Comparator; 
import java.util.List; 

public final class TimSortProduction {
    private TimSortProduction() {
    }

    public static <T extends Comparable<? super T>> void timSortInPlace(List<T> values) {
        timSortInPlace(values, Comparator.naturalOrder());
    }

    public static <T> void timSortInPlace(List<T> values, Comparator<? super T> comparator) {
        if (values == null || comparator == null) {
            throw new IllegalArgumentException("values and comparator must not be null");
        }

        values.sort(comparator);
    }
}
