### What is Ethproofs?

Ethproofs is a block proof explorer for Ethereum. It aggregates data from various zkVM teams to provide a comprehensive overview of proven blocks, including key metrics such as cost, latency, and proving time.

Users can compare proofs by block, download them, and explore various proof metadata (size, clock cycle, type) to better understand the individual zkVMs and its proof generation process.

The aim is to establish a public good that evolves into the standard for Ethereum block execution proof for zkVMs, ultimately expanding to encompass all Ethereum blocks while maintaining reasonable costs and latency. This project may also support multiple-proof systems in the future.

### What is zkVM?

A zkVM (Zero-Knowledge Virtual Machine) is a virtual machine that leverages [zero-knowledge proofs](https://ethereum.org/en/zero-knowledge-proofs/) for private and verifiable computation on generic programs. It is a broader concept than a zkEVM (Zero-Knowledge Ethereum Virtual Machine), which is a specific type of zkVM designed to execute Ethereum smart contracts.

### What are SNARKs?

SNARK stands for Succinct Non-interactive ARgument of Knowledge. It is a cryptographic proof that allows one party to demonstrate to another party that they know a particular piece of information without revealing the information itself.

**Key features of SNARKs:**

- **Succinct:** The proofs are very short and can be verified quickly, even if the original computation is complex.
- **Non-interactive:** The proof is provided in a single communication, with no need for multiple rounds of exchange between the prover and verifier.
- **Argument of Knowledge:** The prover demonstrates that they actually possess knowledge of the solution, not just that a solution exists.

In blockchain and Ethereum, SNARKs can be used to verify state or computations off-chain, improving scalability and privacy by reducing the amount of data that needs to be processed on-chain.

### What are potential benefits?

- **Enable full ZK light clients** of Ethereum to run on low powered devices (eg. smartphones). Syncing with the network can be done via a single ZK proof verification (once we combine block execution ZK proofs with Sync Committee ZK proofs).
- **Reduce time and resources** necessary for a new node or wallet to participate in the Ethereum network.
- **Validate Ethereum state** with a single proof.
- **Lay the groundwork** for multi-client & multi-proof ZK proofs of Ethereum.
- **Test Ethereum enshrinement** by providing a large corpus of data for further research into performance improvements, gas/proving fee schedules, and more for the larger ZK community.
- **Empower the Ethereum Ecosystem** to take control of this powerful technology.

### Want to learn about zkVMs?

Here is a [list of zkVMs](https://github.com/rkdud007/awesome-zkvm?tab=readme-ov-file) that have been designed through various approaches.

### more resources

- [a zero-knowledge paradigm series](https://www.lita.foundation/blog/zero-knowledge-paradigm-zkvm)
- [cairo – a turing-complete stark-friendly cpu architecture - shahar papini](https://www.youtube.com/watch?v=vVgHL5vpJxY&t=33s)
- [lasso + jolt playlist](https://youtube.com/playlist?list=PLjQ9HCQMu_8xjOEM_vh5p26ODtr-mmGxO&si=Uega8IMg_J8kNaa8)
- [new paradigm in ethereum l2 scaling: multi-proving and zk-vms](https://www.mikkoikola.com/blog/2023/12/11/new-paradigm-in-ethereum-l2-scaling-multi-proving-and-zk-vms)
- [the nexus v1.0 zkvm - daniel marin (nexus)](https://www.youtube.com/watch?v=UtzFOwQp8n4)
- [understanding jolt: clarifications and reflections](https://a16zcrypto.com/posts/article/understanding-jolt-clarifications-and-reflections/)
- [zk whiteboard sessions – module seven: zero knowledge virtual machines (zkvm) with grjte](https://www.youtube.com/watch?v=GRFPGJW0hic)
- [zk10: analysis of zkvm designs - wei dai & terry chung](https://www.youtube.com/watch?v=tWJZX-WmbeY&t=325s)
- [zk11: o1vm: building a real-world zkvm for mips - danny willems](https://www.youtube.com/watch?v=HDH2KXRAxAc)
- [zk12: memory checking in ivc-based zkvm - jens groth](https://www.youtube.com/watch?v=kzSYNFh4uQ0&list=PLothk45x3HC9Oz4f3e9-OoYUEytfHWCl5)
- [zk7: miden vm: a stark-friendly vm for blockchains - bobbin threadbare – polygon](https://www.youtube.com/watch?v=81UAaiIgIYA&t=803s)
- [zeroing into zkvm](https://taiko.mirror.xyz/e_5GeGGFJIrOxqvXOfzY6HmWcRjCjRyG0NQF1zbNpNQ)
- [zkvm design walkthrough with max and daniel](https://www.youtube.com/watch?v=aobrJ-zTcAU)
- [Verification of zkWasm in Coq](https://github.com/CertiKProject/zkwasm-fv)
- [zk11: polynomial acceleration for stark vms](https://www.youtube.com/watch?v=R07ina4k7hg)
- [what does risc v have to do with risc zero's zkvm](https://www.youtube.com/watch?v=11DIflEwx50)
- [risc zero architecture presentation @ stanford](https://www.youtube.com/watch?v=RtGk6967PC4)
- [continuations: scaling in zkvm](https://www.youtube.com/watch?v=h1qWnf-M5lo)
- [Getting the bugs out of SNARKs: The road ahead](https://a16zcrypto.com/posts/article/getting-bugs-out-of-snarks/)
- [~tacryt-socryp on Zorp, the Nock zkVM | Reassembly23](https://www.youtube.com/watch?v=zD45V6GAD00)

### tutorials

- [brainfuck tutorial](https://neptune.cash/learn/brainfuck-tutorial/)
- [chip0](https://github.com/shuklaayush/chip0)
- [continuous read only memory constraints an implementation using lambdaworks](https://blog.lambdaclass.com/continuous-read-only-memory-constraints-an-implementation-using-lambdaworks/)
- [fri from scratch](https://blog.lambdaclass.com/how-to-code-fri-from-scratch/)
- [stark by hand](https://dev.risczero.com/proof-system/stark-by-hand)
- [stark brainfuck](https://aszepieniec.github.io/stark-brainfuck/)
- [stark 101](https://starkware.co/stark-101/)
- [stwo brainfuck](https://github.com/kkrt-labs/stwo-brainfuck)
- [useless zkvm](https://github.com/armanthepythonguy/Useless-ZKVM)
