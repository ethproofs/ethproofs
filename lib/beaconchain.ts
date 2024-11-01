import {
  BEACON_CHAIN_GENESIS_TIME,
  MS_PER_SLOT,
  SLOTS_PER_EPOCH,
} from "./constants"

/**
 * Converts a given timestamp to a slot number in the Beacon Chain.
 *
 * @param timestamp - The timestamp to convert, either as a number (milliseconds since epoch) or a string (date string).
 * @returns The corresponding slot number.
 */
export const timestampToSlot = (timestamp: number | string): number => {
  const time =
    typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp
  return Math.floor((time - BEACON_CHAIN_GENESIS_TIME) / MS_PER_SLOT)
}

/**
 * Converts a slot number to an epoch number.
 *
 * @param slot - The slot number to convert.
 * @returns The corresponding epoch number.
 */
export const slotToEpoch = (slot: number): number =>
  Math.floor(slot / SLOTS_PER_EPOCH)

/**
 * Converts a given timestamp to its corresponding epoch.
 *
 * @param timestamp - The timestamp to convert, which can be a number or a string.
 * @returns The epoch corresponding to the given timestamp.
 */
export const timestampToEpoch = (timestamp: number | string): number =>
  slotToEpoch(timestampToSlot(timestamp))
