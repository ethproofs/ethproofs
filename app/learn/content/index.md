### What is Ethproofs?

Ethproofs is a block proof explorer for Ethereum. It aggregates data from various zkVM teams to provide a comprehensive overview of proven blocks, including key metrics such as cost, latency, and proving time.

Users can compare proofs by block, download them, and explore various proof metadata (size, clock cycle, type) to better understand the individual zkVMs and their proof generation process.

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

- [A Zero-Knowledge Paradigm Series](https://www.lita.foundation/blog/zero-knowledge-paradigm-zkvm) (Article)
- [Cairo – A Turing-Complete STARK-Friendly CPU Architecture - Shahar Papini](https://www.youtube.com/watch?v=vVgHL5vpJxY&t=33s) (Video)
- [Lasso + Jolt Playlist](https://youtube.com/playlist?list=PLjQ9HCQMu_8xjOEM_vh5p26ODtr-mmGxO&si=Uega8IMg_J8kNaa8) (Video)
- [New Paradigm in Ethereum L2 Scaling: Multi-Proving and ZK-VMs](https://www.mikkoikola.com/blog/2023/12/11/new-paradigm-in-ethereum-l2-scaling-multi-proving-and-zk-vms) (Article)
- [The Nexus v1.0 zkVM - Daniel Marin (Nexus)](https://www.youtube.com/watch?v=UtzFOwQp8n4) (Video)
- [Understanding Jolt: Clarifications and Reflections](https://a16zcrypto.com/posts/article/understanding-jolt-clarifications-and-reflections/) (Article)
- [ZK Whiteboard Sessions – Module Seven: Zero Knowledge Virtual Machines (zkVM) with Grjte](https://www.youtube.com/watch?v=GRFPGJW0hic) (Video)
- [ZK10: Analysis of zkVM Designs - Wei Dai & Terry Chung](https://www.youtube.com/watch?v=tWJZX-WmbeY&t=325s) (Video)
- [ZK11: O1VM: Building a Real-World zkVM for MIPS - Danny Willems](https://www.youtube.com/watch?v=HDH2KXRAxAc) (Video)
- [ZK12: Memory Checking in IVC-Based zkVM - Jens Groth](https://www.youtube.com/watch?v=kzSYNFh4uQ0&list=PLothk45x3HC9Oz4f3e9-OoYUEytfHWCl5) (Video)
- [ZK7: Miden VM: A STARK-Friendly VM for Blockchains - Bobbin Threadbare – Polygon](https://www.youtube.com/watch?v=81UAaiIgIYA&t=803s) (Video)
- [Zeroing Into zkVM](https://taiko.mirror.xyz/e_5GeGGFJIrOxqvXOfzY6HmWcRjCjRyG0NQF1zbNpNQ) (Article)
- [zkVM Design Walkthrough with Max and Daniel](https://www.youtube.com/watch?v=aobrJ-zTcAU) (Video)
- [Verification of zkWasm in Coq](https://github.com/CertiKProject/zkwasm-fv) (Repository)
- [ZK11: Polynomial Acceleration for STARK VMs](https://www.youtube.com/watch?v=R07ina4k7hg) (Video)
- [What Does RISC V Have to Do with RISC Zero's zkVM](https://www.youtube.com/watch?v=11DIflEwx50) (Video)
- [RISC Zero Architecture Presentation @ Stanford](https://www.youtube.com/watch?v=RtGk6967PC4) (Video)
- [Continuations: Scaling in zkVM](https://www.youtube.com/watch?v=h1qWnf-M5lo) (Video)
- [Getting the Bugs Out of SNARKs: The Road Ahead](https://a16zcrypto.com/posts/article/getting-bugs-out-of-snarks/) (Article)
- [~tacryt-socryp on Zorp, the Nock zkVM | Reassembly23](https://www.youtube.com/watch?v=zD45V6GAD00) (Video)

### tutorials

- [Brainfuck Tutorial](https://neptune.cash/learn/brainfuck-tutorial/) (Tutorial)
- [Chip0](https://github.com/shuklaayush/chip0) (Repository)
- [Continuous Read Only Memory Constraints an Implementation Using Lambdaworks](https://blog.lambdaclass.com/continuous-read-only-memory-constraints-an-implementation-using-lambdaworks/) (Article)
- [FRI From Scratch](https://blog.lambdaclass.com/how-to-code-fri-from-scratch/) (Article)
- [STARK By Hand](https://dev.risczero.com/proof-system/stark-by-hand) (Tutorial)
- [STARK Brainfuck](https://aszepieniec.github.io/stark-brainfuck/) (Tutorial)
- [STARK 101](https://starkware.co/stark-101/) (Tutorial)
- [STWO Brainfuck](https://github.com/kkrt-labs/stwo-brainfuck) (Repository)
- [Useless zkVM](https://github.com/armanthepythonguy/Useless-ZKVM) (Repository)
