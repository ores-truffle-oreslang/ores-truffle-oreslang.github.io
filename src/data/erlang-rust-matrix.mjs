/** Editorial design comparison. Oreslang support is not compiler-conformance evidence. */
export const matrixColumns = [
  { key: "erlang", label: "Erlang" },
  { key: "rust", label: "Rust" },
  { key: "oreslang", label: "Oreslang (direction)" },
  { key: "others", label: "Other languages" },
];

export const matrixRows = [
  {
    "id": "type-system",
    "feature": "Type system",
    "erlang": "Dynamically typed terms, pattern matching, typespecs and Dialyzer; checks are not Rust-style static guarantees.",
    "rust": "Static nominal types, generics, traits, lifetimes and exhaustive enums; compilation rejects many invalid programs.",
    "oreslang": "Design: static nominal/structural types, generics, Option/Result-like variants and typed actor mail; backend conformance is unverified.",
    "others": "Go offers static interfaces; Elixir is dynamic on BEAM; Gleam and OCaml have strong inferred static types.",
    "status": "design"
  },
  {
    "id": "hot-reload",
    "feature": "Hot reloading in production",
    "erlang": "OTP supports versioned module loading and release upgrades, with upgrade scripts and state migration; some VM upgrades require restarts.",
    "rust": "No language/runtime-wide hot code replacement; rolling restarts, dylib/plugin designs or process handover are typical.",
    "oreslang": "Planned: stage a new actor/code generation, route new work, drain old instances and roll back; production-safe reload is not verified.",
    "others": "Elixir inherits BEAM upgrades; JVM/.NET offer limited hot-swap/reload tooling, not universal stateful production upgrades.",
    "status": "research"
  },
  {
    "id": "build-system",
    "feature": "Build system",
    "erlang": "erlc and OTP releases; rebar3 and Mix (Elixir) organize builds and dependencies.",
    "rust": "Cargo provides dependency resolution, builds, workspaces, testing and packaging; rustc compiles crates.",
    "oreslang": "Compiler CLI, reproducible multi-backend builds and native-image/LLVM pipelines are under development; no parity claim.",
    "others": "Go toolchain/modules, Gradle/Maven, CMake/Meson and dotnet build are established alternatives.",
    "status": "design"
  },
  {
    "id": "borrow-checking",
    "feature": "Borrow checking",
    "erlang": "No compile-time affine ownership or borrow checker; actors exchange immutable terms and use process isolation.",
    "rust": "Compiler-enforced ownership, shared/mutable borrowing and lifetime checking, including across async contexts.",
    "oreslang": "Design: checked rt borrow, rt borrow mut, rt take and rt share with actor isolation and suspension-aware loans; conformance is unverified.",
    "others": "C++ has RAII without Rust-equivalent universal borrow checks; Swift enforces some exclusivity rules.",
    "status": "design"
  },
  {
    "id": "garbage-collection",
    "feature": "Garbage collection",
    "erlang": "BEAM normally performs garbage collection on individual process heaps; large binaries can be shared via reference counting.",
    "rust": "No mandatory tracing GC; deterministic drops/RAII, ownership, and reference-counted options such as Arc.",
    "oreslang": "Target: LLVM actor-owned arenas/heaps with no tracing GC; GraalVM uses actor-owned regions alongside managed GC. These are distinct profiles, not guaranteed results.",
    "others": "Go, Java, C# use managed GC; C/C++ use explicit/RAII lifetime strategies.",
    "status": "design"
  },
  {
    "id": "soft-real-time",
    "feature": "Soft real time",
    "erlang": "BEAM reductions, per-process scheduling and supervision make soft-real-time I/O a well-established strength; no fixed deadline guarantee.",
    "rust": "Can achieve low latency with async runtimes or dedicated threads, but scheduling and allocation require deliberate engineering.",
    "oreslang": "Target: bounded actor admission, fairness, preemption checkpoints and runtime backpressure; latency SLOs need measured proof.",
    "others": "Go, Java and .NET support latency-sensitive services with tuning and observability.",
    "status": "design"
  },
  {
    "id": "hard-real-time",
    "feature": "Hard real time",
    "erlang": "General BEAM/OTP is not a hard-real-time platform and does not certify worst-case deadlines.",
    "rust": "Possible on suitable RTOS or real-time Linux with bounded code and audited dependencies; Rust alone guarantees no deadline.",
    "oreslang": "Not certified: a restricted, bounded-allocation native subset and RT kernel integration would require WCET/interrupt/scheduler verification.",
    "others": "C, C++, Ada/SPARK and RTOS toolchains are established in hard-RT domains; PREEMPT_RT helps but is not a universal guarantee.",
    "status": "research"
  },
  {
    "id": "aot-jit",
    "feature": "AOT vs JIT",
    "erlang": "BEAM bytecode is compiled ahead of running modules and OTP has a JIT in modern runtimes; not the same as producing standalone native programs.",
    "rust": "Usually AOT to native binaries via rustc/LLVM; no general-purpose production JIT in standard Rust.",
    "oreslang": "Target: LLVM native AOT, GraalVM JIT/Native Image and optional hybrid execution; feature equivalence must be established per backend.",
    "others": "Java/.NET normally mix IL/bytecode with JIT and support AOT paths; Go usually compiles AOT.",
    "status": "design"
  },
  {
    "id": "lambdas",
    "feature": "Usage in Lambdas / serverless",
    "erlang": "AWS Lambda can host Erlang/Elixir through custom runtimes or containers; BEAM startup and packaging remain factors.",
    "rust": "AWS Lambda supports Rust through custom runtimes/third-party tooling; native executables can benefit cold-start and memory budgets.",
    "oreslang": "Target: actor-backed functions in native/AOT builds and optional GraalVM modes; no verified AWS Lambda runtime, cold-start or cost advantage.",
    "others": "Go, Java, Node.js, Python and .NET have mature Lambda ecosystems; language closures are a separate concept.",
    "status": "research"
  },
  {
    "id": "actor-system",
    "feature": "Actor system",
    "erlang": "Native lightweight processes, mailbox receive, links, monitors and OTP supervisors; battle-tested semantics.",
    "rust": "Actors are typically crates/frameworks (Actix, Ractor, etc.), not core language primitives; Tokio tasks are not actors.",
    "oreslang": "Design: typed ActorRef messages, single-flight actor execution, shared/private/untrusted memory profiles and parent supervision; not all backends verified.",
    "others": "Elixir has OTP; Orleans/Akka provide virtual actors; Go favors goroutines and channels.",
    "status": "design"
  },
  {
    "id": "functional-programming",
    "feature": "Functional programming",
    "erlang": "Functional-first, immutable binding, closures, recursion, comprehensions, and higher-order functions; mutation is not idiomatic.",
    "rust": "First-class closures, iterators, traits, pattern matching and functional combinators alongside imperative mutation.",
    "oreslang": "Design: first-class functions, pure effects, map/filter/reduce, pattern matching and streams alongside actors and state loans.",
    "others": "Haskell/OCaml emphasize functional typing; JavaScript, Kotlin and C# mix functional and imperative styles.",
    "status": "design"
  },
  {
    "id": "adts",
    "feature": "Algebraic data types (ADTs)",
    "erlang": "Tagged tuples and pattern matching encode variants dynamically; records are tuple-based, not native Rust-style sum types.",
    "rust": "Enums with data-bearing variants, structs, Option/Result and exhaustive match form expressive static ADTs.",
    "oreslang": "Design: enums, tagged variants, tuples, structs and exhaustive match with ownership/sendability checks; public compiler proof pending.",
    "others": "Gleam/OCaml/Haskell have native sum types; TypeScript unions are erased at runtime.",
    "status": "design"
  },
  {
    "id": "data-oriented",
    "feature": "Data-oriented programming",
    "erlang": "Binaries/ETS and compact terms are useful, but BEAM is not primarily an explicit AoS/SoA SIMD-layout language.",
    "rust": "Native structs, slices, packed buffers, SIMD libraries and ECS crates support AoS/SoA/AoSoA tuning.",
    "oreslang": "Goal: explicit AoS, SoA, AoSoA, SoAoS and ECS-friendly layouts with actor-owned storage and cache-local kernels; backend lowering unverified.",
    "others": "C/C++/Zig excel at manual layout; Unity DOTS shows a managed ECS-oriented toolchain.",
    "status": "research"
  },
  {
    "id": "gpus",
    "feature": "GPUs",
    "erlang": "Typically offload through NIFs, ports, drivers or external accelerator services; GPU code is not built into Erlang.",
    "rust": "GPU via crates/frameworks such as wgpu and CUDA bindings; safety depends on device API and kernel language.",
    "oreslang": "Research: GPU buffer/layout contracts and accelerator offload integrated with typed data and actors; no general production GPU backend verified.",
    "others": "Python has PyTorch/CUDA; C++ has CUDA/HIP; WebGPU is available across browser/native ecosystems.",
    "status": "research"
  },
  {
    "id": "distributed",
    "feature": "Distributed systems",
    "erlang": "Built-in distributed Erlang, process messaging, node connectivity, OTP clustering/supervision patterns.",
    "rust": "Networking/RPC/serialization typically assembled using crates; distributed actor systems exist as libraries.",
    "oreslang": "Goal: ProxyActor, typed remote messages, capabilities and supervised transports over IPC/TCP/HTTP; cross-node parity unverified.",
    "others": "Go has gRPC and cloud tooling; Java has Akka/cluster stacks; Elixir inherits BEAM distribution.",
    "status": "research"
  },
  {
    "id": "carrier-grade-linux",
    "feature": "Carrier-grade Linux",
    "erlang": "Long history in telecom applications on Linux; Erlang/OTP is not itself a Carrier Grade Linux certification.",
    "rust": "Can target Linux servers, embedded and RT kernels; carrier-grade claims require system-level testing, HA design and operations.",
    "oreslang": "Target: telecom-grade actors, fault isolation and bounded scheduling on Linux; no CGL compliance or telecom certification is claimed.",
    "others": "C/C++, Go, Java and Erlang all deploy on carrier-grade Linux stacks; platform resilience is broader than language choice.",
    "status": "research"
  },
  {
    "id": "websockets",
    "feature": "WebSocket servers",
    "erlang": "Cowboy and other BEAM frameworks support large numbers of socket-driven connections with process isolation.",
    "rust": "Tokio-based stacks such as axum, tokio-tungstenite and Actix Web support high-concurrency WebSockets.",
    "oreslang": "Design: HTTP/WS actors with ownership-aware handoff, backpressure, quotas and supervisor-driven recovery; production capacity not verified.",
    "others": "Elixir Phoenix Channels, Node.js, Go and Java Netty provide established real-time servers.",
    "status": "design"
  },
  {
    "id": "rtc-signaling",
    "feature": "RTC signaling servers",
    "erlang": "Good fit for WebRTC signaling, presence and session routing over WebSocket; media plane often lives elsewhere.",
    "rust": "Good fit with async networking libraries for signaling, STUN/TURN integration and native protocol code; separate media plane is common.",
    "oreslang": "Target: actor sessions, identity-correlated WS streams, signaling state and typed control messages; no validated carrier-scale RTC signaling results.",
    "others": "Elixir/Phoenix, Node.js, Go and Java also operate WebRTC signaling; signaling is not media transcoding.",
    "status": "research"
  },
  {
    "id": "top-five",
    "feature": "Top 5 use cases",
    "erlang": [
      "Telecom switches and signaling control planes",
      "Always-on messaging and chat backends",
      "High-concurrency WebSocket/presence servers",
      "Supervised distributed job systems",
      "Fault-tolerant event ingestion"
    ],
    "rust": [
      "Native services and performance-sensitive APIs",
      "Embedded and edge agents",
      "Game/simulation engines",
      "Networking and developer tooling",
      "Data-processing and hardware interfaces"
    ],
    "oreslang": [
      "Proposed: native supervised telecom signaling",
      "Proposed: multi-tenant actor/FaaS runtimes",
      "Proposed: WebSocket and RTC signaling gateways",
      "Proposed: data-oriented CPU/GPU pipelines",
      "Proposed: low-latency isolated services"
    ],
    "others": [
      "Go: APIs and cloud infrastructure",
      "Elixir: real-time distributed apps",
      "Java: enterprise systems",
      "C++: engines and HPC",
      "Python: data science and ML"
    ],
    "status": "research"
  },
  {
    "id": "stack-traces",
    "feature": "Stack traces",
    "erlang": "Process crash reports, stacktraces, logger/SASL and OTP crash diagnostics integrate with supervisors.",
    "rust": "Backtraces through RUST_BACKTRACE, panic reporting, tracing spans and debugger/profiler integration.",
    "oreslang": "Goal: source-mapped async/actor stack traces with causal message context across AOT/Graal/native boundaries; no uniform verified format.",
    "others": "JVM/.NET offer mature stack diagnostics; distributed traces require correlation across services.",
    "status": "design"
  },
  {
    "id": "high-load-performance",
    "feature": "High load: CPU, memory and profiling",
    "erlang": "Observer, telemetry, tracing and profiling support scheduler utilization, reductions, mailbox growth and process memory analysis; capacity is workload-specific.",
    "rust": "perf, flamegraphs, tracing, heap profilers and runtime-specific instruments; tuning spans allocator, executor, batching and locking.",
    "oreslang": "Target: per-actor allocation/arena metrics, CPU profiles, p50/p95/p99 latency, queue depth, GC pauses and L1/L2 locality. No head-to-head throughput, memory or CPU win is established.",
    "others": "Go pprof, Java JFR and .NET counters support mature profiling; compare equal workloads on equal hardware.",
    "status": "research"
  },
  {
    "id": "concurrency-model",
    "feature": "Concurrency model",
    "erlang": "Preemptively scheduled BEAM processes communicate via mailboxes; isolated process heaps with no shared mutable Erlang terms by default.",
    "rust": "OS threads, atomics, scoped threads, async futures and channels; memory safety via Send/Sync and borrow checking.",
    "oreslang": "Design: single native-thread execution per actor at a time, multiple in-flight async messages, Tasks/channels/select and optional worker carriers; actor state via critical loans.",
    "others": "Go goroutines; Java virtual threads; C# async/await and thread pool; JS event loop/workers.",
    "status": "design"
  },
  {
    "id": "ffi-abi",
    "feature": "FFI, ABI and C integration",
    "erlang": "C NIFs and ports/driver interfaces; NIF mistakes can block schedulers or crash the VM.",
    "rust": "Stable C ABI interoperability via extern C and #[repr(C)]; Rust ABI itself is not generally stable across versions.",
    "oreslang": "Goal: explicit C-facing ABI/FFI and safe ownership boundaries, backend-specific native addons and guarded untrusted capabilities; ABI stability not verified.",
    "others": "Node.js N-API supports native addons; C++ ABI varies; JVM JNI/FFM and .NET P/Invoke bridge native code.",
    "status": "research"
  },
  {
    "id": "packages-modules",
    "feature": "Package managers and module systems",
    "erlang": "OTP applications and modules; Hex/rebar3 for Erlang ecosystem, Mix for Elixir.",
    "rust": "Cargo/crates.io/workspaces, explicit modules and visibility, features and lockfiles.",
    "oreslang": "Goal: package manifests, reproducible dependency resolution, lexical modules/visibility and backend artifacts; ecosystem/tooling under development.",
    "others": "Go modules, npm, Maven/Gradle, NuGet, opam and CMake/vcpkg cover different tradeoffs.",
    "status": "research"
  }
];

export const matrixReferences = [
  {
    "label": "Erlang/OTP release handling",
    "url": "https://www.erlang.org/doc/system/release_handling.html"
  },
  {
    "label": "Erlang code loading",
    "url": "https://www.erlang.org/docs/25/reference_manual/code_loading.html"
  },
  {
    "label": "Erlang distributed applications",
    "url": "https://www.erlang.org/doc/system/distributed_applications.html"
  },
  {
    "label": "Erlang NIF safety",
    "url": "https://www.erlang.org/doc/apps/erts/erl_nif.html"
  },
  {
    "label": "Erlang/OTP manuals",
    "url": "https://www.erlang.org/docs"
  },
  {
    "label": "Rust language book",
    "url": "https://doc.rust-lang.org/book/"
  },
  {
    "label": "Rust Cargo manual",
    "url": "https://doc.rust-lang.org/cargo/"
  },
  {
    "label": "Rust reference: external blocks",
    "url": "https://doc.rust-lang.org/reference/items/external-blocks.html"
  },
  {
    "label": "Tokio",
    "url": "https://tokio.rs/"
  },
  {
    "label": "Linux PREEMPT_RT kernel notes",
    "url": "https://docs.kernel.org/core-api/real-time/differences.html"
  },
  {
    "label": "Oreslang public draft and verification status",
    "url": "/language/"
  },
  {
    "label": "Oreslang measured performance evidence",
    "url": "/performance/"
  }
];
