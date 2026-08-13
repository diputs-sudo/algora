# Algora

[Open Algora](https://diputs-sudo.github.io/algora/)

An attempt to put everything I wish I had when learning algorithms into one place.

It lets you run algorithms step by step, see what they are doing internally,
read explanations, and compare different algorithms.

## Why I Built This

I started building Algora after a friend asked me for help with USACO. While
helping them, I started thinking back to how I learned algorithms myself and
how much easier some of the concepts could have been with better explanations
and visualizations.

Having gone through the USACO training path myself and reaching Platinum, I
wanted to put together the kind of resource I wish I had when I was learning.
The goal was not just to show how an algorithm works, but to make it easier to
understand why it works, how it behaves, and when it makes sense to use it.

Algora started from that idea and grew into an interactive collection of
algorithm explanations, visualizations, comparisons, and implementations in
multiple languages.

## Features

- Interactive visualizations for sorting and searching algorithms
- Step by step algorithm execution with playback controls
- Algorithm specific workspaces for visualizing internal operations
- Random and custom inputs for experimenting with algorithms
- Quick facts covering time complexity, space complexity, stability, and other properties
- Detailed explanations of how each algorithm works
- Visual walkthroughs for understanding individual algorithm steps
- Pseudocode for each algorithm
- Teaching focused implementations in Python, C, C++, and Java
- Production level implementations in Python, C, C++, and Java
- Algorithm comparison pages for comparing behavior, complexity, and requirements
- Warnings when algorithms are not directly comparable
- Sorting and searching algorithm indexes with filters and properties
- Learning paths that organize algorithms from foundational to advanced topics
- Direct access to individual algorithm pages
- Multiple implementations of each algorithm for both learning and practical use

## Sorting

Algora currently includes:

- [Bitonic Sort](https://diputs-sudo.github.io/algora/html/sorting/bitonic_sort.html)
- [Bubble Sort](https://diputs-sudo.github.io/algora/html/sorting/bubble_sort.html)
- [Bucket Sort](https://diputs-sudo.github.io/algora/html/sorting/bucket_sort.html)
- [Counting Sort](https://diputs-sudo.github.io/algora/html/sorting/counting_sort.html)
- [Heap Sort](https://diputs-sudo.github.io/algora/html/sorting/heap_sort.html)
- [Insertion Sort](https://diputs-sudo.github.io/algora/html/sorting/insertion_sort.html)
- [IntroSort](https://diputs-sudo.github.io/algora/html/sorting/intro_sort.html)
- [Merge Sort](https://diputs-sudo.github.io/algora/html/sorting/merge_sort.html)
- [In Place Merge Sort](https://diputs-sudo.github.io/algora/html/sorting/merge_sort_inplace.html)
- [Quick Sort](https://diputs-sudo.github.io/algora/html/sorting/quick_sort.html)
- [Radix Sort](https://diputs-sudo.github.io/algora/html/sorting/radix_sort.html)
- [Selection Sort](https://diputs-sudo.github.io/algora/html/sorting/selection_sort.html)
- [Shell Sort](https://diputs-sudo.github.io/algora/html/sorting/shell_sort.html)
- [Tim Sort](https://diputs-sudo.github.io/algora/html/sorting/tim_sort.html)
- [Tournament Sort](https://diputs-sudo.github.io/algora/html/sorting/tournament_sort.html)

[Compare Sorting Algorithms](https://diputs-sudo.github.io/algora/html/sorting/compare-sorting.html)

## Searching

Algora currently includes:

- [Binary Search](https://diputs-sudo.github.io/algora/html/searching/binary_search.html)
- [Bitonic Array Search](https://diputs-sudo.github.io/algora/html/searching/bitonic_array_search.html)
- [Exponential Search](https://diputs-sudo.github.io/algora/html/searching/exponential_search.html)
- [Fibonacci Search](https://diputs-sudo.github.io/algora/html/searching/fibonacci_search.html)
- [Fractional Cascading](https://diputs-sudo.github.io/algora/html/searching/fractional_cascading.html)
- [Galloping Search](https://diputs-sudo.github.io/algora/html/searching/galloping_search.html)
- [Hash Table Lookup](https://diputs-sudo.github.io/algora/html/searching/hash_table_lookup.html)
- [Interpolation Search](https://diputs-sudo.github.io/algora/html/searching/interpolation_search.html)
- [Jump Search](https://diputs-sudo.github.io/algora/html/searching/jump_search.html)
- [Linear Search](https://diputs-sudo.github.io/algora/html/searching/linear_search.html)
- [Meta Binary Search](https://diputs-sudo.github.io/algora/html/searching/meta_binary_search.html)
- [Parametric Search](https://diputs-sudo.github.io/algora/html/searching/parametric_search.html)
- [Quickselect](https://diputs-sudo.github.io/algora/html/searching/quickselect.html)
- [Rotated Sorted Array Search](https://diputs-sudo.github.io/algora/html/searching/rotated_sorted_array_search.html)
- [Sentinel Linear Search](https://diputs-sudo.github.io/algora/html/searching/sentinel_linear_search.html)
- [Ternary Search](https://diputs-sudo.github.io/algora/html/searching/ternary_search.html)
- [Uniform Binary Search](https://diputs-sudo.github.io/algora/html/searching/uniform_binary_search.html)

[Compare Searching Algorithms](https://diputs-sudo.github.io/algora/html/searching/compare-searching.html)

## Algorithm Pages

Each algorithm has its own page with:

- Quick facts and complexity information
- A detailed explanation
- Interactive visualization
- Step by step execution
- Pseudocode
- Teaching implementations
- Production style implementations

## Algorithm Comparison

Algora also has comparison pages for searching and sorting algorithms.

These pages show things such as:

- Time complexity
- Space complexity
- Input requirements
- Strengths and weaknesses
- How the algorithms behave
- Interactive visualizations

The comparison pages also warn when two algorithms are not directly comparable
so that the results are not misleading.

## Multiple Languages

Algorithm implementations are provided in:

- C
- C++
- Java
- Python

The website and interactive visualizers are built with TypeScript.

The repository contains both teaching implementations for learning and production style implementations for practical use.

## Tech Stack

- HTML
- CSS
- TypeScript
- C
- C++
- Java
- Python

## Running Locally

Install the dependencies:

```bash
npm install
```
Start the development server:
```bash
npm run dev
```
Build the project:
```bash
npm run build
```

## License

See [LICENSE](https://github.com/diputs-sudo/algora/blob/main/LICENSE) for details.