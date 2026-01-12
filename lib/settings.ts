import { prisma } from './prisma'
import { Prisma } from '@prisma/client'

export interface Step {
  title: string
  description: string
}

export interface SiteSettingsData {
  heroTitle: string
  heroSubtitle: string
  howItWorksTitle: string
  steps: Step[]
  rulesTitle: string
  rules: string[]
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: 'default' }
  })

  // Create default settings if they don't exist
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: { id: 'default' }
    })
  }

  // Parse JSON fields
  const steps = (settings.steps as Prisma.JsonArray).map(step => {
    const s = step as Prisma.JsonObject
    return {
      title: s.title as string,
      description: s.description as string
    }
  })

  const rules = (settings.rules as Prisma.JsonArray).map(rule => rule as string)

  return {
    heroTitle: settings.heroTitle,
    heroSubtitle: settings.heroSubtitle,
    howItWorksTitle: settings.howItWorksTitle,
    steps,
    rulesTitle: settings.rulesTitle,
    rules
  }
}

export async function updateSiteSettings(data: Partial<SiteSettingsData>) {
  const updateData: any = {}

  if (data.heroTitle !== undefined) updateData.heroTitle = data.heroTitle
  if (data.heroSubtitle !== undefined) updateData.heroSubtitle = data.heroSubtitle
  if (data.howItWorksTitle !== undefined) updateData.howItWorksTitle = data.howItWorksTitle
  if (data.rulesTitle !== undefined) updateData.rulesTitle = data.rulesTitle
  if (data.steps !== undefined) updateData.steps = data.steps
  if (data.rules !== undefined) updateData.rules = data.rules

  return await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: updateData,
    create: { id: 'default', ...updateData }
  })
}
