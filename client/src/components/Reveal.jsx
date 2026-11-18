import { motion, useReducedMotion } from 'motion/react'

// Bo'lim kirganda bir marta paydo bo'ladi (pastdan ko'tarilib); delay (ms) bilan ketma-ketlik
export default function Reveal({ as = 'div', delay = 0, className = '', children, ...rest }) {
  const reduce = useReducedMotion()
  const Tag = motion[as] || motion.div
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.85, delay: delay / 1000, ease: [0.2, 0.7, 0.2, 1] }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export function PageHead({ title, children }) {
  const reduce = useReducedMotion()
  return (
    <section className="bg-deep text-deep-ink px-[5vw] pt-10 pb-12 mb-12 grid gap-6 md:gap-10 md:grid-cols-[auto_1fr] items-center overflow-hidden">
      <motion.img
        src="/media/abdulla-qahhor.jpg" alt="Abdulla Qahhor portreti"
        initial={reduce ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
        className="w-24 h-24 md:w-52 md:h-64 rounded-full md:rounded-3xl object-cover object-[50%_18%] border-4 border-white/15"
      />
      <div>
        <p className="m-0 mb-2 text-mint font-semibold">Abdulla Qahhor · 1907–1968</p>
        <h1 className="display text-[clamp(2.25rem,1.4rem+4.2vw,4.75rem)] m-0">{title}</h1>
        {children && <p className="mt-4 mb-0 text-lg max-w-[44ch] opacity-85">{children}</p>}
      </div>
    </section>
  )
}
