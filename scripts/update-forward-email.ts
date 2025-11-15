import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Update forward email to match Resend account email
  const updated = await prisma.user.update({
    where: { githubHandle: 'shadow-ryu' },
    data: { forwardEmail: 'blackdragon4204@gmail.com' }
  })

  console.log('Updated user:', updated)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
