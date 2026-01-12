import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1
})

async function main() {
  console.log('Starting migration to dynamic settings...')

  try {
    // Get current settings using raw SQL
    const result = await pool.query(`
      SELECT
        "step1Title", "step1Description",
        "step2Title", "step2Description",
        "step3Title", "step3Description",
        "step4Title", "step4Description",
        "rule1", "rule2", "rule3", "rule4", "rule5"
      FROM "SiteSettings"
      WHERE id = 'default'
    `)

    if (result.rows.length === 0) {
      console.log('No existing settings found, will use defaults')
      await pool.end()
      return
    }

    const settings = result.rows[0]

    // Convert existing step fields to JSON array
    const steps = [
      {
        title: settings.step1Title || '1. Read & Respond',
        description: settings.step1Description || ''
      },
      {
        title: settings.step2Title || '2. Stay Anonymous',
        description: settings.step2Description || ''
      },
      {
        title: settings.step3Title || '3. Branch & Grow',
        description: settings.step3Description || ''
      },
      {
        title: settings.step4Title || '4. Admin Approval',
        description: settings.step4Description || ''
      }
    ]

    // Convert existing rule fields to JSON array
    const rules = [
      settings.rule1,
      settings.rule2,
      settings.rule3,
      settings.rule4,
      settings.rule5
    ].filter(rule => rule && rule.trim() !== '')

    console.log('Migrated steps:', JSON.stringify(steps, null, 2))
    console.log('Migrated rules:', JSON.stringify(rules, null, 2))

    // Add the new columns with migrated data
    await pool.query(`
      ALTER TABLE "SiteSettings"
      ADD COLUMN IF NOT EXISTS steps JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS rules JSONB DEFAULT '[]'
    `)

    await pool.query(`
      UPDATE "SiteSettings"
      SET
        steps = $1::jsonb,
        rules = $2::jsonb
      WHERE id = 'default'
    `, [JSON.stringify(steps), JSON.stringify(rules)])

    console.log('Migration complete! Data has been preserved in new JSON columns.')
    console.log('Now you can run: npx prisma db push --accept-data-loss')
  } catch (e) {
    console.error('Migration failed:', e)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
