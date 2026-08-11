def rotated_sorted_array_search(values, target):
    low = 0 
    high = len(values) - 1 

    while low <= high: 
        mid = low + (high - low) // 2 

        if values[mid] == target: 
            return mid 

        if values[low] == values[mid] == values[high]:
            low += 1
            high -= 1 
        elif values[low] <= values[mid]:
            if values[low] <= target < values[mid]:
                high = mid - 1
            else: 
                low = mid + 1
        else: 
            if values[mid] < target <= values[high]:
                low = mid + 1
            else:
                high = mid - 1

    return -1
