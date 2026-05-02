// ─── GATE Prep ML · data.js ───────────────────────────────────────────────
// All subject metadata and question bank

const SUBJECTS = [
  { id: 'dsa',   name: 'Data Structures & Algorithms', icon: '🌲', desc: 'Trees, graphs, sorting, DP' },
  { id: 'os',    name: 'Operating Systems',             icon: '💻', desc: 'Scheduling, memory, deadlocks' },
  { id: 'dbms',  name: 'Database Management',           icon: '🗄️', desc: 'SQL, normalization, transactions' },
  { id: 'cn',    name: 'Computer Networks',             icon: '🌐', desc: 'TCP/IP, OSI, routing' },
  { id: 'toc',   name: 'Theory of Computation',         icon: '∑',  desc: 'Automata, grammars, Turing' },
  { id: 'maths', name: 'Engineering Mathematics',       icon: '∫',  desc: 'Calculus, linear algebra, probability' },
  { id: 'co',    name: 'Computer Organization',         icon: '⚙️', desc: 'CPU, memory, pipelining' },
  { id: 'algo',  name: 'Algorithms Design',             icon: '🔁', desc: 'Greedy, divide & conquer, NP' },
];

const QUESTIONS = {
  dsa: [
    {
      q: "What is the worst-case time complexity of QuickSort?",
      opts: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
      ans: 1, topic: "Sorting", diff: "medium",
      exp: "QuickSort degrades to O(n²) when the pivot is always the smallest or largest element — e.g., on an already sorted array with naive pivot selection."
    },
    {
      q: "In a max-heap of n elements, where is the smallest element guaranteed to be?",
      opts: ["Root node", "Any leaf node", "Level 2 node", "Second last level"],
      ans: 1, topic: "Heaps", diff: "easy",
      exp: "In a max-heap the smallest element must be at a leaf node, but it can be any leaf — we can't narrow it further without inspection."
    },
    {
      q: "What is the time complexity of finding the k-th smallest element by building a min-heap from n elements then extracting k times?",
      opts: ["O(n + k log n)", "O(n log n)", "O(k log n)", "O(n)"],
      ans: 0, topic: "Heaps", diff: "hard",
      exp: "Build min-heap in O(n) (heapify), then perform k extract-min operations each costing O(log n) → total O(n + k log n)."
    },
    {
      q: "Which data structure provides O(log n) insert and extract-min — ideal for a priority queue?",
      opts: ["AVL Tree", "Min-Heap", "Sorted Array", "Hash Table"],
      ans: 1, topic: "Priority Queue", diff: "easy",
      exp: "A min-heap supports both insert and extract-min in O(log n), making it the standard choice for priority queues."
    },
    {
      q: "The number of structurally distinct binary trees with n nodes equals the n-th:",
      opts: ["Factorial n!", "Power 2^n", "Catalan number C(n)", "Square n²"],
      ans: 2, topic: "Trees", diff: "hard",
      exp: "The count of distinct binary trees with n nodes is the n-th Catalan number: C(n) = (2n)! / ((n+1)! × n!)."
    },
  ],
  os: [
    {
      q: "Which CPU scheduling algorithm minimises average waiting time for a fixed set of processes?",
      opts: ["FCFS", "Round Robin", "SJF (non-preemptive)", "Priority Scheduling"],
      ans: 2, topic: "CPU Scheduling", diff: "medium",
      exp: "SJF (Shortest Job First) is provably optimal for minimising average waiting time in non-preemptive settings."
    },
    {
      q: "Breaking which condition is the most practical way to prevent deadlock?",
      opts: ["Mutual Exclusion", "Hold and Wait", "No Preemption", "Circular Wait"],
      ans: 3, topic: "Deadlock", diff: "medium",
      exp: "Enforcing a global ordering on resources (breaking Circular Wait) is the most practical deadlock prevention strategy."
    },
    {
      q: "A paging system has a 2^32-byte address space and 4 KB pages. How many page table entries are needed?",
      opts: ["2^20", "2^22", "2^10", "2^32"],
      ans: 0, topic: "Memory Management", diff: "hard",
      exp: "Number of pages = 2^32 / 2^12 = 2^20. Each page needs one entry, so the page table has 2^20 (≈1 M) entries."
    },
    {
      q: "Which of the following is NOT a necessary condition for deadlock?",
      opts: ["Hold and Wait", "Circular Wait", "Mutual Exclusion", "Preemption Allowed"],
      ans: 3, topic: "Deadlock", diff: "easy",
      exp: "Deadlock requires: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait. Allowing preemption actually prevents deadlock."
    },
    {
      q: "In the Banker's algorithm, a state is safe if:",
      opts: [
        "All processes can finish simultaneously",
        "There exists at least one sequence in which all processes can complete",
        "No process is currently blocked",
        "Available resources exceed total process demands"
      ],
      ans: 1, topic: "Deadlock Avoidance", diff: "hard",
      exp: "A safe state requires at least one safe sequence — an ordering where each process can eventually obtain the resources it needs and complete."
    },
  ],
  dbms: [
    {
      q: "A relation in 3NF but NOT in BCNF means:",
      opts: [
        "It has multivalued dependencies",
        "Every FD has a superkey as determinant",
        "There exists X→Y where X is not a superkey but Y is a prime attribute",
        "It has partial dependencies on a candidate key"
      ],
      ans: 2, topic: "Normalization", diff: "hard",
      exp: "A relation can be in 3NF but not BCNF when a non-superkey determines a prime attribute (part of some candidate key)."
    },
    {
      q: "Which SQL clause filters aggregated groups produced by GROUP BY?",
      opts: ["WHERE", "FILTER", "HAVING", "SELECT"],
      ans: 2, topic: "SQL", diff: "easy",
      exp: "HAVING filters groups after aggregation. WHERE filters individual rows before grouping occurs."
    },
    {
      q: "Serializability in transaction management means:",
      opts: [
        "Transactions execute strictly one after another",
        "Concurrent execution yields the same result as some serial execution",
        "All transactions are ACID compliant",
        "No deadlock can occur between transactions"
      ],
      ans: 1, topic: "Transactions", diff: "medium",
      exp: "A schedule is serializable if its outcome is equivalent to that of some serial (non-interleaved) execution of the same transactions."
    },
    {
      q: "What does 'D' stand for in the ACID properties of transactions?",
      opts: ["Distributed", "Durability", "Deterministic", "Data Integrity"],
      ans: 1, topic: "Transactions", diff: "easy",
      exp: "Durability guarantees that once a transaction commits, its effects persist even after a system crash."
    },
    {
      q: "In a B+ tree of order m, leaf nodes can hold at most how many search keys?",
      opts: ["m − 1", "m", "⌈m/2⌉ − 1", "2m"],
      ans: 1, topic: "Indexing", diff: "hard",
      exp: "In B+ trees, leaf nodes store up to m−1 or m keys (implementation-dependent); order m means up to m child pointers in internal nodes, while leaves hold data keys directly."
    },
  ],
  cn: [
    {
      q: "Which OSI layer is responsible for logical (IP) addressing and routing between networks?",
      opts: ["Data Link", "Transport", "Network", "Session"],
      ans: 2, topic: "OSI Model", diff: "easy",
      exp: "The Network layer (Layer 3) handles logical addressing using IP addresses and routes packets between different networks."
    },
    {
      q: "The TCP Maximum Segment Size (MSS) is:",
      opts: [
        "Fixed at 1460 bytes for all connections",
        "Negotiated during the 3-way handshake",
        "Always equal to the link MTU",
        "Set unilaterally by the receiver"
      ],
      ans: 1, topic: "TCP", diff: "medium",
      exp: "MSS is announced by each endpoint in its SYN segment during the TCP 3-way handshake; each side communicates the maximum it is willing to receive."
    },
    {
      q: "Dijkstra's shortest path algorithm fails when a graph has:",
      opts: [
        "Dense connections between nodes",
        "Negative weight edges",
        "Directed (asymmetric) edges",
        "Multiple shortest paths"
      ],
      ans: 1, topic: "Routing", diff: "medium",
      exp: "Dijkstra's greedy approach assumes the discovered shortest path to a node can never improve — an assumption broken by negative weight edges."
    },
    {
      q: "CRC (Cyclic Redundancy Check) error detection is based on:",
      opts: ["Arithmetic checksum addition", "Polynomial long division", "Parity bit insertion", "Hamming distance codes"],
      ans: 1, topic: "Error Control", diff: "medium",
      exp: "CRC treats the bit string as a polynomial, divides it by a generator polynomial, and appends the remainder as the error-detection code."
    },
    {
      q: "For sliding-window flow control with window size W, the maximum channel utilisation is:",
      opts: [
        "W × (RTT / T_t)",
        "min(1, W × T_t / (RTT + T_t))",
        "W / RTT²",
        "1 / W"
      ],
      ans: 1, topic: "Flow Control", diff: "hard",
      exp: "Utilisation = min(1, W × T_t / (RTT + T_t)). Window size W allows W frames in flight; once W is large enough to fill the pipe, utilisation hits 100%."
    },
  ],
  toc: [
    {
      q: "A language is regular if and only if it is recognised by a:",
      opts: ["Context-Free Grammar", "Turing Machine", "Finite Automaton", "Pushdown Automaton"],
      ans: 2, topic: "Regular Languages", diff: "easy",
      exp: "By the Myhill–Nerode theorem, the class of regular languages is exactly the class recognised by finite automata (DFA / NFA)."
    },
    {
      q: "The Pumping Lemma for regular languages states that for any long-enough string w in language L (|w| ≥ p):",
      opts: [
        "w = xyz where |xy| ≤ p, |y| ≥ 1, and xy^i z ∈ L for all i ≥ 0",
        "w cannot be a member of L",
        "w must contain a substring of exactly length p",
        "xy^i z ∉ L for some particular i"
      ],
      ans: 0, topic: "Pumping Lemma", diff: "hard",
      exp: "The lemma guarantees: w = xyz with |xy| ≤ p, |y| ≥ 1, and xy^i z ∈ L for all i ≥ 0. Its contrapositive is used to prove a language is NOT regular."
    },
    {
      q: "Which of the following problems is undecidable?",
      opts: [
        "Membership testing in a regular language",
        "Emptiness testing for context-free languages",
        "The Halting Problem for Turing machines",
        "Equivalence of two deterministic finite automata"
      ],
      ans: 2, topic: "Decidability", diff: "medium",
      exp: "The Halting Problem is the canonical undecidable problem — no algorithm can decide whether an arbitrary Turing machine halts on a given input."
    },
    {
      q: "A Pushdown Automaton (PDA) recognises exactly the class of:",
      opts: [
        "Regular languages",
        "Context-Free Languages",
        "Context-Sensitive Languages",
        "Recursively Enumerable Languages"
      ],
      ans: 1, topic: "PDAs", diff: "easy",
      exp: "PDAs augment finite automata with a stack, exactly capturing the Context-Free Languages (CFL) by the Chomsky hierarchy."
    },
    {
      q: "Non-deterministic Turing machines (NTM) accept:",
      opts: [
        "Strictly more languages than deterministic TMs",
        "Exactly the same languages as deterministic TMs",
        "Only recursively enumerable languages, unlike deterministic TMs",
        "Only recursive (decidable) languages"
      ],
      ans: 1, topic: "Turing Machines", diff: "hard",
      exp: "NTMs and DTMs are equivalent in expressive power — both recognise exactly the recursively enumerable (RE) languages."
    },
  ],
  maths: [
    {
      q: "The eigenvalues of a 2×2 matrix A are 2 and 3. What is det(A)?",
      opts: ["5", "6", "1", "Indeterminate without the full matrix"],
      ans: 1, topic: "Linear Algebra", diff: "easy",
      exp: "The determinant of a matrix equals the product of its eigenvalues: det(A) = 2 × 3 = 6."
    },
    {
      q: "For a normal distribution N(μ, σ²), approximately what fraction of values lie within one standard deviation of the mean?",
      opts: ["68%", "95%", "99%", "50%"],
      ans: 0, topic: "Probability", diff: "easy",
      exp: "The empirical rule: ≈68% within ±1σ, ≈95% within ±2σ, ≈99.7% within ±3σ."
    },
    {
      q: "Which matrix identity does NOT hold in general for n×n matrices A and B?",
      opts: [
        "(A + B)² = A² + 2AB + B²",
        "det(AB) = det(A) · det(B)",
        "tr(AB) = tr(BA)",
        "A(B + C) = AB + AC"
      ],
      ans: 0, topic: "Linear Algebra", diff: "medium",
      exp: "(A+B)² = A² + AB + BA + B², which equals A² + 2AB + B² only when AB = BA (commutative). In general AB ≠ BA."
    },
    {
      q: "What is lim(x → 0) [sin x / x]?",
      opts: ["0", "∞", "1", "Undefined"],
      ans: 2, topic: "Calculus", diff: "easy",
      exp: "A fundamental limit: lim(x→0) sin(x)/x = 1. Proved via the squeeze theorem or L'Hôpital's rule."
    },
    {
      q: "For a Poisson distribution with parameter λ, the variance equals:",
      opts: ["λ²", "λ", "√λ", "1/λ"],
      ans: 1, topic: "Probability", diff: "medium",
      exp: "For Poisson(λ), both the mean and the variance are equal to λ — a distinctive property of this distribution."
    },
  ],
  co: [
    {
      q: "An ideal 4-stage pipeline offers a maximum speedup of:",
      opts: ["2×", "4×", "8×", "Depends on data hazards encountered"],
      ans: 1, topic: "Pipelining", diff: "easy",
      exp: "Ideal speedup equals the number of pipeline stages. With 4 stages, maximum speedup is 4×; hazards reduce it in practice."
    },
    {
      q: "Which addressing mode embeds the operand value directly inside the instruction word?",
      opts: ["Direct", "Indirect", "Immediate", "Register"],
      ans: 2, topic: "Addressing Modes", diff: "easy",
      exp: "Immediate addressing stores the operand value in the instruction itself, so no extra memory fetch is needed to obtain the operand."
    },
    {
      q: "Cache hit time = 1 cycle, miss penalty = 100 cycles, hit rate = 90%. Average Memory Access Time (AMAT) is:",
      opts: ["10.9 cycles", "11 cycles", "10 cycles", "9.1 cycles"],
      ans: 0, topic: "Cache Memory", diff: "hard",
      exp: "AMAT = Hit time + (Miss rate × Miss penalty) = 1 + 0.10 × 100 = 1 + 10 = 11 cycles (parallel) or using AMAT = h×1 + (1−h)×(1+100) = 0.9 + 10.1 = 11. Using AMAT = 1 + MR×MP gives 10.9 under the inclusion model."
    },
    {
      q: "Booth's algorithm is designed to perform:",
      opts: ["Floating-point addition", "Binary division", "Signed integer multiplication", "Memory address calculation"],
      ans: 2, topic: "Arithmetic", diff: "medium",
      exp: "Booth's algorithm multiplies signed 2's complement integers efficiently by reducing the number of additions/subtractions needed."
    },
    {
      q: "In a write-back cache policy, when is main memory actually updated?",
      opts: [
        "On every write, immediately",
        "Only when the dirty cache block is evicted",
        "Writes bypass the cache entirely",
        "The cache is write-protected"
      ],
      ans: 1, topic: "Cache Memory", diff: "medium",
      exp: "Write-back caches write only to the cache initially; the dirty block is written to main memory only when it is replaced, reducing memory traffic."
    },
  ],
  algo: [
    {
      q: "Kruskal's MST algorithm uses which data structure for efficient cycle detection?",
      opts: ["Stack", "Queue", "Union-Find (Disjoint Set Union)", "Min-Heap"],
      ans: 2, topic: "Graph Algorithms", diff: "medium",
      exp: "Kruskal's uses DSU (Union-Find) to check whether two endpoints are already connected. If they are, adding the edge would create a cycle."
    },
    {
      q: "The fractional knapsack problem is solved optimally by:",
      opts: [
        "Dynamic programming on all subsets",
        "Backtracking with pruning",
        "Greedy selection by value-to-weight ratio",
        "Branch and bound"
      ],
      ans: 2, topic: "Greedy", diff: "easy",
      exp: "Sort items by value/weight ratio (descending) and greedily take as much of the highest-ratio item as possible. This greedy choice is provably optimal for the fractional variant."
    },
    {
      q: "The time complexity of the Floyd-Warshall all-pairs shortest path algorithm is:",
      opts: ["O(V²)", "O(V³)", "O(V² log V)", "O(E log V)"],
      ans: 1, topic: "Dynamic Programming", diff: "medium",
      exp: "Floyd-Warshall iterates over all pairs of vertices for each intermediate vertex — three nested V-loops give O(V³)."
    },
    {
      q: "Which of the following is NP-complete?",
      opts: [
        "Minimum Spanning Tree",
        "Single-source shortest path (no negative cycles)",
        "Travelling Salesman Problem (decision version)",
        "Topological Sort of a DAG"
      ],
      ans: 2, topic: "NP Completeness", diff: "hard",
      exp: "The decision version of TSP ('Does a tour of cost ≤ k exist?') is NP-complete. The optimisation version is NP-hard."
    },
    {
      q: "By the Master Theorem for T(n) = aT(n/b) + f(n): if f(n) = O(n^(log_b a − ε)) for some ε > 0, then:",
      opts: [
        "T(n) = Θ(f(n))",
        "T(n) = Θ(n^(log_b a))",
        "T(n) = Θ(f(n) · log n)",
        "The theorem does not apply"
      ],
      ans: 1, topic: "Algorithm Analysis", diff: "hard",
      exp: "Master Theorem Case 1: when f(n) is polynomially dominated by n^(log_b a), the recursion dominates and T(n) = Θ(n^(log_b a))."
    },
  ],
};
