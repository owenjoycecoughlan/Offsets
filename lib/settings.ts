import { prisma } from './prisma'

export async function getSiteSettings() {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: 'default' }
  })

  // Create default settings if they don't exist
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: { id: 'default' }
    })
  }

  return settings
}

export async function updateSiteSettings(data: Partial<{
  heroTitle: string
  heroSubtitle: string
  howItWorksTitle: string
  step1Title: string
  step1Description: string
  step2Title: string
  step2Description: string
  step3Title: string
  step3Description: string
  step4Title: string
  step4Description: string
  rulesTitle: string
  rule1: string
  rule2: string
  rule3: string
  rule4: string
  rule5: string
}>) {
  return await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data }
  })
}
