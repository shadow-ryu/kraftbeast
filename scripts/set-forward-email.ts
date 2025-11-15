import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Update forward email to your preferred email
  const updated = await prisma.user.update({
    where: { githubHandle: 'shadow-ryu' },
    data: { forwardEmail: 'vishnukulkarni4302@gmail.com' }
  })

  console.log('Updated forward email to:', updated.forwardEmail)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
