import java.util.HashMap;
import java.util.Map;
import java.util.OptionalInt;

public final class HashSearchProduction {
    private final Map<Integer, Integer> indexByValue;

    public HashSearchProduction(int[] values) {
        if (values == null) {
            throw new IllegalArgumentException("values must not be null");
        }

        indexByValue = new HashMap<>(Math.max(16, values.length * 2));

        for (int index = 0; index < values.length; index++) {
            indexByValue.putIfAbsent(values[index], index);
        }
    }

    public OptionalInt find(int target) {
        Integer index = indexByValue.get(target);
        return index == null ? OptionalInt.empty() : OptionalInt.of(index);
    }

    public static int hashSearch(int[] values, int target) {
        return new HashSearchProduction(values).find(target).orElse(-1);
    }
}
