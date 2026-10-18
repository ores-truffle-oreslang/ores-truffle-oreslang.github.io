/** Editorial comparisons: design intentions, not measured performance results. */
export const comparisons = [
  {
    "id": "elixir",
    "name": "Elixir",
    "headline": "The BEAM's ergonomics, with a different compilation and deployment target.",
    "strength": "Elixir pairs a productive functional language with OTP supervision, distributed processes, mature web tooling and live-upgrade experience.",
    "angles": [
      {
        "topic": "Typing",
        "peer": "Elixir remains a dynamically typed language, with growing static type checking capabilities.",
        "oreslang": "Oreslang is designed around compile-time types, ownership and typed actor messages."
      },
      {
        "topic": "Startup and deployment",
        "peer": "BEAM applications have a VM startup and release footprint; they can still be deployed effectively in containers and serverless setups.",
        "oreslang": "AOT/native deployment is a target for lower cold-start overhead in short-lived FaaS jobs and on-device processes. A speedup is not established without matched measurements."
      },
      {
        "topic": "Fault tolerance",
        "peer": "OTP's process isolation, supervision and live code upgrades are mature production features.",
        "oreslang": "Oreslang aims to combine similar supervision and hot-reload concepts with native backends and per-actor ownership boundaries."
      }
    ],
    "boundary": "Prefer Elixir today when production OTP, Phoenix and a mature BEAM ecosystem matter most. Oreslang's AOT cold-start advantage is a hypothesis, not a published head-to-head result.",
    "sources": [
      {
        "label": "Elixir official site",
        "url": "https://elixir-lang.org/"
      },
      {
        "label": "Erlang release handling",
        "url": "https://www.erlang.org/doc/system/release_handling.html"
      }
    ]
  },
  {
    "id": "erlang",
    "name": "Erlang",
    "headline": "Inspired by Erlang's actors; exploring stronger static guarantees and native execution.",
    "strength": "Erlang pioneered practical lightweight processes, isolated heaps, message passing, supervision and live upgrades at large scale.",
    "angles": [
      {
        "topic": "Types and memory",
        "peer": "Erlang's dynamic runtime and per-process garbage collection help isolate faults without a borrow checker.",
        "oreslang": "Oreslang proposes static types, ownership/borrowing, and actor-owned mutable memory."
      },
      {
        "topic": "CPU and GPU work",
        "peer": "BEAM can run parallel workloads and can delegate native CPU-intensive work to dirty NIF schedulers; GPU code usually needs an external library or native integration.",
        "oreslang": "LLVM/native and GPU-targeted paths are design goals for bringing more compute-intensive work into the language/runtime model."
      },
      {
        "topic": "Resilience",
        "peer": "OTP supervision and hot upgrades are widely exercised, proven operational tools.",
        "oreslang": "Actor supervision and versioned hot-reload are first-class design goals, but not yet proven at OTP's level."
      }
    ],
    "boundary": "Oreslang owes Erlang a great deal. BEAM's operational maturity is a real strength; native execution alone does not prove superiority for a given workload.",
    "sources": [
      {
        "label": "Erlang/OTP documentation",
        "url": "https://www.erlang.org/docs"
      },
      {
        "label": "Native functions and dirty schedulers",
        "url": "https://www.erlang.org/doc/apps/erts/erl_nif.html"
      }
    ]
  },
  {
    "id": "gleam",
    "name": "Gleam",
    "headline": "Both favor types; Oreslang aims at a broader native runtime envelope.",
    "strength": "Gleam brings delightful static typing and functional ergonomics to the Erlang ecosystem, and also compiles to JavaScript.",
    "angles": [
      {
        "topic": "Type systems",
        "peer": "Gleam's static types and inference are a major step forward for BEAM-oriented development.",
        "oreslang": "Oreslang's design adds explicit actor-owned memory, borrowing and isolation to static typing."
      },
      {
        "topic": "Targets",
        "peer": "Gleam officially targets Erlang/BEAM and JavaScript, including Node.js, Deno and Bun.",
        "oreslang": "Oreslang is developing GraalVM and LLVM routes, with native and specialized hardware profiles as longer-term goals."
      },
      {
        "topic": "Compute-heavy programs",
        "peer": "On BEAM, native CPU/GPU kernels are commonly delegated through ports or native integrations; JavaScript has its own runtime tradeoffs.",
        "oreslang": "The LLVM path targets tighter native compute integration without discarding actor-oriented fault isolation."
      }
    ],
    "boundary": "Gleam already has an excellent language and usable build workflow. Do not interpret Oreslang's proposed GPU/native support as a measured win or current backend parity.",
    "sources": [
      {
        "label": "Gleam build targets",
        "url": "https://gleam.run/documentation/command-line-reference/"
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
