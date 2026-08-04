#include <stddef.h>

typedef int (*linear_search_match_fn)(const void *item, const void *target);

typedef struct {
    int found; 
    size_t index; 
    size_t inspected; 
} linear_search_result;

linear_search_result linear_search_first(
    const void *base,
    size_t length,
    size_t width,
    const void *target,
    linear_search_match_fn matches 
) {
    linear_search_result result = {0, 0, 0};

    if (base == NULL || width == 0 || matches == NULL) {
        return result;
    }

    const unsigned char *items = base; 

    for (size_t index = 0; index < length; index++) {
        result.inspected += 1;

        if (matches(items + index * width, target)) {
            result.found = 1; 
            result.index = index;
            return result;
        }
    }

    return result;
}
