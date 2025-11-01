import type { Block } from "./types"

export interface CSVExportConfig<T> {
  headers: string[]
  formatRow: (item: T) => (string | number)[]
}

/**
 * Generic CSV export function that works with any data type
 * @param data - Array of items to export
 * @param config - Configuration object with headers and formatRow function
 * @param filename - Name of the downloaded file (without .csv extension)
 */
export function exportToCsv<T>(
  data: T[],
  config: CSVExportConfig<T>,
  filename: string
): void {
  if (data.length === 0) {
    console.warn("No data to export")
    return
  }

  const { headers, formatRow } = config

  // Convert data to CSV rows
  const rows = data.map(formatRow)

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((field) => {
          const stringValue = String(field ?? "")
          // Escape commas and quotes in CSV fields
          return stringValue.includes(",") || stringValue.includes('"')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue
        })
        .join(",")
    ),
  ].join("\n")

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export interface ColumnLabel {
  value: string
  label: string
}

/**
 * Generic export function that uses column labels to format and export data to CSV
 * @param data - Array of items to export
 * @param columnLabels - Array of column labels to use for headers
 * @param filename - Name of the downloaded file (without .csv extension)
 */
export function exportWithLabels<T>(
  data: T[],
  columnLabels: ColumnLabel[],
  filename: string
): void {
  const exportLabels = columnLabels.filter((label) => label.value !== "select")
  const headers = exportLabels.map((label) => label.label)
  const columnIds = exportLabels.map((label) => label.value)

  const config: CSVExportConfig<T> = {
    headers,
    formatRow: (item) => {
      return columnIds.map((columnId) => {
        const value = item[columnId as keyof T]

        if (typeof value === "boolean") {
          return value ? "Yes" : "No"
        }
        if (
          Array.isArray(value) ||
          (typeof value === "object" && value !== null)
        ) {
          return JSON.stringify(value)
        }
        return String(value ?? "")
      })
    },
  }

  exportToCsv(data, config, filename)
}
