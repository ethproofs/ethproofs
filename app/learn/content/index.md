## Overview

### What are zkEVM?

zkEVM, or Zero-Knowledge Ethereum Virtual Machine, is an advanced version of the Ethereum Virtual Machine (EVM) that utilizes zero-knowledge proofs to enhance privacy and scalability in executing smart contracts. It allows developers to run computations off-chain while submitting only proofs of their validity to the Ethereum mainnet, ensuring that sensitive data remains confidential.

By integrating zero-knowledge technology, zkEVM enables verifiable transactions without exposing underlying information, making it a crucial component of Layer 2 scaling solutions like zk-rollups. This innovation is pivotal for improving Ethereum’s throughput and accommodating a broader range of decentralized applications (dApps) while maintaining security and privacy.

### What are the proofs?

Proofs validate each Ethereum block like a stamp of authenticity. This unlocks faster, more secure transactions, ensuring efficiency and privacy and paving the way for a stronger Ethereum network. Proofs are a foundation for a new class of applications and clients and act as a major step towards a fully enshrined Ethereum.

### What are SNARKs?

SNARK stands for Succinct Non-interactive ARgument of Knowledge. It is a cryptographic proof that allows one party to demonstrate to another party that they know a particular piece of information without revealing the information itself.

Key features of SNARKs:

- Succinct: The proofs are very short and can be verified quickly, even if the original computation is complex.
- Non-interactive: The proof is provided in a single communication, with no need for multiple rounds of exchange between the prover and verifier.
- Argument of Knowledge: The prover demonstrates that they actually possess knowledge of the solution, not just that a solution exists.

In blockchain and Ethereum, SNARKs can be used to verify transactions or computations off-chain, improving scalability and privacy by reducing the amount of data that needs to be processed on-chain.

### Potential benefits and use cases

- Enabling full ZK light clients of Ethereum to run on low powered devices (eg. smartphones). Syncing with the network can be done via a single ZK proof verification (once we combine Zeth ZK proofs with Sync Committee ZK proofs).
- Reduce the time and resources necessary for a new node or wallet to participate in the Ethereum network.
- Validate any current or historic Ethereum state with a single proof.
- Lay the groundwork for multi-client & multi-proof ZK proofs of Ethereum.
- Start tests of Ethereum enshrinement. These proofs will provide a large corpus of data for further research into performance improvements, gas/proving fee schedules, and more for the larger ZK community.
- Empower the Ethereum Ecosystem to take this powerful new ZK technology

### More resources

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

### Tutorials

- [brainfuck tutorial](https://neptune.cash/learn/brainfuck-tutorial/)
- [chip0](https://github.com/shuklaayush/chip0)
- [continuous read only memory constraints an implementation using lambdaworks](https://blog.lambdaclass.com/continuous-read-only-memory-constraints-an-implementation-using-lambdaworks/)
- [fri from scratch](https://blog.lambdaclass.com/how-to-code-fri-from-scratch/)
- [stark by hand](https://dev.risczero.com/proof-system/stark-by-hand)
- [stark brainfuck](https://aszepieniec.github.io/stark-brainfuck/)
- [stark 101](https://starkware.co/stark-101/)
- [stwo brainfuck](https://github.com/kkrt-labs/stwo-brainfuck)
- [useless zkvm](https://github.com/armanthepythonguy/Useless-ZKVM)

## Ethproofs

### What is Ethproofs?

Ethproofs is a block explorer for Layer 1 zkEVM. It aggregates data from various proving vendors to provide a comprehensive overview of proven blocks, including key metadata such as cost, latency, and proofing time.

Users can compare proofs by block, download them, and explore vendor-specific metadata to better understand the proving process.

The aim is to establish a public good that evolves into the standard for zkEVM block exploration, ultimately expanding to encompass all Ethereum blocks while maintaining reasonable costs and latency. This project may also support multiple-proof systems in the future.
