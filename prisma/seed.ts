import { PrismaClient } from '@prisma/client'
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient()

async function main() {
  const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8')

  const queries = seedSql.split(';').filter(query => query.trim() !== '')

  for (const query of queries) {
    try {
      await prisma.$executeRawUnsafe(query)
    } catch (e) {
      console.error(e)
      console.log(query.slice(0, 100))
      throw e
    }
  }
}
  
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })