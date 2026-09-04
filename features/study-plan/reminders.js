/**
 * The pre-practice reference material shared by the full app and the generated
 * standalone HTML. Keep snippets concrete: this is meant to replace a trip to
 * an external solution page when a pattern has gone rusty.
 */
export const chapterReminders = {
  arrays: {
    blurb:
      'Most array problems become linear once you store the right fact about the prefix you have already seen.',
    checklist: [
      'Can a hash map turn the question into a complement or frequency lookup?',
      'Is this a contiguous range? Write prefix[j + 1] - prefix[i] before anything else.',
      'Can two directional passes or in-place index placement remove extra memory?',
    ],
    pitfalls: [
      'Seed prefix-count maps with {0: 1}; otherwise ranges beginning at index 0 disappear.',
      'For longest ranges store the first index, but for counting ranges store frequencies.',
    ],
    patterns: [
      {
        name: 'Hash map: complement or frequency',
        complexity: 'O(n) time · O(n) space',
        trigger: 'Pairs, duplicates, grouping, or “have I seen the value I need?”',
        invariant: 'The map describes only values from the already-processed prefix.',
        code: `seen = {}\nfor i, x in enumerate(nums):\n    need = target - x\n    if need in seen:\n        return [seen[need], i]\n    seen[x] = i`,
      },
      {
        name: 'Prefix sums + hash map',
        complexity: 'O(n) time · O(n) space',
        trigger: 'Count subarrays whose sum is k, or match a balance/remainder across a range.',
        invariant: 'sum(i..j) = prefix[j] - prefix[i-1], so look for prefix - k.',
        code: `count = 0\nprefix = 0\nfreq = {0: 1}\nfor x in nums:\n    prefix += x\n    count += freq.get(prefix - k, 0)\n    freq[prefix] = freq.get(prefix, 0) + 1\nreturn count`,
      },
      {
        name: 'Prefix + suffix products',
        complexity: 'O(n) time · O(1) extra space',
        trigger: 'Answer for each index needs everything to its left and right.',
        invariant: 'answer[i] holds the left product before the reverse pass adds the right product.',
        code: `ans = [1] * len(nums)\nprefix = 1\nfor i in range(len(nums)):\n    ans[i] = prefix\n    prefix *= nums[i]\nsuffix = 1\nfor i in range(len(nums) - 1, -1, -1):\n    ans[i] *= suffix\n    suffix *= nums[i]`,
      },
      {
        name: 'Cyclic index placement',
        complexity: 'O(n) time · O(1) space',
        trigger: 'Values belong to a bounded range such as 1..n and missing/duplicate values matter.',
        invariant: 'Whenever possible, value x is moved to index x - 1; every swap fixes a position.',
        code: `i = 0\nwhile i < len(nums):\n    x = nums[i]\n    correct = x - 1\n    if 1 <= x <= len(nums) and nums[correct] != x:\n        nums[i], nums[correct] = nums[correct], nums[i]\n    else:\n        i += 1\n# first i with nums[i] != i + 1 is missing`,
      },
    ],
  },
  'two-pointers': {
    blurb:
      'Pointers are safe only when moving one boundary permanently rules out answers. State why that move is safe.',
    checklist: [
      'Sorted pair problem: start at both ends and move the side that makes the sum improve.',
      'Contiguous longest/shortest problem: name the window invariant and what makes it invalid.',
      'Fixed-size window: add the new item and remove the item that just expired.',
    ],
    pitfalls: [
      'A variable window for sum constraints usually requires non-negative values.',
      'When skipping duplicates in 3Sum, do it after recording a result and while pointers remain ordered.',
    ],
    patterns: [
      {
        name: 'Opposite-direction pointers',
        complexity: 'O(n) after sorting',
        trigger: 'Sorted pair/triplet target, palindrome, or a range limited by one of its ends.',
        invariant: 'A comparison proves that one endpoint cannot participate in a better answer.',
        code: `left, right = 0, len(nums) - 1\nwhile left < right:\n    total = nums[left] + nums[right]\n    if total == target: return [left, right]\n    if total < target:\n        left += 1\n    else:\n        right -= 1`,
      },
      {
        name: 'Variable sliding window',
        complexity: 'O(n) time · O(alphabet) space',
        trigger: 'Longest or shortest contiguous range with a condition repairable from the left.',
        invariant: 'After the while-loop, [left, right] is valid and left moved only forward.',
        code: `left = 0\nfor right, x in enumerate(items):\n    add(x)\n    while window_is_invalid():\n        remove(items[left])\n        left += 1\n    answer = max(answer, right - left + 1)`,
      },
      {
        name: 'Fixed window + counts',
        complexity: 'O(n) time · O(alphabet) space',
        trigger: 'Every candidate range has exactly k items, such as anagrams or rolling averages.',
        invariant: 'Before evaluating, the counter represents exactly items[right-k+1:right+1].',
        code: `count = Counter()\nfor right, x in enumerate(items):\n    count[x] += 1\n    if right >= k:\n        old = items[right - k]\n        count[old] -= 1\n        if count[old] == 0: del count[old]\n    if right >= k - 1:\n        evaluate(count)`,
      },
      {
        name: 'Monotonic deque window',
        complexity: 'O(n) time · O(k) space',
        trigger: 'Maximum or minimum inside every size-k window.',
        invariant: 'Deque indices are unexpired and their values decrease from front to back.',
        code: `q, ans = deque(), []\nfor i, x in enumerate(nums):\n    while q and q[0] <= i - k: q.popleft()\n    while q and nums[q[-1]] <= x: q.pop()\n    q.append(i)\n    if i >= k - 1: ans.append(nums[q[0]])`,
      },
    ],
  },
  stack: {
    blurb:
      'A stack keeps unfinished work. Monotonic stacks keep only unfinished candidates that can still win.',
    checklist: [
      'What does one stack entry represent: a value, index, start boundary, or saved outer state?',
      'What event resolves the item on top?',
      'Can every item be pushed and popped at most once?',
    ],
    pitfalls: [
      'Store indices when the answer needs distance or boundaries.',
      'For histogram problems, flush the stack with a trailing zero or handle remaining bars afterward.',
    ],
    patterns: [
      {
        name: 'Matching / parsing stack',
        complexity: 'O(n) time · O(n) space',
        trigger: 'Nested brackets, decoding, expressions, or undo in reverse order.',
        invariant: 'The stack contains exactly the open contexts not yet closed.',
        code: `pairs = {')': '(', ']': '[', '}': '{'}\nstack = []\nfor ch in s:\n    if ch not in pairs:\n        stack.append(ch)\n    elif not stack or stack.pop() != pairs[ch]:\n        return False\nreturn not stack`,
      },
      {
        name: 'Next greater monotonic stack',
        complexity: 'O(n) time · O(n) space',
        trigger: 'Next greater/smaller value, waiting days, or nearest boundary.',
        invariant: 'Unresolved indices stay in decreasing value order.',
        code: `answer = [0] * len(nums)\nstack = []\nfor i, x in enumerate(nums):\n    while stack and nums[stack[-1]] < x:\n        j = stack.pop()\n        answer[j] = i - j\n    stack.append(i)`,
      },
      {
        name: 'Histogram with start indices',
        complexity: 'O(n) time · O(n) space',
        trigger: 'Largest rectangle or a contribution bounded by the first smaller item.',
        invariant: 'Stack heights increase; each entry remembers how far left that height can extend.',
        code: `best, stack = 0, []\nfor i, h in enumerate(heights + [0]):\n    start = i\n    while stack and stack[-1][1] > h:\n        start, height = stack.pop()\n        best = max(best, height * (i - start))\n    stack.append((start, h))`,
      },
    ],
  },
  'binary-search': {
    blurb:
      'Binary search is boundary finding. Decide what is monotonic and whether you need the first true or last false position.',
    checklist: [
      'Write the predicate in one sentence before the loop.',
      'Choose a closed [lo, hi] search for an exact target or half-open [lo, hi) for a boundary.',
      'For answer search, prove the lower and upper bounds are valid.',
    ],
    pitfalls: [
      'Use mid = (lo + hi) // 2 and make every branch shrink the interval.',
      'With duplicates in rotated arrays, equality may destroy the sorted-half signal.',
    ],
    patterns: [
      {
        name: 'Exact target search',
        complexity: 'O(log n) time',
        trigger: 'Find one exact value in sorted data.',
        invariant: 'If target exists, it remains inside the closed interval [lo, hi].',
        code: `lo, hi = 0, len(nums) - 1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if nums[mid] == target: return mid\n    if nums[mid] < target: lo = mid + 1\n    else: hi = mid - 1\nreturn -1`,
      },
      {
        name: 'Lower bound / first true',
        complexity: 'O(log n) time',
        trigger: 'First index >= target, first valid time, or left edge of equal values.',
        invariant: 'Everything before lo is false; hi is an exclusive candidate boundary.',
        code: `lo, hi = 0, len(nums)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if nums[mid] >= target:\n        hi = mid\n    else:\n        lo = mid + 1\nreturn lo`,
      },
      {
        name: 'Binary search on the answer',
        complexity: 'O(log(range) × check)',
        trigger: 'Minimum speed/capacity/time that makes a monotonic feasibility test pass.',
        invariant: 'hi is feasible; values below lo have been proven infeasible.',
        code: `lo, hi = minimum, maximum\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if feasible(mid):\n        hi = mid\n    else:\n        lo = mid + 1\nreturn lo`,
      },
      {
        name: 'Rotated sorted array',
        complexity: 'O(log n) time',
        trigger: 'A sorted array was rotated once and contains distinct values.',
        invariant: 'At least one half is normally sorted; keep the half that can contain target.',
        code: `lo, hi = 0, len(nums) - 1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if nums[mid] == target: return mid\n    if nums[lo] <= nums[mid]:\n        if nums[lo] <= target < nums[mid]: hi = mid - 1\n        else: lo = mid + 1\n    else:\n        if nums[mid] < target <= nums[hi]: lo = mid + 1\n        else: hi = mid - 1`,
      },
    ],
  },
  'linked-lists': {
    blurb:
      'Linked-list questions are safer when you name the links that must survive before changing any pointer.',
    checklist: [
      'Can a dummy node remove a special case at the head?',
      'Save next before writing current.next.',
      'For distance questions, create a fixed gap or use fast/slow pointers.',
    ],
    pitfalls: [
      'Return the dummy’s next node, not the dummy itself.',
      'Before reversing a group, confirm that the full group exists and save group_next.',
    ],
    patterns: [
      {
        name: 'Iterative reversal',
        complexity: 'O(n) time · O(1) space',
        trigger: 'Reverse a whole list or reuse as one phase of reorder/palindrome problems.',
        invariant: 'prev is the completely reversed prefix; curr begins the untouched suffix.',
        code: `prev, curr = None, head\nwhile curr:\n    nxt = curr.next\n    curr.next = prev\n    prev = curr\n    curr = nxt\nreturn prev`,
      },
      {
        name: 'Fast and slow pointers',
        complexity: 'O(n) time · O(1) space',
        trigger: 'Middle, cycle, cycle entry, or nth node from the end.',
        invariant: 'Fast advances twice per slow step; inside a cycle their relative distance closes.',
        code: `slow = fast = head\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next\n    if slow is fast:\n        slow = head\n        while slow is not fast:\n            slow, fast = slow.next, fast.next\n        return slow  # cycle entry\nreturn None`,
      },
      {
        name: 'Dummy node + fixed gap',
        complexity: 'O(n) time · O(1) space',
        trigger: 'Delete nth from end or splice where the real head might change.',
        invariant: 'Fast stays n + 1 links ahead, so slow stops immediately before the target.',
        code: `dummy = ListNode(0, head)\nslow = fast = dummy\nfor _ in range(n + 1):\n    fast = fast.next\nwhile fast:\n    slow, fast = slow.next, fast.next\nslow.next = slow.next.next\nreturn dummy.next`,
      },
    ],
  },
  intervals: {
    blurb:
      'Sorting turns global overlap into a local decision. Pick the representation: merged ranges, endpoint events, or an active heap.',
    checklist: [
      'Are touching endpoints overlapping? Translate the wording into < versus <=.',
      'Do you need the ranges themselves, the maximum overlap, or the smallest active range?',
      'Choose sort order deliberately, especially for equal starts.',
    ],
    pitfalls: [
      'For closed intervals, [1,2] and [2,3] overlap at 2.',
      'At equal times, event ordering depends on whether an ending interval frees capacity before a start.',
    ],
    patterns: [
      {
        name: 'Sort and merge',
        complexity: 'O(n log n) time',
        trigger: 'Merge, insert, or return covered ranges.',
        invariant: 'merged[-1] is the only previous range that can overlap the next sorted interval.',
        code: `intervals.sort(key=lambda x: x[0])\nmerged = []\nfor start, end in intervals:\n    if not merged or start > merged[-1][1]:\n        merged.append([start, end])\n    else:\n        merged[-1][1] = max(merged[-1][1], end)`,
      },
      {
        name: 'Sweep line / difference events',
        complexity: 'O(n log n) time',
        trigger: 'Maximum simultaneous load, rooms, passengers, or coverage.',
        invariant: 'The running total after an event equals the active load at that coordinate.',
        code: `events = []\nfor start, end, value in ranges:\n    events.append((start, value))\n    events.append((end, -value))\nactive = best = 0\nfor _, delta in sorted(events):\n    active += delta\n    best = max(best, active)`,
      },
      {
        name: 'Active intervals min-heap',
        complexity: 'O(n log n) time',
        trigger: 'Allocate rooms/resources or answer queries while intervals become eligible and expire.',
        invariant: 'The heap contains only active candidates and exposes the one ending soonest.',
        code: `intervals.sort()\nheap = []\nfor start, end in intervals:\n    while heap and heap[0] < start:\n        heappop(heap)\n    heappush(heap, end)\n    answer = max(answer, len(heap))`,
      },
      {
        name: 'Greedy by earliest finish',
        complexity: 'O(n log n) time',
        trigger: 'Keep the most non-overlapping intervals or remove the fewest overlaps.',
        invariant: 'Keeping the earliest finish leaves at least as much room for every future interval.',
        code: `intervals.sort(key=lambda x: x[1])\nkept, last_end = 0, float('-inf')\nfor start, end in intervals:\n    if start >= last_end:\n        kept += 1\n        last_end = end\nremoved = len(intervals) - kept`,
      },
    ],
  },
  trees: {
    blurb:
      'Before coding recursion, finish this sentence: “dfs(node) returns …”. That contract determines the base case and combine step.',
    checklist: [
      'Does the answer flow upward from children, downward from ancestors, or both?',
      'Use BFS when level or minimum unweighted distance is the natural unit.',
      'In a BST, exploit strict bounds or sorted inorder traversal.',
    ],
    pitfalls: [
      'A global path may use two child branches, but the value returned to a parent can use only one.',
      'BST validation requires ancestor bounds, not only parent-child comparisons.',
    ],
    patterns: [
      {
        name: 'Postorder return contract',
        complexity: 'O(n) time · O(height) stack',
        trigger: 'Height, balance, diameter, maximum path, or any answer combining both children.',
        invariant: 'Each call returns exactly the summary its parent needs; local/global answers stay separate.',
        code: `answer = 0\ndef dfs(node):\n    global answer\n    if not node: return 0\n    left = max(0, dfs(node.left))\n    right = max(0, dfs(node.right))\n    answer = max(answer, left + node.val + right)\n    return node.val + max(left, right)`,
      },
      {
        name: 'Level-order BFS',
        complexity: 'O(n) time · O(width) space',
        trigger: 'Levels, right-side view, or minimum number of edges from the root.',
        invariant: 'Snapshotting len(queue) isolates exactly one depth level.',
        code: `q, levels = deque([root]), []\nwhile q:\n    level = []\n    for _ in range(len(q)):\n        node = q.popleft()\n        level.append(node.val)\n        if node.left: q.append(node.left)\n        if node.right: q.append(node.right)\n    levels.append(level)`,
      },
      {
        name: 'BST validation with bounds',
        complexity: 'O(n) time · O(height) stack',
        trigger: 'Validate ordering or carry ancestor constraints down a tree.',
        invariant: 'Every node must lie strictly inside all bounds inherited from ancestors.',
        code: `def valid(node, low=float('-inf'), high=float('inf')):\n    if not node: return True\n    if not low < node.val < high: return False\n    return (valid(node.left, low, node.val) and\n            valid(node.right, node.val, high))`,
      },
      {
        name: 'Iterative inorder',
        complexity: 'O(n) time · O(height) space',
        trigger: 'Kth smallest in a BST or sorted traversal without recursion.',
        invariant: 'The stack is the path to the next smallest unvisited node.',
        code: `stack, node = [], root\nwhile stack or node:\n    while node:\n        stack.append(node)\n        node = node.left\n    node = stack.pop()\n    visit(node)\n    node = node.right`,
      },
    ],
  },
  tries: {
    blurb:
      'A trie turns each prefix into a state. It is worth the memory when many words share prefixes or one search branches character by character.',
    checklist: [
      'Do you need exact-word state separately from “this prefix exists”?',
      'Can prefix failure prune a whole DFS branch?',
      'If wildcards exist, branch only at the wildcard.',
    ],
    pitfalls: [
      'A node existing does not mean a complete word ends there.',
      'During board search, restore the cell and prune exhausted trie branches after recursion.',
    ],
    patterns: [
      {
        name: 'Trie insert and exact search',
        complexity: 'O(word length) per operation',
        trigger: 'Many prefix or word lookups over the same dictionary.',
        invariant: 'Walking characters reaches the unique node representing that prefix.',
        code: `class Node:\n    def __init__(self):\n        self.children = {}\n        self.word = False\n\ndef insert(word):\n    node = root\n    for ch in word:\n        node = node.children.setdefault(ch, Node())\n    node.word = True`,
      },
      {
        name: 'Wildcard trie DFS',
        complexity: 'O(branches × word length)',
        trigger: 'A query character such as . can match any letter.',
        invariant: 'State is fully described by trie node plus query index.',
        code: `def search(node, i):\n    if i == len(word): return node.word\n    ch = word[i]\n    if ch == '.':\n        return any(search(child, i + 1)\n                   for child in node.children.values())\n    return ch in node.children and search(node.children[ch], i + 1)`,
      },
      {
        name: 'Trie + board backtracking',
        complexity: 'Pruned O(rows × cols × 4^length)',
        trigger: 'Find many dictionary words in one character grid.',
        invariant: 'The current board path and trie node represent the same prefix.',
        code: `def dfs(r, c, node):\n    ch = board[r][c]\n    if ch not in node.children: return\n    nxt = node.children[ch]\n    if nxt.word: answer.add(nxt.word)\n    board[r][c] = '#'\n    for nr, nc in neighbors(r, c): dfs(nr, nc, nxt)\n    board[r][c] = ch`,
      },
    ],
  },
  heaps: {
    blurb:
      'A heap is for repeatedly asking “what is next?” while candidates change. Choose what should sit at the root.',
    checklist: [
      'Top k: keep the opposite extreme at the root so it is easy to evict.',
      'Sorted sources: put one frontier item from each source in the heap.',
      'Median: split values into a lower max-heap and upper min-heap.',
    ],
    pitfalls: [
      'Python heapq is a min-heap; negate priorities for max-heap behavior.',
      'Heap entries may need a stable tie-breaker so Python never compares non-orderable objects.',
    ],
    patterns: [
      {
        name: 'Capped heap for top k',
        complexity: 'O(n log k) time · O(k) space',
        trigger: 'K largest, closest, or most frequent items.',
        invariant: 'The min-heap holds the best k seen; its root is the easiest retained item to evict.',
        code: `heap = []\nfor item in items:\n    heappush(heap, (score(item), item))\n    if len(heap) > k:\n        heappop(heap)\nreturn [item for _, item in heap]`,
      },
      {
        name: 'K-way merge frontier',
        complexity: 'O(total log k) time · O(k) space',
        trigger: 'Merge k sorted lists/rows/streams or repeatedly take the global smallest frontier.',
        invariant: 'Heap contains only the next unconsumed value from each nonempty source.',
        code: `heap = []\nfor source_id, source in enumerate(sources):\n    if source: heappush(heap, (source[0], source_id, 0))\nwhile heap:\n    value, s, i = heappop(heap)\n    output.append(value)\n    if i + 1 < len(sources[s]):\n        heappush(heap, (sources[s][i + 1], s, i + 1))`,
      },
      {
        name: 'Two heaps for streaming median',
        complexity: 'O(log n) add · O(1) median',
        trigger: 'Maintain the median as values arrive.',
        invariant: 'Every lower value <= every upper value, and heap sizes differ by at most one.',
        code: `heappush(lower, -x)\nheappush(upper, -heappop(lower))\nif len(upper) > len(lower):\n    heappush(lower, -heappop(upper))\n# median: -lower[0], or average of both roots`,
      },
      {
        name: 'Sweep + priority queue',
        complexity: 'O(n log n) time',
        trigger: 'Jobs become available over time and the best available job must run next.',
        invariant: 'Before choosing, heap contains every arrived but unfinished job.',
        code: `jobs.sort()\ni = time = 0\nheap = []\nwhile i < len(jobs) or heap:\n    if not heap: time = max(time, jobs[i][0])\n    while i < len(jobs) and jobs[i][0] <= time:\n        arrival, duration, idx = jobs[i]\n        heappush(heap, (duration, idx))\n        i += 1\n    duration, idx = heappop(heap)\n    time += duration`,
      },
    ],
  },
  backtracking: {
    blurb:
      'Backtracking is DFS over decisions. The reusable skeleton is choose, recurse, undo; pruning determines whether it finishes.',
    checklist: [
      'What exactly is one recursion level choosing?',
      'Does the next call use i, i + 1, or a fresh full candidate set?',
      'Sort first if it enables pruning or same-level duplicate skipping.',
    ],
    pitfalls: [
      'Append path.copy(), not the mutable path object.',
      'Skip duplicates only among sibling choices at the same recursion depth.',
    ],
    patterns: [
      {
        name: 'Subsets / combinations',
        complexity: 'O(2^n) output-sensitive',
        trigger: 'Choose any subset or combinations where order does not matter.',
        invariant: 'start prevents generating the same chosen set in a different order.',
        code: `answer = []\ndef dfs(start, path):\n    answer.append(path.copy())\n    for i in range(start, len(nums)):\n        path.append(nums[i])\n        dfs(i + 1, path)\n        path.pop()\ndfs(0, [])`,
      },
      {
        name: 'Permutations with used state',
        complexity: 'O(n · n!) time',
        trigger: 'Arrange every item; order matters and each index is used once.',
        invariant: 'used identifies exactly the indices already present in path.',
        code: `def dfs(path, used):\n    if len(path) == len(nums):\n        answer.append(path.copy()); return\n    for i, x in enumerate(nums):\n        if i in used: continue\n        used.add(i); path.append(x)\n        dfs(path, used)\n        path.pop(); used.remove(i)`,
      },
      {
        name: 'Duplicate-safe sorted choices',
        complexity: 'Output-sensitive',
        trigger: 'Input contains equal values but output combinations must be unique.',
        invariant: 'At one depth, only the first occurrence of an equal choice starts a branch.',
        code: `nums.sort()\ndef dfs(start, path):\n    answer.append(path.copy())\n    for i in range(start, len(nums)):\n        if i > start and nums[i] == nums[i - 1]:\n            continue\n        path.append(nums[i])\n        dfs(i + 1, path)\n        path.pop()`,
      },
      {
        name: 'Grid choose / restore',
        complexity: 'O(cells × branches^word length)',
        trigger: 'Construct a path on a board without reusing a cell.',
        invariant: 'A marked cell is used only by the current recursion path.',
        code: `def dfs(r, c, i):\n    if i == len(word): return True\n    if out(r, c) or board[r][c] != word[i]: return False\n    ch, board[r][c] = board[r][c], '#'\n    found = any(dfs(r + dr, c + dc, i + 1) for dr, dc in DIRS)\n    board[r][c] = ch\n    return found`,
      },
    ],
  },
  graphs: {
    blurb:
      'Model the state and neighbors first. Then choose DFS for components, BFS for unweighted distance, topological sort for dependencies, or DSU for connectivity.',
    checklist: [
      'What is a node, and can the same logical node include extra state such as keys or stops?',
      'Mark visited when enqueuing, not when dequeuing.',
      'For grids, decide whether to mutate the grid or keep a separate seen set.',
    ],
    pitfalls: [
      'A directed cycle test needs visiting/visited states; one boolean is not enough for DFS.',
      'Build adjacency for nodes with zero outgoing edges too when topologically sorting.',
    ],
    patterns: [
      {
        name: 'DFS flood fill / components',
        complexity: 'O(V + E) time',
        trigger: 'Count components, islands, regions, or explore every reachable state.',
        invariant: 'Every reached node is marked before recursively exploring its neighbors.',
        code: `def dfs(node):\n    if node in seen: return\n    seen.add(node)\n    for nxt in graph[node]:\n        dfs(nxt)\n\nfor node in graph:\n    if node not in seen:\n        components += 1\n        dfs(node)`,
      },
      {
        name: 'Multi-source BFS',
        complexity: 'O(V + E) time',
        trigger: 'Minimum unweighted distance from any source, spreading, or nearest facility.',
        invariant: 'The queue processes states in nondecreasing distance; each node enters once.',
        code: `q = deque(sources)\nseen = set(sources)\ndistance = 0\nwhile q:\n    for _ in range(len(q)):\n        node = q.popleft()\n        for nxt in graph[node]:\n            if nxt not in seen:\n                seen.add(nxt); q.append(nxt)\n    distance += 1`,
      },
      {
        name: 'Kahn topological sort',
        complexity: 'O(V + E) time',
        trigger: 'Prerequisites, dependency order, or directed-cycle detection.',
        invariant: 'The queue contains exactly remaining nodes with no unmet prerequisites.',
        code: `q = deque(node for node in nodes if indegree[node] == 0)\norder = []\nwhile q:\n    node = q.popleft(); order.append(node)\n    for nxt in graph[node]:\n        indegree[nxt] -= 1\n        if indegree[nxt] == 0: q.append(nxt)\nreturn order if len(order) == len(nodes) else []`,
      },
      {
        name: 'Union Find (DSU)',
        complexity: 'Near O(1) amortized per operation',
        trigger: 'Edges arrive over time; detect cycles, merge accounts, or count components.',
        invariant: 'Each set has one representative; path compression and union by size keep trees shallow.',
        code: `parent = list(range(n)); size = [1] * n\ndef find(x):\n    while x != parent[x]:\n        parent[x] = parent[parent[x]]\n        x = parent[x]\n    return x\ndef union(a, b):\n    ra, rb = find(a), find(b)\n    if ra == rb: return False\n    if size[ra] < size[rb]: ra, rb = rb, ra\n    parent[rb] = ra; size[ra] += size[rb]\n    return True`,
      },
    ],
  },
  'advanced-graphs': {
    blurb:
      'Edge properties choose the algorithm: BFS for unit weights, Dijkstra for non-negative weights, Bellman-Ford for bounded edges/negative weights, and MST algorithms for cheapest connectivity.',
    checklist: [
      'Are weights non-negative, and is path cost additive or a max/min bottleneck?',
      'Does state need an extra dimension such as stops used?',
      'Are you finding a path, connecting all nodes, consuming every edge, or finding bridges?',
    ],
    pitfalls: [
      'Dijkstra cannot finalize shortest paths with negative edges.',
      'For itinerary/Hierholzer, append on the way back and reverse at the end.',
    ],
    patterns: [
      {
        name: 'Dijkstra shortest path',
        complexity: 'O((V + E) log V)',
        trigger: 'Shortest or minimum-bottleneck path with non-negative edge costs.',
        invariant: 'When the cheapest non-stale heap entry is popped, that distance is final.',
        code: `dist = {source: 0}\nheap = [(0, source)]\nwhile heap:\n    cost, node = heappop(heap)\n    if cost != dist[node]: continue\n    for nxt, weight in graph[node]:\n        new = cost + weight\n        if new < dist.get(nxt, float('inf')):\n            dist[nxt] = new\n            heappush(heap, (new, nxt))`,
      },
      {
        name: 'Bellman-Ford by edge count',
        complexity: 'O(K · E) time',
        trigger: 'Negative edges or shortest route limited to at most K stops/edges.',
        invariant: 'After round i, dist uses at most i edges; each round reads the previous snapshot.',
        code: `dist = [float('inf')] * n\ndist[source] = 0\nfor _ in range(k + 1):\n    nxt = dist.copy()\n    for u, v, price in edges:\n        if dist[u] != float('inf'):\n            nxt[v] = min(nxt[v], dist[u] + price)\n    dist = nxt`,
      },
      {
        name: 'Kruskal minimum spanning tree',
        complexity: 'O(E log E) time',
        trigger: 'Connect every vertex with minimum total edge weight.',
        invariant: 'Add the lightest edge that joins two currently separate components.',
        code: `cost = used = 0\nfor weight, u, v in sorted(edges):\n    if union(u, v):\n        cost += weight\n        used += 1\n        if used == n - 1: break\nreturn cost if used == n - 1 else -1`,
      },
      {
        name: 'Hierholzer Eulerian route',
        complexity: 'O(E log E) with lexical heaps',
        trigger: 'Use every directed edge exactly once, often with lexical tie-breaking.',
        invariant: 'A node enters the route only after all of its outgoing edges have been consumed.',
        code: `for node in graph: heapify(graph[node])\nroute = []\ndef visit(node):\n    while graph[node]:\n        visit(heappop(graph[node]))\n    route.append(node)\nvisit(start)\nreturn route[::-1]`,
      },
      {
        name: 'Tarjan bridge low-link',
        complexity: 'O(V + E) time',
        trigger: 'Find edges whose removal disconnects an undirected graph.',
        invariant: 'low[u] is the earliest discovery time reachable from u through its subtree plus one back edge.',
        code: `def dfs(u, parent):\n    disc[u] = low[u] = timer.next()\n    for v in graph[u]:\n        if v == parent: continue\n        if v not in disc:\n            dfs(v, u); low[u] = min(low[u], low[v])\n            if low[v] > disc[u]: bridges.append((u, v))\n        else:\n            low[u] = min(low[u], disc[v])`,
      },
    ],
  },
  greedy: {
    blurb:
      'A greedy choice needs a proof. Look for an exchange argument, a dominating prefix invariant, or a choice that leaves maximum freedom.',
    checklist: [
      'What local choice are you committing to, and why can an optimal solution adopt it?',
      'Would sorting by start, end, cost, or frequency expose the safe choice?',
      'Can a running surplus/reach summarize everything needed from the prefix?',
    ],
    pitfalls: [
      'A plausible local choice is not greedy proof; try to construct a counterexample.',
      'If future choices depend on multiple unresolved states, the problem may be DP instead.',
    ],
    patterns: [
      {
        name: 'Farthest reachable prefix',
        complexity: 'O(n) time · O(1) space',
        trigger: 'Each position extends how far the processed prefix can reach.',
        invariant: 'Every index up to farthest is reachable; an index beyond it proves failure.',
        code: `farthest = 0\nfor i, jump in enumerate(nums):\n    if i > farthest:\n        return False\n    farthest = max(farthest, i + jump)\nreturn True`,
      },
      {
        name: 'Kadane maximum subarray',
        complexity: 'O(n) time · O(1) space',
        trigger: 'Best nonempty contiguous sum.',
        invariant: 'current is the best subarray ending exactly at this index; a negative prefix is discarded.',
        code: `current = best = nums[0]\nfor x in nums[1:]:\n    current = max(x, current + x)\n    best = max(best, current)\nreturn best`,
      },
      {
        name: 'Greedy interval selection',
        complexity: 'O(n log n) time',
        trigger: 'Maximize non-overlapping work or minimize removals.',
        invariant: 'Among usable choices, earliest finish leaves the most room for the suffix.',
        code: `intervals.sort(key=lambda x: x[1])\nkept, end = 0, float('-inf')\nfor start, finish in intervals:\n    if start >= end:\n        kept += 1\n        end = finish\nreturn kept`,
      },
      {
        name: 'Two-pass directional constraints',
        complexity: 'O(n) time · O(n) space',
        trigger: 'Each item must satisfy inequalities relative to both neighbors.',
        invariant: 'First pass satisfies left constraints; reverse pass adds right constraints without breaking them.',
        code: `score = [1] * len(ratings)\nfor i in range(1, len(ratings)):\n    if ratings[i] > ratings[i - 1]:\n        score[i] = score[i - 1] + 1\nfor i in range(len(ratings) - 2, -1, -1):\n    if ratings[i] > ratings[i + 1]:\n        score[i] = max(score[i], score[i + 1] + 1)`,
      },
    ],
  },
  'dp-1d': {
    blurb:
      'DP starts with a sentence defining one state. The recurrence follows from enumerating every legal first or last choice.',
    checklist: [
      'Define dp(i) or dp[state] in words, including exactly what remains.',
      'Write base cases before transitions and verify iteration order satisfies dependencies.',
      'Ask whether order matters: permutations and combinations use different loop orders.',
    ],
    pitfalls: [
      'Do not compress memory until the full recurrence and update order are correct.',
      'Use infinity for impossible minimum states and never transition from an impossible state.',
    ],
    patterns: [
      {
        name: 'Take or skip',
        complexity: 'O(n) time · O(1) space',
        trigger: 'At each position choose it (forcing a gap) or skip it.',
        invariant: 'prev1 is the best through the previous item; prev2 is best through two items back.',
        code: `prev2 = prev1 = 0\nfor value in nums:\n    take = prev2 + value\n    skip = prev1\n    prev2, prev1 = prev1, max(take, skip)\nreturn prev1`,
      },
      {
        name: 'Unbounded minimum coin DP',
        complexity: 'O(amount × coins)',
        trigger: 'Minimum number of reusable choices that builds a target amount.',
        invariant: 'dp[a] is the minimum coins for exact amount a using already-computed smaller amounts.',
        code: `dp = [float('inf')] * (amount + 1)\ndp[0] = 0\nfor a in range(1, amount + 1):\n    for coin in coins:\n        if coin <= a:\n            dp[a] = min(dp[a], 1 + dp[a - coin])\nreturn dp[amount] if dp[amount] != float('inf') else -1`,
      },
      {
        name: 'State-machine DP',
        complexity: 'O(n × states)',
        trigger: 'Actions move between a small set of modes such as hold, sold, and rest.',
        invariant: 'Every next state is computed only from valid previous-day states.',
        code: `hold, sold, rest = -prices[0], float('-inf'), 0\nfor price in prices[1:]:\n    next_hold = max(hold, rest - price)\n    next_sold = hold + price\n    next_rest = max(rest, sold)\n    hold, sold, rest = next_hold, next_sold, next_rest\nreturn max(sold, rest)`,
      },
      {
        name: 'LIS tails + lower bound',
        complexity: 'O(n log n) time',
        trigger: 'Length of longest strictly increasing subsequence.',
        invariant: 'tails[i] is the smallest possible ending value of an increasing subsequence of length i + 1.',
        code: `tails = []\nfor x in nums:\n    i = bisect_left(tails, x)\n    if i == len(tails):\n        tails.append(x)\n    else:\n        tails[i] = x\nreturn len(tails)`,
      },
      {
        name: 'Weighted interval scheduling',
        complexity: 'O(n log n) time',
        trigger: 'Choose non-overlapping jobs with maximum total value.',
        invariant: 'dp(i) is best profit using jobs from sorted index i onward.',
        code: `jobs.sort()\nstarts = [job[0] for job in jobs]\n@cache\ndef dp(i):\n    if i == len(jobs): return 0\n    start, end, profit = jobs[i]\n    j = bisect_left(starts, end)\n    return max(dp(i + 1), profit + dp(j))\nreturn dp(0)`,
      },
    ],
  },
  'dp-2d': {
    blurb:
      'Two coordinates mean you must be precise about what one cell represents and which neighboring states are already solved.',
    checklist: [
      'Label axes and say dp[i][j] in a full sentence.',
      'Add an empty row/column when it makes base cases mechanical.',
      'For interval DP, choose the last action so the remaining subintervals become independent.',
    ],
    pitfalls: [
      'Loop direction is part of the recurrence; reversing it can reuse current-row values incorrectly.',
      'For 0/1 knapsack compression, iterate capacity backward; for unbounded choices, iterate forward.',
    ],
    patterns: [
      {
        name: 'Grid path DP',
        complexity: 'O(rows × cols)',
        trigger: 'Count or optimize paths where movement comes from a small set of predecessor cells.',
        invariant: 'Before cell (r,c), its permitted predecessor states are final.',
        code: `dp = [[0] * cols for _ in range(rows)]\ndp[0][0] = 1\nfor r in range(rows):\n    for c in range(cols):\n        if blocked(r, c): dp[r][c] = 0\n        else:\n            if r: dp[r][c] += dp[r - 1][c]\n            if c: dp[r][c] += dp[r][c - 1]`,
      },
      {
        name: 'Longest common subsequence',
        complexity: 'O(nm) time · O(nm) space',
        trigger: 'Match two sequences while preserving order but allowing skips.',
        invariant: 'dp[i][j] is the best answer for suffixes a[i:] and b[j:].',
        code: `dp = [[0] * (m + 1) for _ in range(n + 1)]\nfor i in range(n - 1, -1, -1):\n    for j in range(m - 1, -1, -1):\n        if a[i] == b[j]:\n            dp[i][j] = 1 + dp[i + 1][j + 1]\n        else:\n            dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])`,
      },
      {
        name: 'Edit distance',
        complexity: 'O(nm) time · O(nm) space',
        trigger: 'Minimum insertions, deletions, and replacements to transform one string.',
        invariant: 'dp[i][j] is the edit cost between suffixes word1[i:] and word2[j:].',
        code: `dp = [[0] * (m + 1) for _ in range(n + 1)]\nfor i in range(n + 1): dp[i][m] = n - i\nfor j in range(m + 1): dp[n][j] = m - j\nfor i in range(n - 1, -1, -1):\n    for j in range(m - 1, -1, -1):\n        dp[i][j] = dp[i+1][j+1] if a[i] == b[j] else 1 + min(dp[i+1][j], dp[i][j+1], dp[i+1][j+1])`,
      },
      {
        name: '0/1 knapsack compression',
        complexity: 'O(items × capacity) time',
        trigger: 'Each item may be used at most once under a capacity or target sum.',
        invariant: 'Backward capacity iteration prevents the current item from being reused in the same round.',
        code: `dp = [False] * (capacity + 1)\ndp[0] = True\nfor value in values:\n    for total in range(capacity, value - 1, -1):\n        dp[total] = dp[total] or dp[total - value]\nreturn dp[capacity]`,
      },
      {
        name: 'Interval DP: choose last',
        complexity: 'O(n^3) time · O(n^2) space',
        trigger: 'Removing/splitting inside a range couples neighbors until the final action.',
        invariant: 'Choosing the final item k splits an interval into two already-solved independent intervals.',
        code: `vals = [1] + nums + [1]\ndp = [[0] * len(vals) for _ in vals]\nfor length in range(1, len(nums) + 1):\n    for left in range(1, len(nums) - length + 2):\n        right = left + length - 1\n        dp[left][right] = max(\n            dp[left][k-1] + vals[left-1]*vals[k]*vals[right+1] + dp[k+1][right]\n            for k in range(left, right + 1))`,
      },
    ],
  },
  'bit-math': {
    blurb:
      'Bits compress boolean state; number theory and geometry replace simulation with invariants. Normalize representations before hashing them.',
    checklist: [
      'Write the useful identity first: XOR cancellation, low bit, common prefix, or gcd-normalized direction.',
      'Clarify signed-width behavior because Python integers do not overflow like 32-bit integers.',
      'Use integer pairs instead of floating-point slopes.',
    ],
    pitfalls: [
      'Negative bit operations in Python need an explicit mask when emulating 32-bit behavior.',
      'Normalize slope signs so equivalent directions hash to the same key.',
    ],
    patterns: [
      {
        name: 'XOR cancellation',
        complexity: 'O(n) time · O(1) space',
        trigger: 'Every value appears an even number of times except one, or one index/value is missing.',
        invariant: 'x ^ x = 0 and x ^ 0 = x, independent of order.',
        code: `result = 0\nfor i, value in enumerate(nums):\n    result ^= i ^ value\nresult ^= len(nums)\nreturn result  # missing number from 0..n`,
      },
      {
        name: 'Remove the lowest set bit',
        complexity: 'O(number of set bits)',
        trigger: 'Count set bits or repeatedly isolate binary choices.',
        invariant: 'n & (n - 1) clears exactly the least-significant 1 bit.',
        code: `count = 0\nwhile n:\n    n &= n - 1\n    count += 1\nreturn count`,
      },
      {
        name: 'Binary exponentiation',
        complexity: 'O(log |n|) time',
        trigger: 'Compute a power without multiplying n times.',
        invariant: 'At each bit, result × base^exponent equals the original power.',
        code: `if n < 0: x, n = 1 / x, -n\nresult = 1\nwhile n:\n    if n & 1:\n        result *= x\n    x *= x\n    n >>= 1\nreturn result`,
      },
      {
        name: 'Add without +',
        complexity: 'O(word size)',
        trigger: 'Implement integer addition with bit operations.',
        invariant: 'XOR is sum without carry; shifted AND is the carry for the next round.',
        code: `mask = 0xFFFFFFFF\nwhile b & mask:\n    carry = ((a & b) << 1) & mask\n    a = (a ^ b) & mask\n    b = carry\nreturn a if a <= 0x7FFFFFFF else ~(a ^ mask)`,
      },
      {
        name: 'Normalized slope hashing',
        complexity: 'O(n²) time',
        trigger: 'Count points sharing a line without floating-point error.',
        invariant: 'Reduced signed (dy, dx) is identical for every point on one direction from an anchor.',
        code: `for i, (x1, y1) in enumerate(points):\n    count = Counter()\n    for x2, y2 in points[i + 1:]:\n        dx, dy = x2 - x1, y2 - y1\n        g = gcd(dx, dy)\n        dx, dy = dx // g, dy // g\n        if dx < 0 or (dx == 0 and dy < 0): dx, dy = -dx, -dy\n        count[(dy, dx)] += 1`,
      },
    ],
  },
};
