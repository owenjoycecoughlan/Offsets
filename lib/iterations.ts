import { prisma } from './prisma'

export async function getActiveIteration() {
  const activeIteration = await prisma.iteration.findFirst({
    where: { isActive: true },
    orderBy: { startDate: 'desc' },
  })

  if (!activeIteration) {
    throw new Error('No active iteration found')
  }

  return activeIteration
}

export async function getAllIterations() {
  return prisma.iteration.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      _count: {
        select: {
          nodes: true,
        },
      },
    },
  })
}

export async function createNewIteration(name: string, description?: string) {
  // End the current active iteration
  await prisma.iteration.updateMany({
    where: { isActive: true },
    data: {
      isActive: false,
      endDate: new Date(),
    },
  })

  // Create new iteration
  return prisma.iteration.create({
    data: {
      name,
      description,
      isActive: true,
    },
  })
}

export async function getIterationById(id: string) {
  return prisma.iteration.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          nodes: true,
        },
      },
    },
  })
}
