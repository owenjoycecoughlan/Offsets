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

const sampleContent = [
  'Light filters through ancient leaves, each ray a question.',
  'Questions dissolve in the morning dew.',
  'Dew speaks in whispers only stones remember.',
  'Memory is a river that flows uphill.',
  'Uphill battles are won in the valleys.',
  'Valleys hold echoes of unspoken words.',
  'Words are seeds we plant in silence.',
  'Silence grows louder with each passing hour.',
  'Hours fold into themselves like origami cranes.',
  'Cranes fly south, carrying winter in their wings.',
  'Wings beat against the rhythm of forgotten songs.',
  'Songs emerge from the spaces between breaths.',
  'Breath by breath, we build invisible cities.',
  'Cities rise and fall in the palm of your hand.',
  'Hands reach across chasms of time.',
  'Time is a circle that refuses to close.',
  'Closure is a myth we tell ourselves at night.',
  'Night blooms with stars we cannot name.',
  'Names drift away like smoke from dying fires.',
  'Fires burn brightest just before the dawn.',
  'Dawn arrives on feet of mist and possibility.',
  'Possibility threads through the eye of the needle.',
  'Needles point north, then spin wildly.',
  'Wildly, the heart drums its ancient code.',
  'Code written in languages we have yet to learn.',
  'Learning curves back on itself.',
  'Itself is all we ever truly know.',
  'Knowing feels like falling, but upward.',
  'Upward spirals the smoke of incense.',
  'Incense marks the threshold between worlds.',
]

const authors = [
  'Maya Chen',
  'River Stone',
  'Alex Morrison',
  'Sam Torres',
  'Jordan Park',
  'Casey Wu',
  'Morgan Ellis',
  'Taylor Kim',
]

let nodeCounter = 0

async function createBranch(
  iterationId: string,
  parentId: string,
  parentPublishedAt: Date,
  depth: number,
  maxDepth: number,
  branchFactor: number
): Promise<void> {
  if (depth >= maxDepth) return

  const numChildren = Math.floor(Math.random() * branchFactor) + 1

  for (let i = 0; i < numChildren; i++) {
    nodeCounter++
    const content = sampleContent[Math.floor(Math.random() * sampleContent.length)]
    const author = authors[Math.floor(Math.random() * authors.length)]

    // Publish date is 1-2 days after parent
    const daysAfterParent = 1 + Math.random()
    const publishedAt = new Date(parentPublishedAt.getTime() + daysAfterParent * 24 * 60 * 60 * 1000)

    // Calculate if it should be withered
    const daysSincePublish = (Date.now() - publishedAt.getTime()) / (24 * 60 * 60 * 1000)
    const hasChildren = depth < maxDepth && Math.random() > depth / maxDepth
    const isWithered = !hasChildren && daysSincePublish > 3

    const node = await prisma.node.create({
      data: {
        authorName: author,
        content,
        status: isWithered ? NodeStatus.WITHERED : NodeStatus.LIVE,
        publishedAt,
        lastResponseAt: hasChildren ? publishedAt : null,
        witheredAt: isWithered ? new Date(publishedAt.getTime() + 3 * 24 * 60 * 60 * 1000) : null,
        parent: {
          connect: { id: parentId }
        },
        iteration: {
          connect: { id: iterationId }
        }
      }
    })

    // Recursively create children with decreasing probability
    if (hasChildren) {
      await createBranch(iterationId, node.id, publishedAt, depth + 1, maxDepth, branchFactor)
    }
  }
}

async function main() {
  console.log('Seeding database...')

  // Create or get default site settings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default' }
  })
  console.log('Created/verified site settings')

  // Get or create active iteration
  let iteration = await prisma.iteration.findFirst({
    where: { isActive: true }
  })

  if (!iteration) {
    iteration = await prisma.iteration.create({
      data: {
        name: 'Iteration 1',
        description: 'The first iteration of Offsets',
      }
    })
    console.log('Created iteration:', iteration.id)
  }

  // Check if nodes already exist for this iteration
  const existingNodes = await prisma.node.count({
    where: { iterationId: iteration.id }
  })

  if (existingNodes > 0) {
    console.log(`Iteration already has ${existingNodes} nodes, skipping seed.`)
    return
  }

  // Create a root node with a date 10 days ago to allow for branches
  const rootPublishedAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)

  const rootNode = await prisma.node.create({
    data: {
      authorName: 'The Initiator',
      content: `Branches wither, but the tree remembers.

In this garden of words, we plant seeds that grow in unexpected directions. Each contribution a new branch, reaching toward light we cannot yet see.

Begin anywhere. Link to anything. Let the connections surprise us.`,
      status: NodeStatus.LIVE,
      publishedAt: rootPublishedAt,
      lastResponseAt: rootPublishedAt,
      iteration: {
        connect: {
          id: iteration.id
        }
      }
    },
  })

  console.log('Created root node:', rootNode.id)

  // Create multiple branching paths
  console.log('Creating branching tree structure...')

  // Create 3-4 initial branches from root with varying depths
  await createBranch(iteration.id, rootNode.id, rootPublishedAt, 1, 8, 3) // Deep branch
  await createBranch(iteration.id, rootNode.id, rootPublishedAt, 1, 5, 2) // Medium branch
  await createBranch(iteration.id, rootNode.id, rootPublishedAt, 1, 3, 3) // Shallow but wide branch
  await createBranch(iteration.id, rootNode.id, rootPublishedAt, 1, 6, 2) // Another medium-deep branch

  console.log(`Seeding complete! Created ${nodeCounter + 1} total nodes.`)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
