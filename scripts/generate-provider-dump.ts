import * as fs from "fs"
import * as path from "path"

import aws from "../aws_2025-03-25.json"
import vast from "../vast_2025-03-25.json"

type Vast = (typeof vast)[number]
type Aws = (typeof aws)[number]

function generateInsertStatements(
  rows: Vast[] | Aws[],
  outputSqlFilePath: string
) {
  // Extract column names from the first object
  const columns = Object.keys(rows[0]).join(", ")

  // Generate values for all rows
  const values = rows
    .map((row) => {
      const rowValues = Object.values(row)
        .map((value) => {
          if (value === null) {
            return "NULL"
          } else if (typeof value === "string") {
            return `'${value.replace(/'/g, "''")}'` // Escape single quotes
          } else {
            return value
          }
        })
        .join(", ")
      return `(${rowValues})`
    })
    .join(",\n  ")

  // Generate the single INSERT statement
  const insertStatement = `
  INSERT INTO instance_types (${columns})
  VALUES
    ${values};
    `.trim()

  // Generate INSERT or UPDATE (ON CONFLICT) statements
  //   const statements = rows.map((row) => {
  //     const columns = Object.keys(row).join(", ")
  //     const values = Object.values(row)
  //       .map((value) => {
  //         if (value === null) {
  //           return "NULL"
  //         } else if (typeof value === "string") {
  //           return `'${value.replace(/'/g, "''")}'` // Escape single quotes
  //         } else {
  //           return value
  //         }
  //       })
  //       .join(", ")

  //     const updates = Object.entries(row)
  //       .filter(([key]) => key !== "instance_name") // Exclude the `instance_name` from the updates
  //       .map(([key, value]) => {
  //         if (value === null) {
  //           return `${key} = NULL`
  //         } else if (typeof value === "string") {
  //           return `${key} = '${value.replace(/'/g, "''")}'` // Escape single quotes
  //         } else {
  //           return `${key} = ${value}`
  //         }
  //       })
  //       .join(", ")

  //     return `
  // INSERT INTO instance_types (${columns})
  // VALUES (${values})
  // ON CONFLICT (instance_name, provider) DO UPDATE
  // SET ${updates};
  //     `.trim()
  //   })

  // Write the INSERT statements to the output file
  try {
    fs.writeFileSync(outputSqlFilePath, insertStatement, "utf-8")
    console.log(`SQL file successfully generated at: ${outputSqlFilePath}`)
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error writing SQL file: ${error.message}`)
    } else {
      console.error(`Error writing SQL file: ${error}`)
    }
  }
}

const vastOutputSqlFilePath = path.resolve(__dirname, "vast_instance_types.sql")
// const awsOutputSqlFilePath = path.resolve(__dirname, "aws_instance_types.sql")

generateInsertStatements(vast, vastOutputSqlFilePath)
// generateInsertStatements(aws, awsOutputSqlFilePath)
