export const GRID_CELL_BG_SPECTRUM: string[] = [
  "bg-body-secondary/[5%]",
  "bg-primary/10",
  "bg-primary/20",
  "bg-primary/40",
  "bg-primary/60",
  "bg-primary/80",
  "bg-primary/100",
]

export const getBoxColor = (value: number) => {
  const index =
    value >= 2 ? Math.floor(Math.log2(value)) + 1 : value === 1 ? 1 : 0
  return GRID_CELL_BG_SPECTRUM[index]
}

export const getBoxIndexColor = (index: number) => {
  return GRID_CELL_BG_SPECTRUM[(index + 1) % GRID_CELL_BG_SPECTRUM.length]
}
