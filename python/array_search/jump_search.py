import math 


def jump_search(arr, target):
    n = len(arr)

    if n == 0:
        return -1 

    step = int(math.sqrt(n))
    previous = 0 
    current = 0 

    while current < n and arr[current] < target: 
        previous = current
        current += step 

    for index in range(previous, min(current + 1, n)):
        if arr[index] == target:
            return index 

    return -1 
