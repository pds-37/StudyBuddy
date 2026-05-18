import type {
  ApproachGuide,
  CompanyPrepDifficulty,
  CompanyPrepRole,
  CompanyTypeProfile
} from "@studybuddy/shared";

export type CompanyTypeSeed = CompanyTypeProfile;

export type PrepQuestionSeed = {
  id: string;
  title: string;
  difficulty: CompanyPrepDifficulty;
  topics: string[];
  roleTags: CompanyPrepRole[];
  companyTypes: Array<{
    companyTypeId: string;
    frequency: number;
    lastSeen: string;
    stage: string;
  }>;
  approach: ApproachGuide;
  sourceRefs: Array<{ label: string; url?: string }>;
};

function stage(
  order: number,
  name: string,
  format: string,
  duration: string,
  evaluationSignals: string[],
  preparationTips: string[],
  eliminationRisk: "low" | "medium" | "high"
) {
  return { order, name, format, duration, evaluationSignals, preparationTips, eliminationRisk };
}

export const COMPANY_TYPE_SEEDS: CompanyTypeSeed[] = [
  {
    id: "mass-recruiter-service",
    name: "Mass Recruiter / IT Services",
    summary: "High-volume campus and early-career hiring with aptitude screens, coding basics, communication rounds, and trainability checks.",
    hiringFrequency: "very-high",
    selectivity: "mass",
    difficulty: "easy",
    roleTags: ["Software Engineer", "Frontend", "Backend", "Full Stack"],
    focusAreas: ["Aptitude", "DSA Basics", "SQL", "OOP", "Communication"],
    exampleCompanies: ["TCS", "Infosys", "Wipro", "Cognizant", "Accenture"],
    procedure: [
      stage(1, "Registration and eligibility screen", "Resume/profile shortlisting by branch, CGPA, backlog, and graduation year.", "1-7 days", ["Eligibility fit", "Profile completeness"], ["Keep resume concise", "Use exact education and skill keywords"], "low"),
      stage(2, "Aptitude and verbal assessment", "Quantitative aptitude, logical reasoning, verbal ability, and basic CS MCQs.", "60-120 minutes", ["Accuracy under time pressure", "Basic CS breadth"], ["Practice arithmetic speed", "Revise DBMS, OS, OOP, networking basics"], "high"),
      stage(3, "Coding assessment", "One or two easy-to-medium coding problems with arrays, strings, loops, hashing, or SQL.", "45-90 minutes", ["Clean implementation", "Edge case handling", "Language fluency"], ["Master arrays and strings", "Write dry runs before submitting"], "medium"),
      stage(4, "Technical interview", "Project discussion, OOP, SQL, basic DSA, and internship/academic work.", "25-45 minutes", ["Concept clarity", "Honest project ownership", "Communication"], ["Prepare one project deeply", "Explain tradeoffs in simple language"], "medium"),
      stage(5, "HR and offer discussion", "Behavioral fit, location flexibility, joining timeline, and compensation basics.", "15-30 minutes", ["Professionalism", "Motivation", "Reliability"], ["Prepare intro and strengths", "Know why you want the role"], "low")
    ],
    questionMix: [
      { topic: "Arrays", weight: 18 },
      { topic: "Strings", weight: 18 },
      { topic: "SQL", weight: 14 },
      { topic: "OOP", weight: 12 },
      { topic: "Aptitude", weight: 18 },
      { topic: "Behavioral", weight: 20 }
    ],
    lastUpdated: "2026-05"
  },
  {
    id: "product-giant",
    name: "Product Giants / FAANG-like",
    summary: "Selective engineering hiring centered on DSA depth, system design judgment, behavioral signals, and consistent problem-solving communication.",
    hiringFrequency: "medium",
    selectivity: "elite",
    difficulty: "hard",
    roleTags: ["Software Engineer", "Frontend", "Backend", "Full Stack", "AI", "DevOps"],
    focusAreas: ["DSA", "System Design", "Problem Solving", "Behavioral", "Scalability"],
    exampleCompanies: ["Google", "Microsoft", "Meta", "Apple", "Adobe"],
    procedure: [
      stage(1, "Recruiter screen", "Role fit, resume depth, eligibility, compensation expectations, and interview logistics.", "20-30 minutes", ["Role alignment", "Communication", "Resume credibility"], ["Explain your strongest project in 90 seconds", "Know your target role"], "low"),
      stage(2, "Online assessment", "Two algorithmic problems, often medium difficulty with one harder optimization.", "70-120 minutes", ["Optimal complexity", "Bug-free implementation", "Edge cases"], ["Practice medium DSA daily", "Write complexity before coding"], "high"),
      stage(3, "Technical coding loops", "Three to five live interviews across arrays, graphs, DP, trees, and data structures.", "45-60 minutes each", ["Think-aloud clarity", "Pattern recognition", "Tradeoff discussion"], ["Practice explaining brute force to optimal", "Ask clarifying questions"], "high"),
      stage(4, "System design or role depth", "Backend design, frontend architecture, ML design, or engineering depth depending on level.", "45-60 minutes", ["Scalability reasoning", "API/data modeling", "Reliability tradeoffs"], ["Use requirements to drive design", "Discuss bottlenecks and monitoring"], "medium"),
      stage(5, "Behavioral and hiring committee", "Structured behavioral review, feedback packet, team matching, and final approval.", "1-2 weeks", ["Ownership", "Collaboration", "Learning velocity"], ["Prepare STAR stories", "Show impact and reflection"], "medium")
    ],
    questionMix: [
      { topic: "Graphs", weight: 18 },
      { topic: "Dynamic Programming", weight: 18 },
      { topic: "Trees", weight: 16 },
      { topic: "System Design", weight: 20 },
      { topic: "Behavioral", weight: 12 },
      { topic: "Arrays", weight: 16 }
    ],
    lastUpdated: "2026-05"
  },
  {
    id: "ecommerce-marketplace",
    name: "E-commerce / Marketplace",
    summary: "Fast-moving product engineering roles with DSA, low-level design, operational problem solving, and customer-scale systems.",
    hiringFrequency: "high",
    selectivity: "selective",
    difficulty: "hard",
    roleTags: ["Software Engineer", "Backend", "Full Stack", "Data", "DevOps"],
    focusAreas: ["DSA", "Low Level Design", "Distributed Systems", "Ownership", "Operational Metrics"],
    exampleCompanies: ["Amazon", "Flipkart", "Meesho", "Myntra", "Instacart"],
    procedure: [
      stage(1, "Application and recruiter screen", "Resume fit, team fit, availability, compensation, and role scope.", "20-30 minutes", ["Relevant projects", "Product sense", "Communication"], ["Connect projects to scale", "Know business metrics"], "low"),
      stage(2, "Online assessment", "Coding plus work-style or debugging questions; arrays, heaps, graphs, and greedy show up often.", "90-150 minutes", ["Speed", "Correctness", "Operational judgment"], ["Practice timed sets", "Review heap and graph patterns"], "high"),
      stage(3, "Coding interview", "Live DSA with emphasis on correctness, edge cases, and explaining constraints.", "45-60 minutes", ["Algorithm selection", "Clean code", "Test cases"], ["Narrate assumptions", "Test with boundary values"], "high"),
      stage(4, "Design round", "Design carts, order systems, inventory, payments, notification, or feed/ranking systems.", "45-60 minutes", ["Data modeling", "Consistency tradeoffs", "Failure handling"], ["State scale assumptions", "Discuss idempotency and retries"], "medium"),
      stage(5, "Bar raiser / values round", "Ownership stories, ambiguity handling, conflict, customer obsession, and high standards.", "45-60 minutes", ["Ownership", "Bias for action", "Learn from failure"], ["Prepare measurable stories", "Discuss what changed after failure"], "medium")
    ],
    questionMix: [
      { topic: "Heaps", weight: 14 },
      { topic: "Graphs", weight: 16 },
      { topic: "Arrays", weight: 16 },
      { topic: "System Design", weight: 24 },
      { topic: "Greedy", weight: 12 },
      { topic: "Behavioral", weight: 18 }
    ],
    lastUpdated: "2026-05"
  },
  {
    id: "fintech-payments",
    name: "Fintech / Payments",
    summary: "Engineering interviews blend DSA, backend fundamentals, data integrity, security, concurrency, and product risk thinking.",
    hiringFrequency: "medium",
    selectivity: "selective",
    difficulty: "hard",
    roleTags: ["Software Engineer", "Backend", "Full Stack", "Data"],
    focusAreas: ["DSA", "Databases", "Concurrency", "Security", "Ledger Design"],
    exampleCompanies: ["PhonePe", "Razorpay", "Paytm", "Stripe", "CRED"],
    procedure: [
      stage(1, "Recruiter and domain fit", "Role scope, backend/data experience, fintech interest, and compensation logistics.", "20-30 minutes", ["Domain curiosity", "Backend credibility"], ["Review payments vocabulary", "Prepare API/project examples"], "low"),
      stage(2, "Coding screen", "Medium DSA plus edge-case heavy implementation.", "60-90 minutes", ["Correctness", "Input validation", "Complexity"], ["Practice hash maps, intervals, and graphs", "Be strict about edge cases"], "high"),
      stage(3, "Backend deep dive", "APIs, database transactions, indexes, locks, idempotency, and consistency.", "45-60 minutes", ["Data integrity", "Failure reasoning", "Security basics"], ["Study transactions and idempotency", "Explain schema decisions"], "high"),
      stage(4, "System or product design", "Design a payment flow, wallet ledger, fraud checks, reconciliation, or rate limiter.", "45-60 minutes", ["Correctness under failure", "Observability", "Tradeoffs"], ["Talk about retries and reconciliation", "Design audit trails"], "medium"),
      stage(5, "Culture and risk judgment", "Ownership, trust, handling incidents, and user impact.", "30-45 minutes", ["Reliability mindset", "Calm under pressure"], ["Prepare incident/debugging story", "Show accountability"], "medium")
    ],
    questionMix: [
      { topic: "Hashing", weight: 14 },
      { topic: "Databases", weight: 18 },
      { topic: "System Design", weight: 26 },
      { topic: "Security", weight: 12 },
      { topic: "Concurrency", weight: 12 },
      { topic: "Arrays", weight: 18 }
    ],
    lastUpdated: "2026-05"
  },
  {
    id: "early-stage-startup",
    name: "Early-stage Startup",
    summary: "Practical interviews focused on shipping ability, product intuition, debugging, ownership, and enough DSA to trust fundamentals.",
    hiringFrequency: "high",
    selectivity: "balanced",
    difficulty: "medium",
    roleTags: ["Software Engineer", "Frontend", "Backend", "Full Stack", "AI"],
    focusAreas: ["Projects", "Debugging", "APIs", "Product Sense", "Ownership"],
    exampleCompanies: ["Seed startups", "Series A startups", "Founder-led product teams", "AI SaaS startups"],
    procedure: [
      stage(1, "Founder or hiring manager screen", "Motivation, speed, ownership, role fit, and startup comfort.", "20-40 minutes", ["Bias to ship", "Clarity", "Ownership"], ["Show what you built", "Explain why startups fit you"], "medium"),
      stage(2, "Practical coding task", "Small feature, debugging exercise, API endpoint, UI component, or take-home assignment.", "1-6 hours", ["Working product", "Code readability", "Tradeoffs"], ["Keep scope tight", "Write a short README or notes"], "high"),
      stage(3, "Technical discussion", "Walk through your code, project architecture, decisions, and improvements.", "45-60 minutes", ["Ownership", "System thinking", "Honesty"], ["Know every file you wrote", "Prepare future improvements"], "medium"),
      stage(4, "Pairing or live fix", "Debug a bug, add a feature, or reason through product behavior with the interviewer.", "45-90 minutes", ["Collaboration", "Debug method", "Adaptability"], ["Think aloud", "Ask what success means"], "medium"),
      stage(5, "Culture and offer", "Work style, ambiguity tolerance, compensation, equity, and joining expectations.", "30-45 minutes", ["Motivation", "Resilience", "Team fit"], ["Ask about runway and expectations", "Clarify role scope"], "low")
    ],
    questionMix: [
      { topic: "Projects", weight: 24 },
      { topic: "APIs", weight: 16 },
      { topic: "Frontend", weight: 14 },
      { topic: "Databases", weight: 14 },
      { topic: "DSA Basics", weight: 12 },
      { topic: "Behavioral", weight: 20 }
    ],
    lastUpdated: "2026-05"
  },
  {
    id: "saas-enterprise",
    name: "SaaS / Enterprise Product",
    summary: "Balanced product engineering loops: DSA basics, framework depth, API design, maintainability, testing, and customer-facing reliability.",
    hiringFrequency: "medium",
    selectivity: "balanced",
    difficulty: "medium",
    roleTags: ["Software Engineer", "Frontend", "Backend", "Full Stack", "DevOps"],
    focusAreas: ["APIs", "Frontend Architecture", "Backend Design", "Testing", "Maintainability"],
    exampleCompanies: ["Zoho", "Freshworks", "Salesforce", "Atlassian", "ServiceNow"],
    procedure: [
      stage(1, "Recruiter screen", "Role scope, experience, stack familiarity, and salary expectations.", "20-30 minutes", ["Role fit", "Stack match"], ["Map your skills to the stack", "Prepare product examples"], "low"),
      stage(2, "Technical assessment", "Coding, SQL, frontend/backend basics, or small product task.", "60-120 minutes", ["Code clarity", "Practical correctness"], ["Practice CRUD and state flows", "Review SQL and APIs"], "medium"),
      stage(3, "Role-depth interview", "Framework internals, API design, testing, debugging, performance, and architecture.", "45-60 minutes", ["Maintainability", "Debugging", "Quality"], ["Explain tradeoffs", "Know test strategy"], "medium"),
      stage(4, "Design or case round", "Design a dashboard, workflow engine, RBAC, notification system, or multi-tenant feature.", "45-60 minutes", ["Product clarity", "Data modeling", "Extensibility"], ["Clarify users and permissions", "Discuss future changes"], "medium"),
      stage(5, "Manager and culture", "Communication, ownership, customer empathy, and long-term growth.", "30-45 minutes", ["Reliability", "Team collaboration"], ["Use STAR stories", "Show learning mindset"], "low")
    ],
    questionMix: [
      { topic: "APIs", weight: 18 },
      { topic: "Frontend", weight: 16 },
      { topic: "Databases", weight: 16 },
      { topic: "System Design", weight: 18 },
      { topic: "Testing", weight: 12 },
      { topic: "DSA Basics", weight: 20 }
    ],
    lastUpdated: "2026-05"
  },
  {
    id: "ai-ml-lab",
    name: "AI / ML Product Lab",
    summary: "Applied AI hiring with Python, ML fundamentals, evaluation, data intuition, retrieval systems, and product safety reasoning.",
    hiringFrequency: "medium",
    selectivity: "selective",
    difficulty: "hard",
    roleTags: ["AI", "Software Engineer", "Backend", "Data"],
    focusAreas: ["Python", "ML Fundamentals", "Evaluation", "Vector Search", "System Design"],
    exampleCompanies: ["Applied AI startups", "ML platform teams", "Research product labs", "GenAI SaaS companies"],
    procedure: [
      stage(1, "Portfolio and research screen", "Review projects, notebooks, papers, demos, and applied ML experience.", "30-45 minutes", ["Practical ML evidence", "Clear explanation"], ["Prepare one ML project deeply", "Know metrics and failures"], "medium"),
      stage(2, "Python and data assessment", "Python coding, data manipulation, probability/statistics, and model evaluation.", "60-120 minutes", ["Python fluency", "Data reasoning", "Evaluation mindset"], ["Practice Python patterns", "Revise metrics and validation"], "high"),
      stage(3, "ML depth interview", "Model selection, feature engineering, bias/variance, evaluation, retrieval, and deployment.", "45-60 minutes", ["Concept depth", "Tradeoff thinking"], ["Explain why a model failed", "Discuss data quality"], "high"),
      stage(4, "AI system design", "Design recommendations, RAG search, moderation, model serving, or feedback loops.", "45-60 minutes", ["Architecture", "Latency/cost tradeoffs", "Safety"], ["State evaluation criteria", "Discuss monitoring and drift"], "medium"),
      stage(5, "Product and ethics discussion", "User impact, safety, feedback, hallucination risk, and responsible deployment.", "30-45 minutes", ["Judgment", "User empathy", "Risk awareness"], ["Prepare safety examples", "Talk about measurable evals"], "medium")
    ],
    questionMix: [
      { topic: "Python", weight: 14 },
      { topic: "ML Fundamentals", weight: 22 },
      { topic: "Vector Search", weight: 16 },
      { topic: "System Design", weight: 20 },
      { topic: "Statistics", weight: 14 },
      { topic: "Behavioral", weight: 14 }
    ],
    lastUpdated: "2026-05"
  },
  {
    id: "cloud-devops-platform",
    name: "Cloud / DevOps Platform",
    summary: "Infrastructure-heavy hiring with Linux, networking, distributed systems, reliability, automation, and incident response.",
    hiringFrequency: "medium",
    selectivity: "selective",
    difficulty: "hard",
    roleTags: ["DevOps", "Backend", "Software Engineer"],
    focusAreas: ["Linux", "Networking", "Distributed Systems", "Reliability", "Automation"],
    exampleCompanies: ["AWS", "Azure teams", "GCP teams", "HashiCorp", "Datadog"],
    procedure: [
      stage(1, "Recruiter and systems screen", "Role fit, on-call expectations, infrastructure background, and cloud exposure.", "20-30 minutes", ["Systems interest", "Role clarity"], ["Prepare infra stories", "Know your cloud tools"], "low"),
      stage(2, "Technical screen", "Linux, networking, scripting, troubleshooting, and basic coding.", "60-90 minutes", ["Debug method", "Systems fundamentals"], ["Revise TCP/HTTP/DNS", "Practice shell/Python automation"], "high"),
      stage(3, "Coding or automation round", "Implement a parser, scheduler, rate limiter, log analysis, or reliability script.", "45-60 minutes", ["Correctness", "Robustness", "Testing"], ["Handle bad input", "Discuss monitoring"], "medium"),
      stage(4, "System design / SRE round", "Design scalable service, observability, deployment pipeline, cache, queue, or incident response.", "45-60 minutes", ["Reliability", "Failure modes", "Capacity planning"], ["Use SLO/SLA vocabulary", "Discuss rollback and alerts"], "high"),
      stage(5, "Behavioral incident round", "Postmortems, ownership, conflict, and learning from outages.", "30-45 minutes", ["Calm execution", "Accountability"], ["Prepare incident story", "Avoid blame language"], "medium")
    ],
    questionMix: [
      { topic: "Networking", weight: 18 },
      { topic: "System Design", weight: 24 },
      { topic: "Linux", weight: 14 },
      { topic: "Graphs", weight: 10 },
      { topic: "Automation", weight: 16 },
      { topic: "Behavioral", weight: 18 }
    ],
    lastUpdated: "2026-05"
  },
  {
    id: "consulting-tech",
    name: "Consulting Tech / Digital Transformation",
    summary: "Client-facing tech roles evaluate fundamentals, communication, case thinking, implementation breadth, and stakeholder confidence.",
    hiringFrequency: "high",
    selectivity: "balanced",
    difficulty: "medium",
    roleTags: ["Software Engineer", "Frontend", "Backend", "Full Stack", "Data", "DevOps"],
    focusAreas: ["Communication", "SQL", "Case Thinking", "Implementation Basics", "Cloud Basics"],
    exampleCompanies: ["Deloitte", "EY", "PwC", "KPMG", "Capgemini"],
    procedure: [
      stage(1, "Profile and aptitude screen", "Eligibility, aptitude, verbal ability, business awareness, and basic technical breadth.", "60-120 minutes", ["Communication", "Problem solving"], ["Practice aptitude", "Prepare simple tech definitions"], "medium"),
      stage(2, "Technical basics round", "OOP, DBMS, SQL, cloud basics, web fundamentals, and project explanation.", "30-45 minutes", ["Breadth", "Clarity", "Project ownership"], ["Prepare SQL joins", "Explain project business value"], "medium"),
      stage(3, "Case or scenario round", "Client problem, architecture choice, prioritization, or implementation plan.", "30-60 minutes", ["Structured thinking", "Tradeoffs", "Client empathy"], ["Use a clear framework", "Ask constraints before solving"], "medium"),
      stage(4, "Managerial round", "Teamwork, conflict, deadlines, stakeholder handling, and adaptability.", "30-45 minutes", ["Professional maturity", "Client readiness"], ["Use STAR stories", "Quantify impact"], "low"),
      stage(5, "HR and fit", "Location, travel, joining date, salary, and long-term fit.", "15-30 minutes", ["Reliability", "Flexibility"], ["Prepare concise intro", "Know your preferences"], "low")
    ],
    questionMix: [
      { topic: "SQL", weight: 20 },
      { topic: "OOP", weight: 14 },
      { topic: "Cloud Basics", weight: 14 },
      { topic: "Projects", weight: 18 },
      { topic: "Behavioral", weight: 22 },
      { topic: "DSA Basics", weight: 12 }
    ],
    lastUpdated: "2026-05"
  },
  {
    id: "realtime-consumer-platform",
    name: "Realtime Consumer Platform",
    summary: "High-scale consumer roles emphasize DSA, concurrency, feeds, chat, notifications, ranking, reliability, and experimentation.",
    hiringFrequency: "medium",
    selectivity: "selective",
    difficulty: "hard",
    roleTags: ["Software Engineer", "Backend", "Full Stack", "Frontend", "Data"],
    focusAreas: ["Realtime Systems", "Graphs", "Queues", "Caching", "Experimentation"],
    exampleCompanies: ["Hotstar", "Dream11", "Swiggy", "Zomato", "Discord-like teams"],
    procedure: [
      stage(1, "Recruiter screen", "Role fit, product interest, scale experience, and team expectations.", "20-30 minutes", ["Product curiosity", "Scale vocabulary"], ["Know product flows", "Relate projects to users"], "low"),
      stage(2, "Online coding", "DSA with arrays, graphs, heaps, queues, and time-window logic.", "60-120 minutes", ["Pattern speed", "Edge cases"], ["Practice sliding window and graph BFS", "Time yourself"], "high"),
      stage(3, "Live coding", "Medium-to-hard algorithmic problem, debugging, or feature logic.", "45-60 minutes", ["Communication", "Optimization", "Testing"], ["Explain constraints", "Compare approaches"], "high"),
      stage(4, "System design", "Design chat, feed, notification, live score, booking, or ranking service.", "45-60 minutes", ["Latency", "Fanout tradeoffs", "Data freshness"], ["Discuss cache invalidation", "Handle spikes and backpressure"], "high"),
      stage(5, "Product and behavioral", "Metrics, experimentation, ownership, incidents, and cross-functional work.", "30-45 minutes", ["Customer impact", "Ownership", "Learning"], ["Prepare metric-driven stories", "Show how you debugged"], "medium")
    ],
    questionMix: [
      { topic: "Queues", weight: 14 },
      { topic: "Graphs", weight: 16 },
      { topic: "System Design", weight: 26 },
      { topic: "Caching", weight: 14 },
      { topic: "Arrays", weight: 14 },
      { topic: "Behavioral", weight: 16 }
    ],
    lastUpdated: "2026-05"
  }
];

const PATTERNS: Record<string, ApproachGuide> = {
  "Hash Map Lookup": {
    pattern: "Hash Map Lookup",
    signal: "Use it when the question asks for existence, frequency, complements, or fast lookup while scanning.",
    steps: ["Write the brute force check first.", "Identify what value you need to know instantly.", "Store counts, indexes, or complements in a map.", "Update and query the map in one pass when possible."],
    commonMistake: "Checking after insertion when the same element must not match itself.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)"
  },
  "Two Pointers": {
    pattern: "Two Pointers",
    signal: "Sorted input, pair search, palindrome checks, or shrinking from both ends are strong signals.",
    steps: ["Place pointers at meaningful boundaries.", "Move the pointer that can improve the condition.", "Track the best answer before losing the current window.", "Prove why skipped states cannot be optimal."],
    commonMistake: "Using two pointers on unsorted data when order is required.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)"
  },
  "Sliding Window": {
    pattern: "Sliding Window",
    signal: "Contiguous subarray or substring with max/min/longest/shortest language.",
    steps: ["Expand the right edge to include new information.", "Maintain counts or aggregate state.", "Shrink the left edge while the window is invalid.", "Record the answer only when the window satisfies the requirement."],
    commonMistake: "Shrinking only once when the window may remain invalid.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(k)"
  },
  "Prefix Sum": {
    pattern: "Prefix Sum",
    signal: "Subarray sum, range sum, or repeated sum queries.",
    steps: ["Define prefix[i] as the sum before index i.", "Translate each range into a prefix difference.", "Use a map when you need to count earlier prefixes.", "Seed the map with zero prefix for ranges starting at index 0."],
    commonMistake: "Forgetting the initial prefix sum of 0.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)"
  },
  "Graph BFS": {
    pattern: "Graph BFS",
    signal: "Shortest path in unweighted graphs, level-by-level spread, or minimum steps.",
    steps: ["Model states as graph nodes.", "Start with all valid sources when spread is simultaneous.", "Use a queue and visited set.", "Process by levels when distance or time matters."],
    commonMistake: "Marking visited too late and pushing duplicates.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)"
  },
  "Graph DFS": {
    pattern: "Graph DFS",
    signal: "Connected components, reachability, cycle detection, or exhaustive traversal.",
    steps: ["Define neighbors clearly.", "Track visited nodes before recursion.", "Accumulate component state.", "Return status values when detecting cycles or paths."],
    commonMistake: "Using recursion without guarding repeated visits.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)"
  },
  "Dynamic Programming": {
    pattern: "Dynamic Programming",
    signal: "Optimal substructure plus repeated subproblems, often with count/min/max language.",
    steps: ["Define the state in one sentence.", "Write the recurrence from smaller decisions.", "Choose base cases that make index boundaries safe.", "Optimize dimensions only after the tabulation is correct."],
    commonMistake: "Starting with a table before defining what each cell means.",
    timeComplexity: "Depends on state count",
    spaceComplexity: "Depends on state count"
  },
  "Tree Recursion": {
    pattern: "Tree Recursion",
    signal: "Binary tree questions that ask for depth, validity, path, ancestor, or subtree facts.",
    steps: ["Decide what each recursive call returns.", "Handle the null node first.", "Combine left and right results.", "Pass bounds or accumulated state when local checks are not enough."],
    commonMistake: "Checking only parent-child validity for BST problems.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)"
  },
  "Heap / Priority Queue": {
    pattern: "Heap / Priority Queue",
    signal: "Top K, streaming median, scheduling, merging sorted streams, or repeated min/max extraction.",
    steps: ["Identify the priority key.", "Choose min-heap or max-heap based on what must be removed.", "Keep heap size bounded when only K items matter.", "For streaming problems, rebalance heaps after every insert."],
    commonMistake: "Sorting every step instead of maintaining a heap.",
    timeComplexity: "O(n log k)",
    spaceComplexity: "O(k)"
  },
  "Binary Search on Answer": {
    pattern: "Binary Search on Answer",
    signal: "Find minimum/maximum feasible value with a monotonic yes/no check.",
    steps: ["Define the answer range.", "Write a feasibility function.", "Move bounds based on whether mid is feasible.", "Return the smallest or largest bound according to the question."],
    commonMistake: "Binary searching values without proving monotonicity.",
    timeComplexity: "O(n log R)",
    spaceComplexity: "O(1)"
  },
  "Backtracking": {
    pattern: "Backtracking",
    signal: "Generate all valid combinations, permutations, placements, or search with choices.",
    steps: ["Define the partial candidate.", "Choose one option.", "Recurse with updated state.", "Undo the choice before trying the next branch."],
    commonMistake: "Forgetting to undo mutable state after recursion.",
    timeComplexity: "Exponential",
    spaceComplexity: "O(depth)"
  },
  "System Design": {
    pattern: "System Design",
    signal: "Open-ended design of services, APIs, scale, reliability, or product workflows.",
    steps: ["Clarify users, scale, and core requirements.", "Define APIs and data model.", "Choose storage and key flows.", "Discuss bottlenecks, failures, observability, and tradeoffs."],
    commonMistake: "Jumping to technologies before locking requirements.",
    timeComplexity: "Design-dependent",
    spaceComplexity: "Design-dependent"
  },
  "SQL / Data Modeling": {
    pattern: "SQL / Data Modeling",
    signal: "Joins, aggregation, transactions, indexes, or schema design questions.",
    steps: ["Identify entities and relationships.", "Choose keys and constraints.", "Write the simplest query first.", "Add indexes or transactions based on access patterns."],
    commonMistake: "Adding indexes without explaining the query they help.",
    timeComplexity: "Query-dependent",
    spaceComplexity: "Index-dependent"
  },
  "Behavioral STAR": {
    pattern: "Behavioral STAR",
    signal: "Questions about conflict, ownership, failure, leadership, ambiguity, or deadlines.",
    steps: ["State the situation briefly.", "Explain the task and constraint.", "Describe your concrete actions.", "End with measurable result and reflection."],
    commonMistake: "Telling a team story without naming your personal contribution.",
    timeComplexity: "Not applicable",
    spaceComplexity: "Not applicable"
  },
  "ML Evaluation": {
    pattern: "ML Evaluation",
    signal: "Questions about model choice, metrics, validation, ranking, retrieval, or production ML quality.",
    steps: ["Define the objective and failure cost.", "Choose metrics that match the product goal.", "Split data to avoid leakage.", "Discuss monitoring, drift, and feedback loops."],
    commonMistake: "Optimizing accuracy when precision, recall, ranking quality, or latency matters more.",
    timeComplexity: "Pipeline-dependent",
    spaceComplexity: "Pipeline-dependent"
  }
};

const SOURCE_REFS = [{ label: "Curated public interview pattern set" }];

function roles(...roleTags: CompanyPrepRole[]) {
  return roleTags;
}

function tags(
  companyTypeIds: string[],
  baseFrequency: number,
  stage: string
): PrepQuestionSeed["companyTypes"] {
  return companyTypeIds.map((companyTypeId, index) => ({
    companyTypeId,
    frequency: Math.max(42, baseFrequency - index * 6),
    lastSeen: "2026-05",
    stage
  }));
}

function q(
  id: string,
  title: string,
  difficulty: CompanyPrepDifficulty,
  topics: string[],
  roleTags: CompanyPrepRole[],
  pattern: keyof typeof PATTERNS,
  companyTypeIds: string[],
  baseFrequency: number,
  stage = "Coding"
): PrepQuestionSeed {
  return {
    id,
    title,
    difficulty,
    topics,
    roleTags,
    companyTypes: tags(companyTypeIds, baseFrequency, stage),
    approach: PATTERNS[pattern],
    sourceRefs: SOURCE_REFS
  };
}

export const PREP_QUESTION_SEEDS: PrepQuestionSeed[] = [
  q("q-001", "Two Sum", "easy", ["Arrays", "Hashing"], roles("Software Engineer", "Backend", "Full Stack"), "Hash Map Lookup", ["mass-recruiter-service", "product-giant", "fintech-payments", "saas-enterprise"], 94),
  q("q-002", "Best Time to Buy and Sell Stock", "easy", ["Arrays", "Greedy"], roles("Software Engineer", "Backend", "Data"), "Sliding Window", ["product-giant", "ecommerce-marketplace", "fintech-payments"], 91),
  q("q-003", "Contains Duplicate", "easy", ["Arrays", "Hashing"], roles("Software Engineer", "Frontend", "Backend"), "Hash Map Lookup", ["mass-recruiter-service", "saas-enterprise", "consulting-tech"], 86),
  q("q-004", "Product of Array Except Self", "medium", ["Arrays", "Prefix Product"], roles("Software Engineer", "Backend", "Full Stack"), "Prefix Sum", ["product-giant", "ecommerce-marketplace", "fintech-payments"], 88),
  q("q-005", "Maximum Subarray", "medium", ["Arrays", "Dynamic Programming"], roles("Software Engineer", "Data"), "Dynamic Programming", ["product-giant", "mass-recruiter-service", "ecommerce-marketplace"], 90),
  q("q-006", "Merge Intervals", "medium", ["Arrays", "Intervals", "Sorting"], roles("Software Engineer", "Backend", "Full Stack"), "Two Pointers", ["product-giant", "fintech-payments", "saas-enterprise"], 87),
  q("q-007", "Insert Interval", "medium", ["Arrays", "Intervals"], roles("Software Engineer", "Backend"), "Two Pointers", ["product-giant", "saas-enterprise", "ecommerce-marketplace"], 80),
  q("q-008", "Sort Colors", "medium", ["Arrays", "Two Pointers"], roles("Software Engineer"), "Two Pointers", ["mass-recruiter-service", "product-giant"], 76),
  q("q-009", "Majority Element", "easy", ["Arrays", "Voting"], roles("Software Engineer", "Data"), "Two Pointers", ["mass-recruiter-service", "consulting-tech", "product-giant"], 82),
  q("q-010", "Subarray Sum Equals K", "medium", ["Arrays", "Prefix Sum", "Hashing"], roles("Software Engineer", "Backend", "Data"), "Prefix Sum", ["product-giant", "fintech-payments", "ecommerce-marketplace"], 89),
  q("q-011", "Longest Consecutive Sequence", "medium", ["Hashing", "Arrays"], roles("Software Engineer", "Backend"), "Hash Map Lookup", ["product-giant", "ecommerce-marketplace", "fintech-payments"], 84),
  q("q-012", "Three Sum", "medium", ["Arrays", "Two Pointers"], roles("Software Engineer"), "Two Pointers", ["product-giant", "ecommerce-marketplace"], 86),
  q("q-013", "Container With Most Water", "medium", ["Arrays", "Two Pointers"], roles("Software Engineer"), "Two Pointers", ["product-giant", "realtime-consumer-platform"], 78),
  q("q-014", "Trapping Rain Water", "hard", ["Arrays", "Two Pointers"], roles("Software Engineer"), "Two Pointers", ["product-giant", "ecommerce-marketplace"], 74),
  q("q-015", "Rotate Array", "easy", ["Arrays"], roles("Software Engineer", "Frontend"), "Two Pointers", ["mass-recruiter-service", "consulting-tech", "saas-enterprise"], 72),
  q("q-016", "Valid Anagram", "easy", ["Strings", "Hashing"], roles("Software Engineer", "Frontend", "Backend"), "Hash Map Lookup", ["mass-recruiter-service", "saas-enterprise", "consulting-tech"], 86),
  q("q-017", "Group Anagrams", "medium", ["Strings", "Hashing"], roles("Software Engineer", "Backend", "Full Stack"), "Hash Map Lookup", ["product-giant", "saas-enterprise", "ecommerce-marketplace"], 85),
  q("q-018", "Longest Substring Without Repeating Characters", "medium", ["Strings", "Sliding Window"], roles("Software Engineer", "Frontend", "Backend"), "Sliding Window", ["product-giant", "realtime-consumer-platform", "fintech-payments"], 90),
  q("q-019", "Minimum Window Substring", "hard", ["Strings", "Sliding Window"], roles("Software Engineer", "Backend"), "Sliding Window", ["product-giant", "realtime-consumer-platform"], 77),
  q("q-020", "Valid Palindrome", "easy", ["Strings", "Two Pointers"], roles("Software Engineer", "Frontend"), "Two Pointers", ["mass-recruiter-service", "consulting-tech", "product-giant"], 76),
  q("q-021", "String Compression", "medium", ["Strings", "Two Pointers"], roles("Software Engineer", "Frontend"), "Two Pointers", ["saas-enterprise", "mass-recruiter-service"], 68),
  q("q-022", "Decode String", "medium", ["Strings", "Stack"], roles("Software Engineer", "Frontend", "Backend"), "Backtracking", ["product-giant", "saas-enterprise"], 73),
  q("q-023", "Longest Palindromic Substring", "medium", ["Strings", "Dynamic Programming"], roles("Software Engineer"), "Dynamic Programming", ["product-giant", "ecommerce-marketplace"], 75),
  q("q-024", "Reverse Linked List", "easy", ["Linked List"], roles("Software Engineer", "Backend"), "Two Pointers", ["mass-recruiter-service", "product-giant", "consulting-tech"], 84),
  q("q-025", "Merge Two Sorted Lists", "easy", ["Linked List", "Two Pointers"], roles("Software Engineer", "Backend"), "Two Pointers", ["mass-recruiter-service", "product-giant", "saas-enterprise"], 81),
  q("q-026", "Linked List Cycle", "easy", ["Linked List", "Two Pointers"], roles("Software Engineer"), "Two Pointers", ["mass-recruiter-service", "product-giant"], 78),
  q("q-027", "Remove Nth Node From End", "medium", ["Linked List", "Two Pointers"], roles("Software Engineer"), "Two Pointers", ["product-giant", "ecommerce-marketplace"], 73),
  q("q-028", "Add Two Numbers", "medium", ["Linked List", "Simulation"], roles("Software Engineer"), "Two Pointers", ["product-giant", "fintech-payments"], 70),
  q("q-029", "LRU Cache", "medium", ["Hashing", "Linked List", "Design"], roles("Software Engineer", "Backend"), "System Design", ["product-giant", "ecommerce-marketplace", "realtime-consumer-platform", "fintech-payments"], 88),
  q("q-030", "Valid Parentheses", "easy", ["Stack", "Strings"], roles("Software Engineer", "Frontend", "Backend"), "Backtracking", ["mass-recruiter-service", "consulting-tech", "product-giant"], 85),
  q("q-031", "Min Stack", "medium", ["Stack", "Design"], roles("Software Engineer", "Backend"), "System Design", ["product-giant", "saas-enterprise"], 70),
  q("q-032", "Daily Temperatures", "medium", ["Stack", "Monotonic Stack"], roles("Software Engineer"), "Sliding Window", ["product-giant", "realtime-consumer-platform"], 72),
  q("q-033", "Next Greater Element", "easy", ["Stack", "Monotonic Stack"], roles("Software Engineer"), "Sliding Window", ["mass-recruiter-service", "product-giant"], 68),
  q("q-034", "Evaluate Reverse Polish Notation", "medium", ["Stack"], roles("Software Engineer", "Backend"), "Backtracking", ["product-giant", "saas-enterprise"], 66),
  q("q-035", "Sliding Window Maximum", "hard", ["Deque", "Sliding Window"], roles("Software Engineer", "Backend"), "Sliding Window", ["product-giant", "realtime-consumer-platform", "ecommerce-marketplace"], 78),
  q("q-036", "Maximum Depth of Binary Tree", "easy", ["Trees", "DFS"], roles("Software Engineer"), "Tree Recursion", ["mass-recruiter-service", "product-giant"], 78),
  q("q-037", "Validate Binary Search Tree", "medium", ["Trees", "DFS"], roles("Software Engineer"), "Tree Recursion", ["product-giant", "saas-enterprise"], 83),
  q("q-038", "Lowest Common Ancestor", "medium", ["Trees", "DFS"], roles("Software Engineer"), "Tree Recursion", ["product-giant", "ecommerce-marketplace"], 80),
  q("q-039", "Binary Tree Level Order Traversal", "medium", ["Trees", "BFS"], roles("Software Engineer"), "Graph BFS", ["product-giant", "mass-recruiter-service"], 76),
  q("q-040", "Serialize and Deserialize Binary Tree", "hard", ["Trees", "Design"], roles("Software Engineer", "Backend"), "Tree Recursion", ["product-giant", "ecommerce-marketplace"], 70),
  q("q-041", "Diameter of Binary Tree", "easy", ["Trees", "DFS"], roles("Software Engineer"), "Tree Recursion", ["product-giant", "saas-enterprise"], 70),
  q("q-042", "Kth Smallest Element in BST", "medium", ["Trees", "DFS"], roles("Software Engineer"), "Tree Recursion", ["product-giant"], 66),
  q("q-043", "Path Sum II", "medium", ["Trees", "Backtracking"], roles("Software Engineer"), "Backtracking", ["product-giant", "mass-recruiter-service"], 62),
  q("q-044", "Implement Trie", "medium", ["Trie", "Design"], roles("Software Engineer", "Backend"), "System Design", ["product-giant", "saas-enterprise", "ai-ml-lab"], 74),
  q("q-045", "Number of Islands", "medium", ["Graphs", "DFS", "BFS"], roles("Software Engineer", "Backend"), "Graph DFS", ["product-giant", "ecommerce-marketplace", "realtime-consumer-platform"], 90),
  q("q-046", "Clone Graph", "medium", ["Graphs", "DFS", "Hashing"], roles("Software Engineer", "Backend"), "Graph DFS", ["product-giant", "cloud-devops-platform"], 72),
  q("q-047", "Course Schedule", "medium", ["Graphs", "Topological Sort"], roles("Software Engineer", "Backend"), "Graph DFS", ["product-giant", "saas-enterprise", "cloud-devops-platform"], 84),
  q("q-048", "Rotting Oranges", "medium", ["Graphs", "BFS"], roles("Software Engineer"), "Graph BFS", ["product-giant", "mass-recruiter-service"], 78),
  q("q-049", "Word Ladder", "hard", ["Graphs", "BFS", "Strings"], roles("Software Engineer"), "Graph BFS", ["product-giant"], 68),
  q("q-050", "Pacific Atlantic Water Flow", "medium", ["Graphs", "DFS"], roles("Software Engineer"), "Graph DFS", ["product-giant", "realtime-consumer-platform"], 66),
  q("q-051", "Network Delay Time", "medium", ["Graphs", "Shortest Path"], roles("Software Engineer", "Backend", "DevOps"), "Graph BFS", ["product-giant", "cloud-devops-platform", "realtime-consumer-platform"], 73),
  q("q-052", "Alien Dictionary", "hard", ["Graphs", "Topological Sort"], roles("Software Engineer", "Backend"), "Graph DFS", ["product-giant"], 62),
  q("q-053", "Detect Cycle with Union Find", "medium", ["Graphs", "Disjoint Set"], roles("Software Engineer", "DevOps"), "Graph DFS", ["product-giant", "cloud-devops-platform"], 64),
  q("q-054", "Minimum Spanning Tree", "medium", ["Graphs", "Greedy"], roles("Software Engineer", "DevOps"), "Graph BFS", ["cloud-devops-platform", "product-giant"], 58),
  q("q-055", "Climbing Stairs", "easy", ["Dynamic Programming"], roles("Software Engineer"), "Dynamic Programming", ["mass-recruiter-service", "product-giant", "consulting-tech"], 76),
  q("q-056", "House Robber", "medium", ["Dynamic Programming"], roles("Software Engineer"), "Dynamic Programming", ["product-giant", "ecommerce-marketplace"], 81),
  q("q-057", "Coin Change", "medium", ["Dynamic Programming"], roles("Software Engineer", "Backend"), "Dynamic Programming", ["product-giant", "fintech-payments"], 84),
  q("q-058", "Longest Increasing Subsequence", "medium", ["Dynamic Programming", "Binary Search"], roles("Software Engineer"), "Dynamic Programming", ["product-giant", "ecommerce-marketplace"], 82),
  q("q-059", "Word Break", "medium", ["Dynamic Programming", "Strings"], roles("Software Engineer", "Backend"), "Dynamic Programming", ["product-giant", "ai-ml-lab"], 78),
  q("q-060", "Unique Paths", "medium", ["Dynamic Programming", "Math"], roles("Software Engineer"), "Dynamic Programming", ["mass-recruiter-service", "product-giant"], 70),
  q("q-061", "Decode Ways", "medium", ["Dynamic Programming", "Strings"], roles("Software Engineer"), "Dynamic Programming", ["product-giant"], 69),
  q("q-062", "Partition Equal Subset Sum", "medium", ["Dynamic Programming"], roles("Software Engineer"), "Dynamic Programming", ["product-giant", "ecommerce-marketplace"], 72),
  q("q-063", "Edit Distance", "hard", ["Dynamic Programming", "Strings"], roles("Software Engineer", "AI"), "Dynamic Programming", ["product-giant", "ai-ml-lab"], 67),
  q("q-064", "Longest Common Subsequence", "medium", ["Dynamic Programming", "Strings"], roles("Software Engineer", "AI"), "Dynamic Programming", ["product-giant", "ai-ml-lab"], 73),
  q("q-065", "Maximum Product Subarray", "medium", ["Dynamic Programming", "Arrays"], roles("Software Engineer"), "Dynamic Programming", ["product-giant", "fintech-payments"], 70),
  q("q-066", "Subsets", "medium", ["Backtracking"], roles("Software Engineer"), "Backtracking", ["product-giant", "mass-recruiter-service"], 74),
  q("q-067", "Permutations", "medium", ["Backtracking"], roles("Software Engineer"), "Backtracking", ["product-giant", "mass-recruiter-service"], 72),
  q("q-068", "Combination Sum", "medium", ["Backtracking"], roles("Software Engineer"), "Backtracking", ["product-giant"], 70),
  q("q-069", "N Queens", "hard", ["Backtracking"], roles("Software Engineer"), "Backtracking", ["product-giant"], 58),
  q("q-070", "Word Search", "medium", ["Backtracking", "Graphs"], roles("Software Engineer"), "Backtracking", ["product-giant", "ecommerce-marketplace"], 76),
  q("q-071", "Kth Largest Element", "medium", ["Heap", "Arrays"], roles("Software Engineer", "Backend", "Data"), "Heap / Priority Queue", ["product-giant", "ecommerce-marketplace", "realtime-consumer-platform"], 82),
  q("q-072", "Top K Frequent Elements", "medium", ["Heap", "Hashing"], roles("Software Engineer", "Backend", "Data"), "Heap / Priority Queue", ["product-giant", "ecommerce-marketplace", "ai-ml-lab"], 84),
  q("q-073", "Merge K Sorted Lists", "hard", ["Heap", "Linked List"], roles("Software Engineer", "Backend"), "Heap / Priority Queue", ["product-giant", "ecommerce-marketplace"], 74),
  q("q-074", "Find Median from Data Stream", "hard", ["Heap", "Streaming"], roles("Software Engineer", "Backend", "Data"), "Heap / Priority Queue", ["product-giant", "fintech-payments", "realtime-consumer-platform"], 78),
  q("q-075", "Binary Search", "easy", ["Binary Search"], roles("Software Engineer"), "Binary Search on Answer", ["mass-recruiter-service", "consulting-tech", "product-giant"], 74),
  q("q-076", "Search in Rotated Sorted Array", "medium", ["Binary Search"], roles("Software Engineer"), "Binary Search on Answer", ["product-giant", "mass-recruiter-service"], 82),
  q("q-077", "Find First and Last Position", "medium", ["Binary Search"], roles("Software Engineer"), "Binary Search on Answer", ["product-giant", "fintech-payments"], 76),
  q("q-078", "Median of Two Sorted Arrays", "hard", ["Binary Search"], roles("Software Engineer"), "Binary Search on Answer", ["product-giant"], 64),
  q("q-079", "Capacity to Ship Packages", "medium", ["Binary Search", "Greedy"], roles("Software Engineer", "Backend"), "Binary Search on Answer", ["ecommerce-marketplace", "realtime-consumer-platform"], 68),
  q("q-080", "Koko Eating Bananas", "medium", ["Binary Search"], roles("Software Engineer"), "Binary Search on Answer", ["product-giant"], 70),
  q("q-081", "Jump Game", "medium", ["Greedy", "Arrays"], roles("Software Engineer"), "Two Pointers", ["product-giant", "ecommerce-marketplace"], 75),
  q("q-082", "Gas Station", "medium", ["Greedy", "Arrays"], roles("Software Engineer", "Backend"), "Two Pointers", ["product-giant", "ecommerce-marketplace"], 68),
  q("q-083", "Task Scheduler", "medium", ["Greedy", "Heap"], roles("Software Engineer", "Backend", "DevOps"), "Heap / Priority Queue", ["product-giant", "cloud-devops-platform"], 72),
  q("q-084", "Meeting Rooms II", "medium", ["Intervals", "Heap"], roles("Software Engineer", "Backend"), "Heap / Priority Queue", ["product-giant", "saas-enterprise"], 74),
  q("q-085", "Design URL Shortener", "medium", ["System Design", "APIs", "Databases"], roles("Software Engineer", "Backend", "Full Stack"), "System Design", ["product-giant", "saas-enterprise", "cloud-devops-platform"], 90, "System Design"),
  q("q-086", "Design Rate Limiter", "medium", ["System Design", "Caching"], roles("Software Engineer", "Backend", "DevOps"), "System Design", ["product-giant", "fintech-payments", "cloud-devops-platform"], 88, "System Design"),
  q("q-087", "Design Chat Service", "hard", ["System Design", "Realtime", "Queues"], roles("Software Engineer", "Backend", "Full Stack"), "System Design", ["realtime-consumer-platform", "product-giant", "early-stage-startup"], 86, "System Design"),
  q("q-088", "Design News Feed", "hard", ["System Design", "Ranking", "Caching"], roles("Software Engineer", "Backend", "Data"), "System Design", ["product-giant", "realtime-consumer-platform"], 84, "System Design"),
  q("q-089", "Design Parking Lot", "medium", ["Low Level Design", "OOP"], roles("Software Engineer", "Backend"), "System Design", ["ecommerce-marketplace", "consulting-tech", "mass-recruiter-service"], 75, "Low Level Design"),
  q("q-090", "Design File Storage Service", "hard", ["System Design", "Storage"], roles("Software Engineer", "Backend", "DevOps"), "System Design", ["cloud-devops-platform", "product-giant", "saas-enterprise"], 80, "System Design"),
  q("q-091", "Design Notification System", "medium", ["System Design", "Queues"], roles("Software Engineer", "Backend", "Full Stack"), "System Design", ["saas-enterprise", "ecommerce-marketplace", "realtime-consumer-platform"], 82, "System Design"),
  q("q-092", "Design Payment Ledger", "hard", ["System Design", "Databases", "Transactions"], roles("Backend", "Software Engineer"), "System Design", ["fintech-payments"], 92, "System Design"),
  q("q-093", "Design Ride Matching", "hard", ["System Design", "Geospatial", "Queues"], roles("Software Engineer", "Backend", "Data"), "System Design", ["realtime-consumer-platform", "ecommerce-marketplace"], 72, "System Design"),
  q("q-094", "Design Food Ordering Flow", "medium", ["System Design", "APIs", "Databases"], roles("Software Engineer", "Backend", "Full Stack"), "System Design", ["ecommerce-marketplace", "realtime-consumer-platform", "early-stage-startup"], 78, "System Design"),
  q("q-095", "SQL Joins and Aggregation", "easy", ["SQL", "Databases"], roles("Backend", "Full Stack", "Data"), "SQL / Data Modeling", ["mass-recruiter-service", "consulting-tech", "fintech-payments", "saas-enterprise"], 88, "Technical Basics"),
  q("q-096", "Database Index Design", "medium", ["Databases", "Indexes"], roles("Backend", "Full Stack", "Data"), "SQL / Data Modeling", ["fintech-payments", "saas-enterprise", "ecommerce-marketplace"], 82, "Backend Deep Dive"),
  q("q-097", "OOP Design Vending Machine", "medium", ["OOP", "Low Level Design"], roles("Software Engineer", "Backend"), "System Design", ["consulting-tech", "mass-recruiter-service", "ecommerce-marketplace"], 76, "Low Level Design"),
  q("q-098", "HTTP vs WebSocket Tradeoffs", "medium", ["Networking", "Realtime", "System Design"], roles("Backend", "Full Stack", "DevOps"), "System Design", ["realtime-consumer-platform", "cloud-devops-platform", "early-stage-startup"], 72, "System Design"),
  q("q-099", "Feature Scaling and Model Evaluation", "medium", ["ML Fundamentals", "Statistics"], roles("AI", "Data"), "ML Evaluation", ["ai-ml-lab"], 86, "ML Depth"),
  q("q-100", "Vector Search and Retrieval Basics", "medium", ["Vector Search", "ML Fundamentals", "System Design"], roles("AI", "Backend", "Data"), "ML Evaluation", ["ai-ml-lab", "early-stage-startup"], 84, "AI System Design")
];
