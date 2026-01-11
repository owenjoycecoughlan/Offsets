import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function migrate() {
  try {
    console.log('Running migration...')

    // Run the SQL migration
    await prisma.$executeRawUnsafe(`
      -- Create Iteration table
      CREATE TABLE IF NOT EXISTS "Iteration" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "endDate" TIMESTAMP(3),
          "isActive" BOOLEAN NOT NULL DEFAULT true,

          CONSTRAINT "Iteration_pkey" PRIMARY KEY ("id")
      );
    `)

    console.log('Created Iteration table')

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Iteration_isActive_idx" ON "Iteration"("isActive");
    `)

    console.log('Created index')

    // Insert default iteration if it doesn't exist
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Iteration" ("id", "name", "description", "isActive")
      VALUES ('iteration_1', 'Iteration 1', 'First iteration of the Offsets project', true)
      ON CONFLICT ("id") DO NOTHING;
    `)

    console.log('Created default iteration')

    // Check if iterationId column exists
    const columnExists = await prisma.$queryRawUnsafe<Array<{ column_name: string }>>(` SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Node' AND column_name = 'iterationId';
    `)

    if (columnExists.length === 0) {
      // Add iterationId column
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Node" ADD COLUMN "iterationId" TEXT DEFAULT 'iteration_1';
      `)

      console.log('Added iterationId column')

      // Update existing nodes
      await prisma.$executeRawUnsafe(`
        UPDATE "Node" SET "iterationId" = 'iteration_1' WHERE "iterationId" IS NULL;
      `)

      console.log('Updated existing nodes')

      // Make column required
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Node" ALTER COLUMN "iterationId" SET NOT NULL;
      `)

      console.log('Made iterationId required')

      // Add foreign key
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Node" ADD CONSTRAINT "Node_iterationId_fkey"
        FOREIGN KEY ("iterationId") REFERENCES "Iteration"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
      `)

      console.log('Added foreign key constraint')

      // Add index
      await prisma.$executeRawUnsafe(`
        CREATE INDEX "Node_iterationId_idx" ON "Node"("iterationId");
      `)

      console.log('Added index')
    } else {
      console.log('iterationId column already exists, skipping...')
    }

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

migrate()
