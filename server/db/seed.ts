import { ensureModelCatalog } from '@/server/data/model-catalog'

async function main() {
  await ensureModelCatalog()
  console.log('Seeded model catalog')
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed to seed model catalog')
    console.error(error)
    process.exit(1)
  })
