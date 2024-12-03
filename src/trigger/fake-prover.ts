import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"
import { faker } from "@snaplet/copycat"
import { logger, schedules } from "@trigger.dev/sdk/v3"

const client = createPublicClient({
  chain: mainnet,
  // TODO use custom rpc endpoint
  transport: http(),
})

const SITE_URL = process.env.SITE_URL || "http://localhost:3000"
const API_KEYS = process.env.API_KEYS?.split(",") || []

const generateFakeProof = (blockNumber: bigint) => {
  return {
    block_number: Number(blockNumber),
    proof: "binary_proof_data",
    proof_status: faker.helpers.arrayElement(["proved", "proving", "queued"]),
    machine_id: 1,
    proof_latency: faker.number.int({ min: 1, max: 1000 }),
    proving_cost: faker.number.float({ min: 1, max: 10 }),
    proving_cycles: faker.number.int({ min: 1000000, max: 10000000 }),
  }
}

export const fakeProverTask = schedules.task({
  id: "fake-prover-task",
  //every 20 minutes
  cron: "*/20 * * * *",
  run: async () => {
    // fetch last block using viem
    const block = await client.getBlock({ blockTag: "safe" })
    const blockNumber = block.number

    logger.info(`Generating proofs for block ${blockNumber}`, {
      url: `${SITE_URL}/api/v0/proofs`,
    })

    for (const apiKey of API_KEYS) {
      const proof = generateFakeProof(blockNumber)
      logger.info(
        `Submitting proof for block ${blockNumber} with API key ${apiKey.slice(0, 8)}...`,
        { proof }
      )

      try {
        const response = await fetch(`${SITE_URL}/api/v0/proofs`, {
          method: "POST",
          body: JSON.stringify(proof),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        })

        if (!response.ok) {
          logger.error(
            `Failed to submit proof: ${response.status} ${response.statusText}, ${await response.text()}`
          )
        } else {
          logger.info(`Successfully submitted proof for block ${blockNumber}`)
        }
      } catch (error) {
        logger.error(`Error submitting proof: ${error}`)
      }
    }
  },
})
