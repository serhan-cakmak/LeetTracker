export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Problem = {
  id: number;
  title: string;
  difficulty: Difficulty;
  note: string;
  slug: string;
};

export type Chapter = {
  id: string;
  pattern: string;
  title: string;
  shortTitle: string;
  complexity: string;
  intro: string;
  cues: string[];
  insight: string;
  templateTitle: string;
  code: string;
  problems: Problem[];
};

export const chapters: Chapter[] = [
  {
    id: 'arrays', pattern: '01', title: 'Arrays & Hashing', shortTitle: 'Arrays & Hashing', complexity: 'O(n)',
    intro: 'Hash maps trade memory for instant lookup. Use them when you need to remember what you have seen, count occurrences, or match a value with its complement.',
    cues: ['Frequency or duplicate checks', 'Find a pair or complement', 'Group by a computed signature', 'Need faster lookup than a nested loop'],
    insight: 'The key decision is what to store. Store the smallest fact that makes the next lookup immediate: an index, a count, or a normalized signature.',
    templateTitle: 'One-pass lookup',
    code: `seen = {}\nfor i, x in enumerate(nums):\n    need = target - x\n    if need in seen:\n        return [seen[need], i]\n    seen[x] = i`,
    problems: [
      { id: 1, title: 'Two Sum', difficulty: 'Easy', note: 'Store each value after checking for its complement.', slug: 'two-sum' },
      { id: 49, title: 'Group Anagrams', difficulty: 'Medium', note: 'Use a sorted word or 26-count tuple as the key.', slug: 'group-anagrams' },
      { id: 128, title: 'Longest Consecutive Sequence', difficulty: 'Medium', note: 'Only start counting at the beginning of a sequence.', slug: 'longest-consecutive-sequence' },
      { id: 238, title: 'Product of Array Except Self', difficulty: 'Medium', note: 'Combine prefix and suffix products without division.', slug: 'product-of-array-except-self' },
    ],
  },
  {
    id: 'two-pointers', pattern: '02', title: 'Two Pointers & Windows', shortTitle: 'Two Pointers', complexity: 'O(n)',
    intro: 'Two pointers turn many pairwise searches into one pass. A sliding window extends the idea to contiguous ranges whose validity changes as the boundaries move.',
    cues: ['Sorted input with a pair target', 'Palindrome or mirrored comparison', 'Longest or shortest valid subarray', 'Contiguous range with a constraint'],
    insight: 'Move the pointer that can repair the current condition. For a window, expand to explore and shrink only until the invariant is valid again.',
    templateTitle: 'Variable sliding window',
    code: `left = 0\nfor right, x in enumerate(nums):\n    add(x)\n    while window_is_invalid():\n        remove(nums[left])\n        left += 1\n    answer = max(answer, right - left + 1)`,
    problems: [
      { id: 125, title: 'Valid Palindrome', difficulty: 'Easy', note: 'Skip non-alphanumeric characters from both ends.', slug: 'valid-palindrome' },
      { id: 15, title: '3Sum', difficulty: 'Medium', note: 'Sort, fix one value, then solve a two-pointer pair search.', slug: '3sum' },
      { id: 11, title: 'Container With Most Water', difficulty: 'Medium', note: 'Move the shorter wall; it is the limiting side.', slug: 'container-with-most-water' },
      { id: 76, title: 'Minimum Window Substring', difficulty: 'Hard', note: 'Track how many required character counts are satisfied.', slug: 'minimum-window-substring' },
    ],
  },
  {
    id: 'stack', pattern: '03', title: 'Stacks & Monotonic Order', shortTitle: 'Stacks', complexity: 'O(n)',
    intro: 'A stack remembers unfinished work in last-in, first-out order. A monotonic stack additionally removes items that can no longer affect any future answer.',
    cues: ['Nested pairs or undo behavior', 'Next greater or smaller element', 'Expression evaluation', 'Nearest boundary on either side'],
    insight: 'The most useful stack invariant is monotonic order. Each item is pushed and popped at most once, which is why a loop containing pops can still be linear.',
    templateTitle: 'Next greater element',
    code: `stack = []\nfor i, x in enumerate(nums):\n    while stack and nums[stack[-1]] < x:\n        j = stack.pop()\n        answer[j] = i - j\n    stack.append(i)`,
    problems: [
      { id: 20, title: 'Valid Parentheses', difficulty: 'Easy', note: 'Push expected closing brackets, then match as you scan.', slug: 'valid-parentheses' },
      { id: 155, title: 'Min Stack', difficulty: 'Medium', note: 'Store the running minimum beside each value.', slug: 'min-stack' },
      { id: 739, title: 'Daily Temperatures', difficulty: 'Medium', note: 'Keep indices in decreasing temperature order.', slug: 'daily-temperatures' },
      { id: 84, title: 'Largest Rectangle in Histogram', difficulty: 'Hard', note: 'Pop when the right boundary for a height is known.', slug: 'largest-rectangle-in-histogram' },
    ],
  },
  {
    id: 'binary-search', pattern: '04', title: 'Binary Search', shortTitle: 'Binary Search', complexity: 'O(log n)',
    intro: 'Binary search applies whenever the answer space has a monotonic boundary: everything before it fails and everything after it succeeds, or the reverse.',
    cues: ['Sorted values or rotated sorted values', 'Find first or last valid position', 'Minimum feasible capacity or speed', 'A yes/no condition changes only once'],
    insight: 'Do not memorize many variants. Define a predicate, choose whether you want the first true or last false, and preserve that invariant at every boundary update.',
    templateTitle: 'Find first true',
    code: `lo, hi = 0, len(space)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if feasible(mid):\n        hi = mid\n    else:\n        lo = mid + 1\nreturn lo`,
    problems: [
      { id: 704, title: 'Binary Search', difficulty: 'Easy', note: 'Practice exact-target boundaries first.', slug: 'binary-search' },
      { id: 33, title: 'Search in Rotated Sorted Array', difficulty: 'Medium', note: 'At least one half is always sorted.', slug: 'search-in-rotated-sorted-array' },
      { id: 153, title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', note: 'Compare the midpoint with the right boundary.', slug: 'find-minimum-in-rotated-sorted-array' },
      { id: 875, title: 'Koko Eating Bananas', difficulty: 'Medium', note: 'Search the minimum speed that finishes on time.', slug: 'koko-eating-bananas' },
    ],
  },
  {
    id: 'linked-lists', pattern: '05', title: 'Linked Lists', shortTitle: 'Linked Lists', complexity: 'O(n)',
    intro: 'Linked-list questions are pointer choreography. Draw the links, save the next node before rewiring, and use a dummy node to make head changes ordinary.',
    cues: ['Reverse or reorder nodes', 'Detect a cycle', 'Merge sorted chains', 'Find a midpoint or k-th node from the end'],
    insight: 'Fast and slow pointers reveal distance relationships without extra memory. A dummy head removes special cases when the real head might change.',
    templateTitle: 'Iterative reversal',
    code: `prev, curr = None, head\nwhile curr:\n    nxt = curr.next\n    curr.next = prev\n    prev = curr\n    curr = nxt\nreturn prev`,
    problems: [
      { id: 206, title: 'Reverse Linked List', difficulty: 'Easy', note: 'Save next before reversing the current link.', slug: 'reverse-linked-list' },
      { id: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy', note: 'Build from a dummy node and advance one list.', slug: 'merge-two-sorted-lists' },
      { id: 141, title: 'Linked List Cycle', difficulty: 'Easy', note: 'Fast catches slow if a cycle exists.', slug: 'linked-list-cycle' },
      { id: 143, title: 'Reorder List', difficulty: 'Medium', note: 'Find middle, reverse second half, then weave.', slug: 'reorder-list' },
    ],
  },
  {
    id: 'trees', pattern: '06', title: 'Trees & Traversal', shortTitle: 'Trees', complexity: 'O(n)',
    intro: 'Tree problems become manageable when each recursive call has one clear contract. Decide what a node receives from its parent and what it returns upward.',
    cues: ['Hierarchical or nested input', 'Path, depth, ancestor, or subtree', 'Order statistics in a BST', 'Level-by-level processing'],
    insight: 'DFS is ideal when the answer depends on subtrees; BFS is ideal when distance or levels matter. State the return value before writing recursion.',
    templateTitle: 'Postorder recursion',
    code: `def dfs(node):\n    if not node:\n        return base_value\n    left = dfs(node.left)\n    right = dfs(node.right)\n    update_global(left, right)\n    return value_for_parent(left, right)`,
    problems: [
      { id: 104, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', note: 'Depth is one plus the deeper subtree.', slug: 'maximum-depth-of-binary-tree' },
      { id: 102, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', note: 'Snapshot the queue size for each level.', slug: 'binary-tree-level-order-traversal' },
      { id: 98, title: 'Validate Binary Search Tree', difficulty: 'Medium', note: 'Carry strict lower and upper bounds.', slug: 'validate-binary-search-tree' },
      { id: 124, title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', note: 'Return one branch upward; score two branches locally.', slug: 'binary-tree-maximum-path-sum' },
    ],
  },
  {
    id: 'heaps', pattern: '07', title: 'Heaps & Top K', shortTitle: 'Heaps & Top K', complexity: 'O(n log k)',
    intro: 'Use a heap when the problem repeatedly asks for the smallest or largest item while the collection keeps changing. For top K, keep only k candidates.',
    cues: ['“K largest / most frequent / closest”', 'Streaming or live updates', 'Merge K sorted sequences', 'Schedule whichever finishes first'],
    insight: 'A size-k heap does less work than sorting everything and supports streams. Choose a min-heap for the largest k items and evict the smallest candidate.',
    templateTitle: 'Capped heap',
    code: `heap = []\nfor x in nums:\n    heappush(heap, x)\n    if len(heap) > k:\n        heappop(heap)\n# heap now contains the k largest items`,
    problems: [
      { id: 215, title: 'Kth Largest Element in an Array', difficulty: 'Medium', note: 'Keep a min-heap capped at k items.', slug: 'kth-largest-element-in-an-array' },
      { id: 347, title: 'Top K Frequent Elements', difficulty: 'Medium', note: 'Heap frequencies or use frequency buckets.', slug: 'top-k-frequent-elements' },
      { id: 23, title: 'Merge K Sorted Lists', difficulty: 'Hard', note: 'Keep only the current head of each list in the heap.', slug: 'merge-k-sorted-lists' },
      { id: 295, title: 'Find Median from Data Stream', difficulty: 'Hard', note: 'Balance a max-heap lower half with a min-heap upper half.', slug: 'find-median-from-data-stream' },
    ],
  },
  {
    id: 'graphs', pattern: '08', title: 'Graphs & Search', shortTitle: 'Graphs', complexity: 'O(V + E)',
    intro: 'Graphs model relationships rather than hierarchy. Build an adjacency list, track visited nodes, and choose BFS for shortest unweighted distance or DFS for structure.',
    cues: ['Connections, routes, dependencies, or grids', 'Count components or detect a cycle', 'Shortest path with equal edge costs', 'Ordering with prerequisites'],
    insight: 'Grid problems are graph problems in disguise. Mark nodes visited when you enqueue them, not when you dequeue them, to avoid duplicate work.',
    templateTitle: 'Breadth-first search',
    code: `queue = deque([start])\nseen = {start}\nwhile queue:\n    node = queue.popleft()\n    for nxt in graph[node]:\n        if nxt not in seen:\n            seen.add(nxt)\n            queue.append(nxt)`,
    problems: [
      { id: 200, title: 'Number of Islands', difficulty: 'Medium', note: 'Flood-fill each unvisited land component.', slug: 'number-of-islands' },
      { id: 133, title: 'Clone Graph', difficulty: 'Medium', note: 'Map original nodes to their clones while traversing.', slug: 'clone-graph' },
      { id: 207, title: 'Course Schedule', difficulty: 'Medium', note: 'Detect a cycle with DFS states or Kahn’s algorithm.', slug: 'course-schedule' },
      { id: 127, title: 'Word Ladder', difficulty: 'Hard', note: 'BFS by transformation distance; generate neighbors efficiently.', slug: 'word-ladder' },
    ],
  },
  {
    id: 'dynamic-programming', pattern: '09', title: 'Dynamic Programming', shortTitle: 'Dynamic Programming', complexity: 'O(states × choices)',
    intro: 'Dynamic programming stores answers to overlapping subproblems. Start with a brute-force decision tree, define the state that uniquely describes a subproblem, then cache it.',
    cues: ['Count ways or find an optimum', 'Repeated choices create the same remainder', 'Subsequence, partition, or edit operations', 'A greedy choice cannot be proven safe'],
    insight: 'The transition is the solution; the table is only storage. Write the recurrence in words, identify base cases, then choose memoization or bottom-up iteration.',
    templateTitle: 'Memoized decisions',
    code: `@cache\ndef dp(i, state):\n    if i == len(items):\n        return base_case(state)\n    skip = dp(i + 1, state)\n    take = value(i) + dp(i + 1, next_state)\n    return best(skip, take)`,
    problems: [
      { id: 70, title: 'Climbing Stairs', difficulty: 'Easy', note: 'The simplest two-state recurrence.', slug: 'climbing-stairs' },
      { id: 198, title: 'House Robber', difficulty: 'Medium', note: 'At each house, choose take-plus-two-back or skip.', slug: 'house-robber' },
      { id: 322, title: 'Coin Change', difficulty: 'Medium', note: 'Build the best answer for every smaller amount.', slug: 'coin-change' },
      { id: 1143, title: 'Longest Common Subsequence', difficulty: 'Medium', note: 'State is a pair of positions in the two strings.', slug: 'longest-common-subsequence' },
    ],
  },
];

export const totalProblemCount = chapters.reduce((sum, chapter) => sum + chapter.problems.length, 0);
