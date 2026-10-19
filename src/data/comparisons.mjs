/** Editorial comparisons: Oreslang architectural direction, not measured performance results. */
export const comparisons = [
  {
    "id": "elixir",
    "name": "Elixir",
    "headline": "OTP's fault tolerance, with native ambitions and compile-time contracts.",
    "strength": "Elixir and Phoenix are excellent choices for web services, real-time systems, concurrent I/O, distributed messaging and operationally mature OTP supervision. Elixir's ergonomic syntax, immutable values, battle-tested BEAM scheduler and release tooling are genuine strengths—not problems Oreslang has already solved better.",
    "angles": [
      {
        "topic": "Type guarantees at actor boundaries",
        "peer": "Elixir is dynamically typed, supports specs and Dialyzer, and is evolving stronger static checking. Messages are idiomatically pattern matched, but ordinary mailboxes do not impose Rust-style ownership or static, end-to-end payload contracts.",
        "oreslang": "Oreslang aims for compile-time types, Option-safe values, checked ownership and typed ActorRef messages. The send boundary should establish who can read, mutate or transfer an object—not merely whether a message has the expected shape.",
        "impact": "As a codebase gains teams and services, message schemas become a compiler-enforced contract instead of scattered conventions."
      },
      {
        "topic": "FaaS, mobile and cold starts",
        "peer": "BEAM boots a VM and application release; operational tuning and warm instances can make this practical, but the runtime remains part of deployment. Elixir is not primarily optimized for tiny short-lived native processes.",
        "oreslang": "An AOT-first LLVM/native route targets startup-sensitive processes without booting the BEAM or a general JIT. GraalVM-backed Oreslang is a separate runtime profile and should not be confused with an LLVM native build.",
        "impact": "The interesting opportunity is to apply actor isolation to short-lived functions and mobile background tasks, not just always-on servers. Actual cold-start wins need matched tests."
      },
      {
        "topic": "Heavy CPU, GPU and data layout",
        "peer": "Elixir excels at orchestration and I/O. CPU-intensive kernels can run through NIFs, dirty schedulers, ports and native libraries, but each boundary adds a separate engineering surface.",
        "oreslang": "The LLVM plan brings native code generation, explicit ownership and data-oriented layouts under the language. Actors coordinate and supervise work; contiguous data and Tasks, not one actor per element, provide the hot compute path.",
        "impact": "One codebase could express both the fault-tolerant pipeline and its performance-sensitive kernel, with fewer duplicated ownership models."
      },
      {
        "topic": "Fault recovery and upgrades",
        "peer": "OTP supervisors, links, monitors and release upgrades are real production technology. Elixir inherits this advantage from Erlang and has strong deployment practices.",
        "oreslang": "Oreslang proposes typed supervision, actor lifecycle hooks, bounded mailboxes and versioned hot loading with staged activation and rollback. Isolation should extend to state and capability scopes, not only a logical process identifier.",
        "impact": "Aim to preserve the 'let it crash' operational style while making the conditions for safe recovery and code replacement more explicit."
      },
      {
        "topic": "Mutable memory and tenant boundaries",
        "peer": "BEAM processes isolate heaps and share immutable data efficiently, with per-process GC. A NIF runs outside the ordinary managed safety guarantees and needs great care.",
        "oreslang": "Actor-owned mutable arenas, authorized immutable sharing and compiler-checked borrows aim to confine state even in native-code paths. The LLVM zero-GC profile is a target; managed/GraalVM profiles may still collect.",
        "impact": "The promise is isolation without insisting that every trusted computation become a separate OS process or V8 isolate."
      }
    ],
    "boundary": "Choose Elixir now for production Phoenix, distributed OTP operations and proven live upgrades. Choose the Oreslang direction when static ownership plus native performance plus fault isolation must feel like one coherent language; no comparable production or cold-start win has been verified.",
    "sources": [
      {
        "label": "Elixir language and ecosystem",
        "url": "https://elixir-lang.org/"
      },
      {
        "label": "Erlang release and live code handling",
        "url": "https://www.erlang.org/doc/system/release_handling.html"
      },
      {
        "label": "BEAM native interoperability",
        "url": "https://www.erlang.org/doc/apps/erts/erl_nif.html"
      }
    ],
    "thesis": "Elixir showed developers how productive the actor model can be. Oreslang's wager is that you should not have to choose between that model and Rust-like static ownership, native AOT deployment, and compute-heavy work. The goal is a single language where your service's fast path and its resilient control plane live under the same safety rules.",
    "benefits": [
      {
        "title": "Compile-time message contracts",
        "detail": "Make the shape of messages, ownership transfers and absence explicit before a request enters a mailbox, rather than depending predominantly on runtime conventions."
      },
      {
        "title": "AOT-shaped deployment",
        "detail": "Target smaller native execution envelopes for short-lived jobs, on-device agents and FaaS handlers while keeping the actor model. Startup and memory gains remain to be benchmarked."
      },
      {
        "title": "Compute without a language handoff",
        "detail": "Design actor coordination and native numerical work to coexist through LLVM, instead of treating CPU/GPU kernels as an inherently foreign-language subsystem."
      }
    ],
    "useCases": [
      {
        "title": "Cold-start-sensitive actor services",
        "detail": "Bursty API/FaaS handlers and mobile background workers that want typed mailboxes and inexpensive native processes."
      },
      {
        "title": "Compute-heavy real-time pipelines",
        "detail": "Audio, sensor, ML pre/post-processing and simulation services requiring resilient orchestration around native data processing."
      }
    ]
  },
  {
    "id": "erlang",
    "name": "Erlang",
    "headline": "Keep Erlang's 'let it crash' resilience. Add ownership and native reach.",
    "strength": "Erlang/OTP has decades of production experience in telecom, messaging and high-availability infrastructure. Lightweight processes, pattern matching, supervisors, hot code upgrades and per-process GC are exceptionally thoughtful engineering.",
    "angles": [
      {
        "topic": "Dynamic messages versus checked protocols",
        "peer": "Erlang matches message patterns dynamically. Records, specs and Dialyzer improve confidence, yet arbitrary mailbox messages can still surprise a receiver at runtime.",
        "oreslang": "Typed ActorRef messages, Option/Result handling and ownership constraints are designed to catch protocol and lifetime errors earlier. The actor mailbox should remain isolated and linearizable as implementations mature.",
        "impact": "Protocol drift becomes a compiler or schema problem rather than a production mailbox surprise."
      },
      {
        "topic": "Where CPU cycles are spent",
        "peer": "The BEAM scheduler excels at many independent small processes; long CPU-bound native work is normally moved into dirty NIF schedulers or other native integrations.",
        "oreslang": "An LLVM compilation path targets CPU-intensive loops, tightly packed data, SIMD-friendly storage and future device kernels while keeping actors for supervision and coordination.",
        "impact": "The design avoids forcing teams to choose a second language whenever control-plane code meets a hot numerical loop."
      },
      {
        "topic": "Memory lifetime and collection",
        "peer": "Per-process heaps make Erlang GC much less disruptive than a monolithic collector, but memory is still GC-managed in the usual BEAM execution model.",
        "oreslang": "Oreslang combines actor-local mutable arenas, borrow checking and explicit sharing domains. A strict LLVM profile targets no runtime tracing GC, while a GraalVM profile can retain managed collection.",
        "impact": "For systems with tight allocation and latency budgets, lifecycle control could be as explicit as mailbox ownership."
      },
      {
        "topic": "Supervision and live evolution",
        "peer": "Erlang/OTP supplies mature linking, monitors, supervisors and code replacement. The ecosystem has refined restart strategies over decades.",
        "oreslang": "Oreslang's plan adds typed lifecycle contracts, staged versioned reload, ability to roll back, and explicit trust/capability limits. Failures should route to supervisors rather than corrupt peers' state.",
        "impact": "The objective is to retain OTP-style recoverability while making upgrades and permissions more auditable."
      },
      {
        "topic": "Beyond a conventional OS host",
        "peer": "Erlang is a BEAM runtime language and is most at home on devices that can host that runtime.",
        "oreslang": "Oreslang separates freestanding core, optional allocation/runtime services and stdlib/OTP analogues. Bare-metal and specialized accelerator targets are longer-term subsets, not a claim that complete actors already run on an FPGA.",
        "impact": "A small kernel and a supervised cloud service could eventually share a language vocabulary without sharing one heavyweight deployment model."
      }
    ],
    "boundary": "Use Erlang when battle-tested distributed operations and OTP compatibility dominate the decision. Oreslang is making an architectural bet on typed, native, memory-safe actors; matching Erlang's reliability will require substantial conformance and operational evidence.",
    "sources": [
      {
        "label": "Erlang/OTP documentation",
        "url": "https://www.erlang.org/docs"
      },
      {
        "label": "Erlang native and dirty schedulers",
        "url": "https://www.erlang.org/doc/apps/erts/erl_nif.html"
      },
      {
        "label": "Erlang release management",
        "url": "https://www.erlang.org/doc/system/release_handling.html"
      }
    ],
    "thesis": "Erlang proved that concurrent systems become manageable when failure is isolated and supervised. Oreslang treats that achievement as the starting point, not the finish line: it is designing an actor system with static message contracts, borrow-aware native memory and a runtime that is not confined to the BEAM.",
    "benefits": [
      {
        "title": "Isolation you can type-check",
        "detail": "Make actor communication and ownership transfer explicit and verifiable before deployment, not solely through runtime discipline."
      },
      {
        "title": "Native code as a first-class target",
        "detail": "Let the same language target native CPU-intensive logic and actor supervision with predictable ownership contracts."
      },
      {
        "title": "One model, many execution profiles",
        "detail": "Aim for full actor runtimes where available and a freestanding core for hardware-constrained environments."
      }
    ],
    "useCases": [
      {
        "title": "Native telecom and edge workloads",
        "detail": "Real-time protocol handlers near DSP/signal-processing kernels, with supervision kept near the fast path."
      },
      {
        "title": "Multi-tenant native services",
        "detail": "Independent, restartable workloads needing typed messages and per-tenant memory/capability boundaries."
      }
    ]
  },
  {
    "id": "gleam",
    "name": "Gleam",
    "headline": "Gleam brings types to the BEAM. Oreslang brings actors toward native hardware.",
    "strength": "Gleam has a clean statically typed syntax, strong inference and approachable functional programming, with official Erlang and JavaScript targets. It gains practical reach through both BEAM packages and JavaScript ecosystems.",
    "angles": [
      {
        "topic": "How far the type system reaches",
        "peer": "Gleam provides static inference, algebraic data types and pattern matching. It does not attempt to be a Rust-style borrow-checked memory-ownership language.",
        "oreslang": "Oreslang pairs static nominal/structural types with borrow and ownership semantics. Actors own mutable memory; moving or sharing values across boundaries should require a checkable capability.",
        "impact": "Types describe not only what data is, but who can safely touch it and for how long."
      },
      {
        "topic": "Runtime targets",
        "peer": "Gleam targets both Erlang/BEAM and JavaScript. That is real portability, but it inherits the runtime and FFI characteristics of whichever host is chosen.",
        "oreslang": "Oreslang targets GraalVM and LLVM with an explicit distinction between managed and native profiles; future Wasm, freestanding and accelerator integrations must be individually validated.",
        "impact": "One language aims to span native compute, actor-based services and constrained environments, rather than only portable source code."
      },
      {
        "topic": "CPU/GPU-intensive work",
        "peer": "Gleam on BEAM delegates intensive numerical work through NIFs, ports or packages; its JavaScript target can use workers/native addons and accelerator APIs.",
        "oreslang": "Oreslang's native plan favors contiguous data-oriented layouts and kernel-friendly ownership within an actor-controlled workload. Actors supervise batches; Tasks execute parallel work.",
        "impact": "The core computation and the message-driven control plane could be optimized as parts of the same language."
      },
      {
        "topic": "Concurrency semantics",
        "peer": "Gleam can use OTP actors on its Erlang target; different concurrency tools apply on JavaScript. Its type system does not provide one universal native actor scheduler across hosts.",
        "oreslang": "A consistent Task versus Actor distinction is a primary goal: Tasks for lightweight computations and actors for owned state, mailbox ordering, faults and hot replacement.",
        "impact": "The developer chooses isolation intentionally, without turning every concurrent function into a heavyweight process."
      },
      {
        "topic": "Failure containment and lifecycle",
        "peer": "Gleam benefits from BEAM supervision libraries, but executable capabilities and reload mechanisms depend on the selected backend and runtime integration.",
        "oreslang": "The Oreslang runtime design makes supervision, capability confinement, message admission and versioned code replacement part of the same contract across implementations.",
        "impact": "An actor becomes a unit of recovery, authority and code evolution—not just a convenient way to send messages."
      }
    ],
    "boundary": "Choose Gleam now for a polished typed functional experience and access to BEAM or JavaScript ecosystems. Oreslang's pitch is stronger ownership and broader native systems ambitions, not the false claim that Gleam only compiles to Erlang.",
    "sources": [
      {
        "label": "Gleam documentation and targets",
        "url": "https://gleam.run/documentation/"
      },
      {
        "label": "Gleam language tour",
        "url": "https://tour.gleam.run/"
      },
      {
        "label": "Erlang NIF reference",
        "url": "https://www.erlang.org/doc/apps/erts/erl_nif.html"
      }
    ],
    "thesis": "Gleam is an excellent answer to 'what if Erlang/Elixir had a modern static type system?' Oreslang asks a larger systems question: what if actor supervision, a borrow checker, native compilation and explicit memory domains were designed together rather than added around the BEAM?",
    "benefits": [
      {
        "title": "Types plus ownership",
        "detail": "Go beyond checking values: reason about exclusive mutation, borrowing, transfer and private actor state."
      },
      {
        "title": "A different performance envelope",
        "detail": "Design LLVM-native and zero-GC profiles for hot compute loops without relying on FFI-heavy BEAM deployments."
      },
      {
        "title": "A deeper actor runtime contract",
        "detail": "Make supervision, Task cancellation, typed mailboxes and reload semantics core design constraints."
      }
    ],
    "useCases": [
      {
        "title": "Typed services with native hot paths",
        "detail": "Message-driven services that also include codecs, numerical transformations or local AI computations."
      },
      {
        "title": "Systems that outgrow BEAM-only execution",
        "detail": "Applications needing an actor-style architecture but deployment on native or eventually freestanding targets."
      }
    ]
  },
  {
    "id": "rust",
    "name": "Rust",
    "headline": "Rust's ownership mindset, with actors and Tasks designed into the language experience.",
    "strength": "Rust provides mature native performance, a borrow checker, a large ecosystem and excellent libraries for async runtimes, actors and GPU work.",
    "angles": [
      {
        "topic": "Tasks",
        "peer": "Rust has async/await and lightweight tasks through runtimes such as Tokio; this is not a missing Rust capability.",
        "oreslang": "Oreslang proposes built-in lightweight nb Tasks with awaitable handles and an M:N scheduler, reducing runtime/framework assembly."
      },
      {
        "topic": "Actors and faults",
        "peer": "Actor models are available in Rust libraries such as Actix; ownership helps prevent data races.",
        "oreslang": "Typed actors, mailbox isolation, supervision and controlled hot-swapping are meant to be integrated parts of Oreslang's language and runtime."
      },
      {
        "topic": "Memory model",
        "peer": "Rust can operate without GC and with no_std on bare metal; this is a major strength.",
        "oreslang": "Oreslang targets similarly strict ownership for its LLVM profile while combining it with an Erlang-inspired actor model."
      }
    ],
    "boundary": "Rust is already the stronger choice for production native tooling and embedded targets. Oreslang is differentiating on integrated concurrency and live lifecycle semantics, not claiming Rust lacks tasks or actors.",
    "sources": [
      {
        "label": "Tokio tasks",
        "url": "https://tokio.rs/tokio/tutorial/spawning"
      },
      {
        "label": "Actix actor framework",
        "url": "https://actix.rs/docs/actix/"
      }
    ]
  },
  {
    "id": "java",
    "name": "Java",
    "headline": "Beyond virtual threads: isolate mutable state as an actor-level rule.",
    "strength": "Java delivers a broad ecosystem, powerful JIT optimization, mature observability and virtual threads for scalable concurrent I/O.",
    "angles": [
      {
        "topic": "Concurrency",
        "peer": "Virtual threads make thread-per-request styles practical, but Java code can still freely share mutable objects and require synchronization.",
        "oreslang": "Oreslang's actors aim to enforce owned mutable state and typed message boundaries, alongside lightweight Tasks."
      },
      {
        "topic": "GC and native",
        "peer": "The JVM offers several sophisticated collectors and native-image options through GraalVM; pauses and footprints are configuration-dependent.",
        "oreslang": "The LLVM profile targets zero runtime GC in supported allocation modes; GraalVM-backed Oreslang may still have managed-runtime GC."
      },
      {
        "topic": "Hot reload",
        "peer": "JVM reload and actor frameworks exist, but semantics depend on libraries, classloaders and tooling.",
        "oreslang": "Versioned code loading, supervision and state isolation are intended to be explicit language/runtime contracts."
      }
    ],
    "boundary": "Do not claim all JVM deployments have large pauses, or that every Oreslang backend is GC-free. Native image startup and full-VM behavior require measured comparisons.",
    "sources": [
      {
        "label": "Java virtual threads (JEP 444)",
        "url": "https://openjdk.org/jeps/444"
      },
      {
        "label": "GraalVM Native Image",
        "url": "https://www.graalvm.org/latest/reference-manual/native-image/"
      }
    ]
  },
  {
    "id": "cpp",
    "name": "C++",
    "headline": "Native control with a safer default story for ownership, actors and lifecycle.",
    "strength": "C++ offers close-to-hardware control, zero-required-GC execution, mature compilers, portable native libraries and deep GPU/embedded ecosystems.",
    "angles": [
      {
        "topic": "Safety",
        "peer": "C++ can achieve deterministic lifetime with RAII and smart pointers, but aliasing and concurrency rules place substantial responsibility on developers.",
        "oreslang": "Oreslang proposes compile-time borrow/ownership constraints and private actor state to make unsafe sharing harder by default."
      },
      {
        "topic": "Async and actors",
        "peer": "C++20 includes coroutines; actors and task scheduling typically come from libraries and application conventions.",
        "oreslang": "Tasks, actor mailboxes, supervision and controlled reload are intended as interoperable runtime primitives."
      },
      {
        "topic": "Hardware",
        "peer": "C++ is already used on bare metal, accelerators and constrained systems.",
        "oreslang": "Oreslang's freestanding core and LLVM/GPU/FPGA/ASIC ambitions are targets, not evidence of comparable device support."
      }
    ],
    "boundary": "C++ is mature and excellent for specialized native hardware. Oreslang's safety and fault-containment ideas must prove their runtime costs and toolchain quality.",
    "sources": [
      {
        "label": "C++ coroutines overview",
        "url": "https://en.cppreference.com/w/cpp/language/coroutines"
      }
    ]
  },
  {
    "id": "golang",
    "name": "Go",
    "headline": "Go's channel-first philosophy, with ownership boundaries and actors as the default.",
    "strength": "Go makes goroutines, channels, fast builds and operationally simple network services exceptionally accessible.",
    "angles": [
      {
        "topic": "Communication",
        "peer": "Go encourages sharing memory by communicating; it also allows shared mutable memory and has no language borrow checker.",
        "oreslang": "Oreslang aims to make typed actor mailboxes and actor-owned mutable heaps a more enforceable realization of that principle."
      },
      {
        "topic": "Async model",
        "peer": "Go uses goroutines rather than async/await syntax; goroutines are lightweight and run concurrently across OS threads.",
        "oreslang": "Oreslang distinguishes lightweight nb Tasks from state-isolated actors, with explicit awaitable Task handles and supervision."
      },
      {
        "topic": "GC and hardware",
        "peer": "Go uses a low-latency concurrent garbage collector; short stop-the-world phases can still occur.",
        "oreslang": "LLVM Oreslang targets zero-GC modes and a freestanding core, with future FPGA/ASIC-oriented subsets. Neither is broadly verified yet."
      }
    ],
    "boundary": "Go may be the simpler, more reliable deployment choice today. Zero-GC does not guarantee lower end-to-end latency, and hardware targets require evidence.",
    "sources": [
      {
        "label": "Effective Go — concurrency",
        "url": "https://go.dev/doc/effective_go#concurrency"
      },
      {
        "label": "Go GC guide",
        "url": "https://go.dev/doc/gc-guide"
      }
    ]
  },
  {
    "id": "nodejs",
    "name": "Node.js",
    "headline": "Keep the event-driven developer experience; make multi-core actor execution natural.",
    "strength": "Node.js is an excellent I/O-first runtime with the npm ecosystem, async/await, a polished event loop and libuv integration.",
    "angles": [
      {
        "topic": "Threading",
        "peer": "A typical Node.js process runs JavaScript callbacks on a main event-loop thread; libuv offloads selected operations to its thread pool, and Worker threads execute JavaScript in parallel.",
        "oreslang": "Oreslang aims to schedule many Tasks and actors over a configurable M:N worker pool in one OS process, using available CPU cores without putting all application handlers on one JS thread."
      },
      {
        "topic": "Isolation",
        "peer": "Worker threads create independent JavaScript execution environments and V8 isolates; their cost and message-transfer behavior differ from a callback.",
        "oreslang": "Actors are intended to own mutable heaps while sharing authorized immutable code and communicating inside one runtime, avoiding mandatory TCP or per-actor V8 isolates."
      },
      {
        "topic": "Compute and upgrades",
        "peer": "Workers, native addons and external services handle parallel CPU work; hot-reload patterns depend on tooling.",
        "oreslang": "Native LLVM targets and supervised versioned actors aim to make compute and swapping code an integrated workflow."
      }
    ],
    "boundary": "Thread counts are adaptive, not a promised fixed 10–50 workers. Same-process messaging is not inherently zero-copy, nor is it automatically faster than Node workers without a benchmark.",
    "sources": [
      {
        "label": "Node.js Worker threads",
        "url": "https://nodejs.org/api/worker_threads.html"
      },
      {
        "label": "Node.js event-loop guide",
        "url": "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick"
      }
    ]
  },
  {
    "id": "csharp",
    "name": "C#",
    "headline": "From mainstream async/await to typed, isolated and reloadable actors.",
    "strength": "C# helped popularize language-integrated async/await and offers an excellent .NET runtime, tooling, memory safety and sophisticated actor frameworks such as Orleans.",
    "angles": [
      {
        "topic": "Async foundations",
        "peer": "C# introduced its async/await syntax in C# 5, making asynchronous code approachable; async patterns predate it in other ecosystems.",
        "oreslang": "Oreslang adds an explicit Task/actor distinction: nb Tasks for lightweight work, actors for owned state and fault isolation."
      },
      {
        "topic": "Sharing and actors",
        "peer": "Ordinary C# objects can share mutable state; Orleans and Akka.NET offer actor models through frameworks.",
        "oreslang": "Oreslang is designed to encode actor isolation, typed messages and supervision into core language/runtime semantics rather than requiring a framework."
      },
      {
        "topic": "Runtime and deployment",
        "peer": ".NET offers tiered JIT, native AOT and configurable managed GC; Orleans has real production deployments.",
        "oreslang": "Oreslang aims for independent GraalVM and LLVM implementations and zero-GC LLVM profiles without coupling actor contracts to a single managed runtime."
      }
    ],
    "boundary": "C# already has native AOT and production actor frameworks. Oreslang's main proposed advantage is integration and stricter default isolation, not invented async/await or universal speed.",
    "sources": [
      {
        "label": "C# async programming",
        "url": "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/"
      },
      {
        "label": "Microsoft Orleans",
        "url": "https://learn.microsoft.com/en-us/dotnet/orleans/overview"
      }
    ]
  },
  {
    "id": "ocaml",
    "name": "OCaml",
    "headline": "Strong functional typing meets supervised, ownership-aware actor systems.",
    "strength": "OCaml provides excellent static inference, algebraic data types, pattern matching, native-code compilation and modern multicore support.",
    "angles": [
      {
        "topic": "Static discipline",
        "peer": "OCaml's type system and functional-first style make many illegal states hard to express.",
        "oreslang": "Oreslang builds on that idea with explicit borrowing, capability boundaries and actor-owned mutable state."
      },
      {
        "topic": "Parallelism",
        "peer": "OCaml 5 has multicore Domains and effect handlers; Eio and other libraries provide lightweight concurrency.",
        "oreslang": "Oreslang proposes an integrated M:N Task scheduler alongside typed actor message passing and supervision."
      },
      {
        "topic": "Memory and hot reload",
        "peer": "OCaml is GC-managed by default and does not have OTP-style supervised hot code swapping as a built-in language model.",
        "oreslang": "LLVM profiles target explicit ownership with zero-GC execution and versioned actor hot reload."
      }
    ],
    "boundary": "OCaml's native compiler and multicore facilities are real. Oreslang's actor and no-GC goals are not a claim that OCaml lacks efficient parallel computing.",
    "sources": [
      {
        "label": "OCaml parallel programming",
        "url": "https://ocaml.org/manual/5.4/parallelism.html"
      },
      {
        "label": "OCaml effect handlers",
        "url": "https://ocaml.org/manual/5.3/effects.html"
      }
    ]
  }
];
