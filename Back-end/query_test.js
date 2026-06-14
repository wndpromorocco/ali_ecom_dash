const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const prod = await prisma.product.findFirst({
    where: { name: { contains: 'klng' } },
    include: { category: true }
  })
  console.log(prod);
}
main()
