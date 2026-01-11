import 'dotenv/config'
import { PrismaClient, NodeStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Create a root node
  const rootNode = await prisma.node.create({
    data: {
      authorName: 'The Initiator',
      content: `Branches wither, but the tree remembers.

In this garden of words, we plant seeds that grow in unexpected directions. Each contribution a new branch, reaching toward light we cannot yet see.

Begin anywhere. Link to anything. Let the connections surprise us.`,
      status: NodeStatus.LIVE,
      publishedAt: new Date(),
    },
  })

  console.log('Created root node:', rootNode.id)
  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
