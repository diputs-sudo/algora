import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

public final class BucketSortProduction {

    private static final int DEFAULT_MAX_BUCKETS = 10_000;

    private BucketSortProduction() {
    }

    public static List<Double> bucketSort(List<Double> values, double bucketSize) {
        return bucketSort(values, bucketSize, DEFAULT_MAX_BUCKETS);
    }

    public static List<Double> bucketSort(List<Double> values, double bucketSize, int maxBuckets) {
        Objects.requireNonNull(values, "values");

        if (bucketSize <= 0.0 || !Double.isFinite(bucketSize)) {
            throw new IllegalArgumentException("bucketSize must be finite and greater than zero");
        }

        if (maxBuckets <= 0) {
            throw new IllegalArgumentException("maxBuckets must be greater than zero");
        }

        if (values.isEmpty()) {
            return new ArrayList<>();
        }

        for (double value : values) {
            if (!Double.isFinite(value)) {
                throw new IllegalArgumentException("bucketSort only accepts finite numeric values");
            }
        }

        double minimum = Collections.min(values);
        double maximum = Collections.max(values);
        int bucketCount = (int)((maximum - minimum) / bucketSize) + 1;

        if (bucketCount > maxBuckets) {
            List<Double> result = new ArrayList<>(values);
            Collections.sort(result);
            return result;
        }

        List<List<Double>> buckets = new ArrayList<>(bucketCount);

        for (int index = 0; index < bucketCount; index++) {
            buckets.add(new ArrayList<>());
        }

        for (double value : values) {
            int index = (int)((value - minimum) / bucketSize);
            buckets.get(Math.min(index, bucketCount - 1)).add(value);
        }

        List<Double> result = new ArrayList<>(values.size());

        for (List<Double> bucket : buckets) {
            Collections.sort(bucket);
            result.addAll(bucket);
        }

        return result;
    }
}
