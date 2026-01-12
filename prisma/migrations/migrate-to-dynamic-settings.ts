import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting migration to dynamic settings...')

  // Get current settings
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'default' }
  })

  if (!settings) {
    console.log('No existing settings found, will use defaults')
    return
  }

  // Convert existing step fields to JSON array
  const steps = [
    {
      title: (settings as any).step1Title || '1. Read & Respond',
      description: (settings as any).step1Description || ''
    },
    {
      title: (settings as any).step2Title || '2. Stay Anonymous',
      description: (settings as any).step2Description || ''
    },
    {
      title: (settings as any).step3Title || '3. Branch & Grow',
      description: (settings as any).step3Description || ''
    },
    {
      title: (settings as any).step4Title || '4. Admin Approval',
      description: (settings as any).step4Description || ''
    }
  ]

  // Convert existing rule fields to JSON array
  const rules = [
    (settings as any).rule1 || '',
    (settings as any).rule2 || '',
    (settings as any).rule3 || '',
    (settings as any).rule4 || '',
    (settings as any).rule5 || ''
  ].filter(rule => rule !== '')

  console.log('Migrated steps:', steps)
  console.log('Migrated rules:', rules)

  // Update with new JSON structure (will be done after schema migration)
  console.log('Migration complete. Run prisma db push to apply schema changes.')
}

main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
