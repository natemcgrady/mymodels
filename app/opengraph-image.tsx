import { generateOgImage, ogSize } from './og-shared'

export const alt = 'mymodels.dev — Share the models you use for planning, building, and debugging.'

export const size = ogSize

export const contentType = 'image/png'

export default async function Image() {
  return generateOgImage(size)
}
