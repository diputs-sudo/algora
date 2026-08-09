public class ParametricSearchProduction {
    private static boolean canShip(int[] weights, int days, int capacity) {
        int usedDays = 1;
        int currentLoad = 0;

        for (int weight : weights) {
            if (currentLoad + weight > capacity) {
                usedDays++;
                currentLoad = 0;
                if (usedDays > days) {
                    return false;
                }
            }
            currentLoad += weight;
        }

        return true;
    }

    public static int minimumShipCapacity(int[] weights, int days) {
        if (weights == null || weights.length == 0) {
            throw new IllegalArgumentException("weights must not be empty");
        }
        if (days <= 0) {
            throw new IllegalArgumentException("days must be positive");
        }

        int low = weights[0];
        int high = 0;

        for (int weight : weights) {
            low = Math.max(low, weight);
            high += weight;
        }

        while (low < high) {
            int mid = low + (high - low) / 2;

            if (canShip(weights, days, mid)) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        return low;
    }
}
