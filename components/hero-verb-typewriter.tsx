'use client'

import Typewriter from 'typewriter-effect'
import { GeistPixelSquare } from 'geist/font/pixel'

export function HeroVerbTypewriter() {
  return (
    <span
      className={`${GeistPixelSquare.variable} font-pixel inline-flex min-w-[5ch] justify-start`}
    >
      <Typewriter
        options={{
          loop: true,
          delay: 200,
          deleteSpeed: 45,
        }}
        onInit={(typewriter) => {
          typewriter
            .typeString('plan')
            .pauseFor(3000)
            .deleteAll()
            .typeString('build')
            .pauseFor(3000)
            .deleteAll()
            .typeString('debug')
            .pauseFor(3000)
            .deleteAll()
            .start()
        }}
      />
    </span>
  )
}
