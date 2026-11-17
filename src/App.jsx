import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import Lenis from 'lenis'
import { SHOTS } from './shots.js'

/* ───────────── helpers ───────────── */

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.innerWidth < 800)
  useEffect(() => {
    const on = () => setM(window.innerWidth < 800)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return m
}

function Reveal({ children, delay = 0, as = 'div', className, y = 28 }) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0.4, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -4% 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </Tag>
  )
}

/* ───────────── drawings (the logo's own world) ───────────── */

function BookStack() {
  const closed = (y, w, fill, deco) => (
    <g>
      <rect x={150 - w / 2} y={y} width={w} height="40" rx="4" fill={fill} />
      <rect x={150 - w / 2 + 8} y={y + 33} width={w - 16} height="7" fill="#f0e3c3" />
      <rect x={150 - w / 2} y={y} width="14" height="40" rx="3" fill="#2a1c10" opacity=".35" />
      <path d={`M150 ${y + 8} l9 12 -9 12 -9 -12z`} fill={deco} />
      <rect x={150 - w / 2 + 34} y={y + 18} width="26" height="4" fill={deco} />
      <rect x={150 + w / 2 - 60} y={y + 18} width="26" height="4" fill={deco} />
    </g>
  )
  return (
    <svg viewBox="0 0 300 300" className="bookstack" aria-hidden="true">
      {closed(256, 236, '#6b4526', '#c99a45')}
      {closed(216, 212, '#8a5a30', '#e0b867')}
      {closed(176, 232, '#4a3019', '#c99a45')}
      {/* open book */}
      <path d="M26 176 C70 168 122 172 150 187 C178 172 230 168 274 176 L274 184 C230 176 178 180 150 195 C122 180 70 176 26 184Z" fill="#6b4526" />
      <path d="M150 181 C120 166 70 162 36 172 L36 108 C70 98 120 102 150 118Z" fill="#f6ecd2" />
      <path d="M150 181 C180 166 230 162 264 172 L264 108 C230 98 180 102 150 118Z" fill="#efe1bd" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} fill="#8f6420" opacity=".45">
          <rect x={52} y={118 + i * 10 + i * 0.6} width={78 - (i % 2) * 14} height="3" rx="1.5" />
          <rect x={170 + (i % 2) * 12} y={118 + i * 10 + i * 0.6} width={78 - (i % 2) * 12} height="3" rx="1.5" />
        </g>
      ))}
      <path d="M150 118 L150 181" stroke="#c99a45" strokeWidth="3" />
    </svg>
  )
}

/* ───────────── nav ───────────── */

const NAV = [
  ['top', 'الرئيسية', 'ابدأ من هنا', '/img/q-wide.jpg', '50% 40%'],
  ['intro', 'السيرة الذاتية', 'الكاتبة أمل الموسوي', '/img/s1.jpg', '50% 40%'],
  ['shelves', 'الرفوف', 'ستة رفوف من القرآن إلى الأخلاق', '/img/s3.jpg', '50% 35%'],
  ['download', 'تحميل التطبيق', 'مكتبة أمل الإسلام في جيبك', '/img/q1.jpg', '50% 30%'],
]

function Logo() {
  return (
    <svg className="logo" viewBox="0 0 40 50" aria-hidden="true">
      <path d="M1 50V21C1 9.500 9.500 1 20 1s19 8.500 19 20v29z" fill="#b5832f" />
      <path d="M5 50V21C5 12 11.500 5 20 5s15 7 15 16v29z" fill="#f3e8d0" />
      <path d="M20 41c-3.500-2.600-9-3.200-12.500-2.400V25.500C11 24.700 16.500 25.300 20 28z" fill="#6b4526" />
      <path d="M20 41c3.500-2.600 9-3.200 12.500-2.400V25.500C29 24.700 23.500 25.300 20 28z" fill="#8a5a30" />
      <path d="M20 14l3.500 4.500L20 23l-3.500-4.500z" fill="#b5832f" />
    </svg>
  )
}

const DOCK_ICO = [
  'M3 11l9-7.500 9 7.500M5.500 9.500V20h13V9.500M10 20v-5.500h4V20',
  'M12 12.500a4 4 0 100-8 4 4 0 000 8zM4.500 20c.800-3.600 3.800-5.500 7.500-5.500s6.700 1.900 7.500 5.500',
  'M4 4.500h4v15H4zM10 4.500h4v15h-4zM16.500 5.500l3.500-1 3 14-3.500 1z',
  'M12 4v11M7.500 10.500L12 15l4.500-4.500M5 19.500h14',
]
const DOCK_LBL = ['الرئيسية', 'السيرة', 'الرفوف', 'تحميل']

function Nav() {
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 })
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const [hover, setHover] = useState('')
  const [img, setImg] = useState(0)

  useMotionValueEvent(scrollY, 'change', (v) => {
    setSolid(v > 24)
  })

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && setActive(en.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    NAV.forEach(([id]) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const k = (ev) => ev.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const lit = hover || active

  return (
    <>
      <header className={'nv' + (solid ? ' is-solid' : '') + (open ? ' is-open' : '')}>
        <a className="nv-brand" href="#top" aria-label="مكتبة أمل الإسلام" onClick={() => setOpen(false)}>
          <Logo />
          <b>أمل الإسلام</b>
        </a>

        <nav
          className="nv-links"
          aria-label="الأقسام"
          onMouseMove={(ev) => {
            const r = ev.currentTarget.getBoundingClientRect()
            ev.currentTarget.style.setProperty('--mx', ev.clientX - r.left + 'px')
            ev.currentTarget.style.setProperty('--my', ev.clientY - r.top + 'px')
          }}
          onMouseLeave={() => setHover('')}
        >
          {NAV.map(([id, label]) => (
            <a
              key={id}
              href={'#' + id}
              className={'nv-link' + (active === id ? ' on' : '')}
              onMouseEnter={() => setHover(id)}
              onFocus={() => setHover(id)}
              onBlur={() => setHover('')}
            >
              {lit === id && (
                <motion.span layoutId="nvpill" className="nv-pill" transition={{ type: 'spring', stiffness: 460, damping: 34 }} />
              )}
              <span className="nv-roll">
                <span className="nv-roll-a">{label}</span>
                <span className="nv-roll-b" aria-hidden="true">{label}</span>
              </span>
              {active === id && (
                <motion.i layoutId="nvdot" className="nv-dot" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              )}
            </a>
          ))}
        </nav>

        <a className="nv-cta" href={WEB_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>تصفح المكتبة</a>

        <button
          className={'nv-burger' + (open ? ' on' : '')}
          aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <i />
          <i />
        </button>

        <motion.span className="nv-progress" style={{ scaleX: progress }} aria-hidden="true" />
      </header>


      <nav className="dock" aria-label="التنقل السريع">
        {NAV.map(([id, label], i) => (
          <a key={id} href={'#' + id} className={'dock-i' + (active === id || (!active && i === 0) ? ' on' : '')} aria-label={label}>
            {(active === id || (!active && i === 0)) && (
              <motion.span layoutId="dockpill" className="dock-pill" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />
            )}
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={DOCK_ICO[i]} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>{DOCK_LBL[i]}</span>
          </a>
        ))}
        <a className="dock-i dock-go" href={WEB_URL} target="_blank" rel="noopener noreferrer" aria-label="تصفح المكتبة">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20c-3-2.2-7-2.700-9.500-2V5c2.500-.700 6.500-.200 9.500 2zM12 20c3-2.200 7-2.700 9.500-2V5C19 4.300 15 4.800 12 7z" fill="currentColor" /></svg>
          <span>المكتبة</span>
        </a>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="menu"
            initial={{ clipPath: 'inset(100% 0% 0% 0% round 50% 50% 0% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0% round 0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(100% 0% 0% 0% round 50% 50% 0% 0%)' }}
            transition={{ duration: 0.85, ease: [0.76, 0, 0.2, 1] }}
          >
            <div className="menu-inner">
              <nav className="menu-links" aria-label="القائمة الرئيسية" onMouseLeave={() => setImg(0)}>
                {NAV.map(([id, label, sub], i) => (
                  <a
                    key={id}
                    href={'#' + id}
                    className={img === i ? 'on' : ''}
                    onMouseEnter={() => setImg(i)}
                    onFocus={() => setImg(i)}
                    onClick={() => setOpen(false)}
                  >
                    <i className="menu-num" aria-hidden="true">{String(i + 1).padStart(2, '0').replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d])}</i>
                    <span className="menu-mask">
                      <motion.span
                        className="menu-word"
                        initial={{ y: '115%' }}
                        animate={{ y: '0%' }}
                        transition={{ delay: 0.4 + i * 0.09, duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
                      >
                        {label}
                      </motion.span>
                    </span>
                    <motion.small initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 + i * 0.09, duration: 0.6 }}>
                      {sub}
                    </motion.small>
                    <svg className="menu-go" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </a>
                ))}
              </nav>
              <motion.div
                className="menu-art"
                aria-hidden="true"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <div className="menu-arch">
                  {NAV.map((n, i) => (
                    <img key={n[0]} src={n[3]} alt="" className={img === i ? 'on' : ''} style={{ objectPosition: n[4] }} />
                  ))}
                </div>
              </motion.div>
              <motion.div className="menu-foot" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}>
                <a className="menu-cta" href={WEB_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>تصفح المكتبة</a>
                <div className="menu-stores">
                  <a href={PLAY_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>Google Play</a>
                  <a href={APPSTORE_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>App Store</a>
                </div>
                <p>الكتاب نافذة إلى النور.</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ───────────── 1 · hero — the arch is the portal ───────────── */

const PW = 300
const PHH = 640

function useViewport() {
  const [v, setV] = useState({ w: 1440, h: 900 })
  useEffect(() => {
    const f = () => setV({ w: window.innerWidth, h: window.innerHeight })
    f()
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])
  return v
}

const SAYS = [
  { at: [0.1, 0.15, 0.24, 0.28], a: 'مكتبتك كلها', b: 'في شاشة واحدة.' },
  { at: [0.3, 0.35, 0.42, 0.46], a: 'ابحث وتصفّح', b: 'وتابع من حيث توقفت.' },
  { at: [0.48, 0.53, 0.58, 0.62], a: 'لكل كتاب صفحته', b: 'بتقييمه ونبذته.' },
  { at: [0.64, 0.68, 0.73, 0.77], a: 'اقرأ بهدوء', b: 'على صفحة تشبه الورق.' },
  { at: [0.79, 0.83, 0.87, 0.91], a: 'اجعلها على ذوقك', b: 'بألوان تختارها.' },
  { at: [0.93, 0.96, 0.99, 1.02], a: 'قراءة دون اتصال', b: 'في أي وقت، بلا شبكة.' },
]

function SayS({ p, at, a, b }) {
  const o = useTransform(p, at, [0, 1, 1, 0])
  const y = useTransform(p, at, [46, 0, 0, -34])
  return (
    <motion.p className="hx-say2" style={{ opacity: o, y }}>
      {a}
      <em>{b}</em>
    </motion.p>
  )
}

function ChipBody({ c }) {
  if (c.cover) return <img className="chip-cover" src={c.cover} alt="" decoding="async" />
  if (c.sh) return <ShelfCover s={c.sh} />
  if (c.node === 'book')
    return (
      <div className="fc fc-book">
        <span className="fc-cover"><IcoBook /></span>
        <div className="fc-txt">
          <small>تابع القراءة</small>
          <b>الصدق رأس الإيمان</b>
          <em>أمل الموسوي</em>
          <span className="xa-bar"><i /></span>
        </div>
      </div>
    )
  if (c.node === 'ring')
    return (
      <div className="fc fc-ring">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="46" fill="none" stroke="#e4d3ae" strokeWidth="12" />
          <circle cx="60" cy="60" r="46" fill="none" stroke="#c99a45" strokeWidth="12" strokeLinecap="round" strokeDasharray="66.5 289" transform="rotate(-90 60 60)" />
        </svg>
        <b>٢٣٪</b>
        <small>تقدّم القراءة</small>
      </div>
    )
  if (c.node === 'tools')
    return (
      <div className="fc fc-tools">
        <i><IcoMark /></i>
        <i><svg viewBox="0 0 24 24" className="xi" aria-hidden="true"><path d="M5 3h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-6l-5 4v-4H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm6 3v3H8v2h3v3h2v-3h3V9h-3V6z" fill="currentColor" /></svg></i>
        <i><svg viewBox="0 0 24 24" className="xi" aria-hidden="true"><path d="M10 3a7 7 0 0 1 5.600 11.200l5 5-1.400 1.400-5-5A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" fill="currentColor" /></svg></i>
      </div>
    )
  if (c.node === 'dots')
    return (
      <div className="fc fc-dots">
        <small>ألوان المظهر</small>
        <span>
          {['#14614a', '#2f80ed', '#9a6b3a', '#5b6b8c', '#13467a'].map((col, i) => (
            <i key={col} className={i === 2 ? 'on' : ''} style={{ background: col }} />
          ))}
        </span>
      </div>
    )
  if (c.node === 'rate')
    return (
      <div className="fc fc-stat">
        <span className="fs-ico"><svg viewBox="0 0 24 24" className="xi" aria-hidden="true"><path d="M12 2l3.100 6.300 6.900 1-5 4.900 1.200 6.900L12 17.800 5.800 21l1.200-6.900-5-4.900 6.900-1z" fill="currentColor" /></svg></span>
        <div><b>٤٫٩</b><small>التقييم</small></div>
      </div>
    )
  if (c.node === 'pages')
    return (
      <div className="fc fc-stat">
        <span className="fs-ico"><IcoBook /></span>
        <div><b>١٥١</b><small>صفحة</small></div>
      </div>
    )
  if (c.node === 'tag')
    return (
      <div className="fc fc-stat">
        <span className="fs-ico"><IcoMark /></span>
        <div><b>قضايا إسلامية</b><small>التصنيف</small></div>
      </div>
    )
  if (c.node === 'offline')
    return (
      <div className="fc fc-off">
        <span><svg viewBox="0 0 24 24" className="xi" aria-hidden="true"><path d="M9.500 16.200 5.300 12l-1.400 1.400 5.600 5.600L21 7.500 19.600 6z" fill="currentColor" /></svg></span>
        <div><b>جاهز دون اتصال</b><small>اقرأ في أي وقت</small></div>
      </div>
    )
  return null
}

function FloatChip({ p, c, off }) {
  const o = useTransform(p, c.at, [0, 1, 1, 0])
  const y = useTransform(p, c.at, [c.y + 70, c.y, c.y, c.y - 50])
  return (
    <motion.div className={'chip' + (c.node ? ' chip-fc' : '') + (c.node && c.side > 0 ? ' chip-r' : '')} style={{ opacity: o, y, x: c.side * off + (c.dx || 0), rotate: c.rot }}>
      <ChipBody c={c} />
    </motion.div>
  )
}

function IcoBook() {
  return (
    <svg viewBox="0 0 60 60" className="xi" aria-hidden="true"><path d="M30 46c-6-5-16-6-22-4V16c6-2 16-1 22 4zM30 46c6-5 16-6 22-4V16c-6-2-16-1-22 4z" fill="currentColor" /></svg>
  )
}
function IcoMark() {
  return (
    <svg viewBox="0 0 24 24" className="xi" aria-hidden="true"><path d="M7 3h10a1 1 0 0 1 1 1v17l-6-4-6 4V4a1 1 0 0 1 1-1z" fill="currentColor" /></svg>
  )
}
function IcoStar() {
  return (
    <svg viewBox="0 0 60 60" className="xi" aria-hidden="true"><path d="M30 6l5 11 11-5-5 11 11 5-11 5 5 11-11-5-5 11-5-11-11 5 5-11-11-5 11-5-5-11 11 5z" fill="currentColor" /></svg>
  )
}

function XCard({ p, z0, z1, className, children }) {
  const z = useTransform(p, [0, 0.3], [z0, z1])
  const o = useTransform(p, [0, 0.24, 0.33], [1, 1, 0])
  return (
    <motion.div className={'xc ' + className} style={{ z, opacity: o }}>
      <div className="xc-in">{children}</div>
    </motion.div>
  )
}

function XCards({ p }) {
  const bars = [40, 62, 48, 78, 58, 92, 70]
  return (
    <>
      <XCard p={p} z0={110} z1={50} className="xc-a">
        <div className="xa-row"><span className="xa-ico"><IcoBook /></span></div>
        <div className="xa-pills">
          <span className="xb-pill"><IcoBook />اقرأ</span>
          <span className="xb-pill"><IcoMark />احفظ</span>
        </div>
        <div className="xa-bar"><i /></div>
      </XCard>
      <XCard p={p} z0={90} z1={40} className="xc-c">
        <div className="xc-bars">
          {bars.map((v, i) => <i key={i} className={i === 5 ? 'on' : ''} style={{ height: v + '%' }} />)}
        </div>
      </XCard>
      <XCard p={p} z0={70} z1={30} className="xc-d">
        <div className="xd-stack">
          {[SHELVES[0], SHELVES[3], SHELVES[2]].map((sh, i) => (
            <div key={sh.id} className={'xd-c xd-c' + i}><ShelfCover s={sh} /></div>
          ))}
        </div>
      </XCard>
      <XCard p={p} z0={190} z1={90} className="xc-e"><span className="xbadge xbadge-gold"><IcoStar /></span></XCard>
      <XCard p={p} z0={160} z1={80} className="xc-f"><span className="xbadge xbadge-mark"><IcoMark /></span></XCard>
      <XCard p={p} z0={130} z1={60} className="xc-g"><span className="xbadge xbadge-cream"><IcoBook /></span></XCard>
    </>
  )
}

function Hero() {
  const ref = useRef(null)
  const trackRef = useRef(null)
  const reduce = useReducedMotion()
  const { w, h } = useViewport()
  const { scrollYProgress: p } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })

  const sMax = w < 900 ? Math.min((h * 0.6) / PHH, (w * 0.66) / PW, 1.1) : Math.min((h * 0.74) / PHH, (w * 0.8) / PW, 1.5)
  const sStart = sMax * 1.08

  const tO = useTransform(p, [0, 0.1], [1, 0])
  const tY = useTransform(p, [0, 0.1], [0, -70])
  const tS = useTransform(p, [0, 0.1], [1, 0.94])

  const desk = w >= 900
  const phY = useTransform(p, [0, 0.18, 0.3, 1], desk ? [h * 0.02, h * 0.02, -h * 0.01, -h * 0.01] : [h * 0.44, h * 0.1, h * 0.07, h * 0.07])
  const phX = useTransform(p, [0, 0.28], [desk ? -w * 0.2 : 0, 0])
  const rZ = useTransform(p, [0, 0.28], [desk ? 6 : 3, 0])
  const phS = useTransform(p, [0, 0.18, 0.3], [sStart, sMax, sMax * 1.03])
  const rY = useTransform(p, [0, 0.3, 0.9, 1], [-36, -6, 7, 9])
  const rX = useTransform(p, [0, 0.3, 1], [16, 4, 2])
  const glare = useTransform(p, [0.05, 0.5, 1], ['-120%', '10%', '130%'])
  const floorO = useTransform(p, [0, 0.3], [0.5, 1])

  /* real app screens */
  const s0 = useTransform(p, [0, 0.26, 0.3], [1, 1, 0])
  const s1 = useTransform(p, [0.26, 0.3, 0.45, 0.49], [0, 1, 1, 0])
  const s2 = useTransform(p, [0.45, 0.49, 0.6, 0.64], [0, 1, 1, 0])
  const s3 = useTransform(p, [0.6, 0.64, 0.76, 0.8], [0, 1, 1, 0])
  const s4 = useTransform(p, [0.76, 0.8, 0.9, 0.94], [0, 1, 1, 0])
  const s5 = useTransform(p, [0.9, 0.94, 1], [0, 1, 1])
  const s1y = useTransform(p, [0.26, 0.34], [24, 0])
  const s2y = useTransform(p, [0.45, 0.53], [24, 0])
  const s3y = useTransform(p, [0.6, 0.68], [24, 0])
  const s4y = useTransform(p, [0.76, 0.84], [24, 0])
  const s5y = useTransform(p, [0.9, 0.98], [24, 0])

  const gA = useTransform(p, [0, 0.45, 0.52], [1, 1, 0])
  const gB = useTransform(p, [0.76, 0.82, 0.9, 0.95], [0, 1, 1, 0])
  const gC = useTransform(p, [0.46, 0.52, 0.76, 0.82], [0, 1, 1, 0])

  const off = (PW * sMax) / 2 + 130
  const CHIPS = [
    { side: -1, y: -140, dx: -70, at: [0.31, 0.36, 0.44, 0.48], rot: -9, cover: '/img/book-tazweej.webp' },
    { side: 1, y: 120, dx: 40, at: [0.32, 0.37, 0.44, 0.48], rot: 8, cover: '/img/book-fatayat.webp' },
    { side: -1, y: -170, dx: 10, at: [0.47, 0.52, 0.59, 0.63], rot: -5, node: 'rate' },
    { side: -1, y: -10, dx: 30, at: [0.48, 0.53, 0.59, 0.63], rot: 4, node: 'pages' },
    { side: -1, y: 130, dx: 0, at: [0.49, 0.54, 0.59, 0.63], rot: -6, node: 'tag' },
    { side: -1, y: -170, dx: 100, at: [0.64, 0.69, 0.75, 0.79], rot: -5, node: 'book' },
    { side: -1, y: -10, dx: 112, at: [0.65, 0.7, 0.75, 0.79], rot: 4, node: 'tools' },
    { side: -1, y: 130, dx: 96, at: [0.66, 0.71, 0.75, 0.79], rot: -6, node: 'ring' },
    { side: -1, y: -40, dx: 100, at: [0.8, 0.85, 0.89, 0.93], rot: -5, node: 'dots' },
    { side: -1, y: -20, dx: 100, at: [0.94, 0.97, 0.99, 1.02], rot: -5, node: 'offline' },
  ]

  return (
    <section ref={ref} className="hero" id="top" data-nav="dark">
      <div ref={trackRef} className="hx-track" aria-hidden="true" />
      <div className="hx-stage">
        <motion.div className="hx-floor" style={reduce ? undefined : { opacity: floorO }} aria-hidden="true" />
        <motion.div className="hx-tint hx-tint-a" style={reduce ? undefined : { opacity: gA }} aria-hidden="true" />
        <motion.div className="hx-tint hx-tint-b" style={reduce ? undefined : { opacity: gB }} aria-hidden="true" />
        <motion.div className="hx-tint hx-tint-c" style={reduce ? undefined : { opacity: gC }} aria-hidden="true" />

        <motion.div className="hx-head" style={reduce ? undefined : { opacity: tO, y: tY, scale: tS }}>
          <h1 className="hx-title">
            <span className="hx-mask"><motion.small initial={reduce ? false : { y: '120%' }} animate={{ y: '0%' }} transition={{ duration: 0.9, delay: 0.05, ease: [0.2, 0.7, 0.2, 1] }}>مكتبة</motion.small></span>
            <span className="hx-mask"><motion.span initial={reduce ? false : { y: '120%' }} animate={{ y: '0%' }} transition={{ duration: 1, delay: 0.18, ease: [0.2, 0.7, 0.2, 1] }}>أمل الإسلام</motion.span></span>
          </h1>
          <motion.div className="hx-actions" initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.8 }}>
            <a className="btn btn-lg" href="#shelves">ادخل المكتبة</a>
            <a className="hx-link" href="#intro">تعرّف علينا <span aria-hidden="true">›</span></a>
          </motion.div>
        </motion.div>

        {!reduce && SAYS.map((sy) => <SayS key={sy.a} p={p} {...sy} />)}

        <div className="hx-scene">
          <motion.div className="hx-book" style={reduce ? undefined : { x: phX, y: phY, scale: phS }}>
            {!reduce && CHIPS.map((c, i) => <FloatChip key={i} p={p} c={c} off={off} />)}
            <motion.div className="px3d" style={reduce ? { rotateX: 4, rotateY: -6 } : { rotateX: rX, rotateY: rY, rotateZ: rZ }}>
              <XCards p={p} />
              <i className="px-btn px-btn-a" />
              <i className="px-btn px-btn-b" />
              <i className="px-btn px-btn-c" />
              <i className="px-btn px-btn-d" />
              <i className="px-btn px-btn-e" />
              <div className="px">
                <div className="px-screen">
                  <motion.div className="px-s" style={reduce ? undefined : { opacity: s0 }}><Shot k="splash" /></motion.div>
                  <motion.div className="px-s" style={reduce ? { opacity: 0 } : { opacity: s1, y: s1y }}><Shot k="home" /></motion.div>
                  <motion.div className="px-s" style={reduce ? { opacity: 0 } : { opacity: s2, y: s2y }}><Shot k="detail" /></motion.div>
                  <motion.div className="px-s" style={reduce ? { opacity: 0 } : { opacity: s3, y: s3y }}><Shot k="reader" /></motion.div>
                  <motion.div className="px-s" style={reduce ? { opacity: 0 } : { opacity: s4, y: s4y }}><Shot k="settings" /></motion.div>
                  <motion.div className="px-s" style={reduce ? { opacity: 0 } : { opacity: s5, y: s5y }}><Shot k="about" /></motion.div>
                  <div className="ph-island" />
                  <motion.div className="px-glare" style={reduce ? undefined : { x: glare }} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ───────────── 2 · biography — the author, told as you scroll ───────────── */

const BIO = [
  {
    t: 'الميلاد والنشأة', f1: 'بغداد · ١٩٦٤م', f2: 'من أسرة المقدس الغريفي الموسوي',
    text: 'ولدت الكاتبة في بغداد سنة ١٩٦٤م وهي علوية الابوين من أسرة علمية دينية هي أسرة المقدس الغريفي الموسوي وهي أسرة معروفة بكثرة العلماء والمفكرين فيها والذين خدموا الدين ومذهب أمير المؤمنين عبر أجيال كثيرة وامها من السادة آل الصافي في النجف .. فكانت نشأتها وتربيتها في أحضان هذه الأسرة العلوية الطيبة',
  },
  {
    t: 'طلب العلم', f1: 'المنطق وأصول المظفر', f2: 'على يد والدها العلّامة السيد محسن المقدس الغريفي',
    text: 'تلقت الدروس الدينية عند والدها الشهيد العلامة السيد محسن المقدس الغريفي فدرست عنده المنطق وأصول المظفر، فكان للأسرة من جهة وللجهد والمثابرة الفردية من جهة أخرى الأثر الكبير في صقل الشخصية العلمية والمواهب الفكرية عند الكاتبة.',
  },
  {
    t: 'عصر الحركات الكبرى', f1: 'حركتان كبريان', f2: 'في العراق وإيران، بقيادة السيد محمد باقر الصدر والسيد الخميني',
    text: 'عاصرت الكاتبة منذ أوائل نشوءها الحركات الإسلامية الكبرى في العراق والمنطقة وعلى رأسها الحركة الفكرية الواعية في العراق بقيادة السيد الشهيد السعيد محمد باقر الصدر (قدس سره) وكذلك الحركة الإسلامية في إيران بقيادة السيد الخميني ( قدس سره) فكانت بوجدانها وشعورها تواكب تلك الحركات الإسلامية وتستمد منها الجذوة التي ألهبت فيها الروح الرسالية.',
  },
  {
    t: 'الروح الرسالية', f1: 'الروح الرسالية', f2: 'تغيير العادات وتصحيح الانحرافات الاجتماعية',
    text: 'وكانت تلك الروح الرسالية هي الدافع لها لكي تسير على خطى الرسل والعلماء الرساليين في تغيير العادات الإجتماعية السيئة وتصحيح الإنحرافات الإجتماعية التي سادت في المجتمع قديما وحديثا، فاستشعرت المسؤولية في محاربة تلك العادات وتلك الإنحرافات التي كان سببها أعداء دين الإنسانية دين الحياة الدين الإسلامي الذي كان مقررا له أن يجعل الإنسان في قمة السعادة في حياته الدنيا وفي حياته الباقية.',
  },
  {
    t: 'لغةٌ للجميع', f1: 'لغةٌ سهلة للجميع', f2: 'مستلهمة من الكتاب الكريم وأحاديث أهل البيت',
    text: 'وكانت كتبها ومؤلفاتها رسائل واضحة وسهلة وبمتناول أفهام الناس جميعا فكانت اللغة التي كتبت بها لغة سهلة يستسيغها الجميع، ولم تتعدى فيما كتبته روح الشريعة السمحاء وتعاليمها الغراء فكانت مواضيعها هي في روحها معاني جاء بها الكتاب الكريم و أحاديث أهل بيت النبوة لذلك كان لها المقبولية والتأثير بفضل الله تعالى.',
  },
  {
    t: 'المؤلفات', f1: 'مؤلفات اجتماعية وتربوية', f2: 'ترجمت جامعات إيرانية بعضها إلى الفارسية',
    text: 'واتسمت مؤلفات الكاتبة بالطابع الإجتماعي والتربوي حيث تناولت قضايا الأسرة والزواج وتربية الطفل ومعالجة الظواهر المنحرفة في المجتمع مستلهمة الحلول من النماذج البشرية الأكمل وهم أهل بيت النبوة (صلوات الله عليهم اجمعين) ونحت في كتبها ذلك المنحى ووسمتها بتلك السمة لما رأت من حاجة لمثل تلك المواضيع، ويظهر ذلك من مؤلفاتها، وقد ترجمت بعض الجامعات الإيرانية بعض كتبها الى اللغة الفارسية لتوزيعها على الطالبات.',
  },
]

const BIO_COVERS = ['/img/book-wilaya.webp', '/img/book-tazweej.webp', '/img/book-fatayat.webp']

const clamp01 = (v) => Math.max(0, Math.min(1, v))

function BioWord({ w, i, n, prog }) {
  const o = useTransform(prog, [i / n, Math.min(1, (i + 3) / n)], [0.16, 1])
  return <motion.span style={{ opacity: o }}>{w} </motion.span>
}

function BioChapter({ c, k, u, last }) {
  const t = useTransform(u, (v) => clamp01(v - k))
  const prog = useTransform(t, [0.08, 0.78], [0, 1])
  const o = useTransform(t, last ? [0, 0.05] : k === 0 ? [0, 0.02, 0.94, 1] : [0, 0.06, 0.94, 1], last ? [0, 1] : k === 0 ? [1, 1, 1, 0] : [0, 1, 1, 0])
  const y = useTransform(t, last ? [0, 0.05] : [0, 0.06, 0.94, 1], last ? [30, 0] : [30, 0, 0, -30])
  const words = c.text.split(' ').filter(Boolean)
  return (
    <motion.article className="bx-ch" style={{ opacity: o, y }}>
      <h3 className="bx-ct">{c.t}</h3>
      <p className="bx-p">
        {words.map((w, i) => <BioWord key={i} w={w} i={i} n={words.length} prog={prog} />)}
      </p>
    </motion.article>
  )
}

function BioTick({ c, k, u, onGo }) {
  const on = useTransform(u, [k - 0.5, k, k + 0.95, k + 1], [0.35, 1, 1, 0.35])
  const sc = useTransform(u, [k - 0.5, k, k + 0.95, k + 1], [1, 1.5, 1.5, 1])
  return (
    <li>
      <button className="bx-tick" onClick={() => onGo(k)}>
        <motion.i className="bx-dot" style={{ scale: sc, opacity: on }} />
        <motion.span style={{ opacity: on }}>{c.t}</motion.span>
      </button>
    </li>
  )
}

function Intro() {
  const ref = useRef(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const u = useTransform(p, (v) => clamp01((v - 0.04) / 0.92) * BIO.length)
  const line = useTransform(u, [0, BIO.length], [0, 1])
  const [act, setAct] = useState(0)
  useMotionValueEvent(u, 'change', (v) => setAct(Math.max(0, Math.min(BIO.length - 1, Math.floor(v)))))

  const go = (k) => {
    const el = ref.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const range = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + (0.04 + (0.92 * (k + 0.1)) / BIO.length) * range, behavior: 'smooth' })
  }
  const cur = BIO[act]

  return (
    <section className="bx" id="intro" data-nav="dark" ref={ref}>
      <div className="bx-stage">
        <div className="bx-bg" aria-hidden="true" />

        <header className="bx-head">
          <h2 className="bx-title">السيرة الذاتية</h2>
          <p className="bx-tag">كاتبة إسلامية معاصرة تقيم في النجف الأشرف</p>
        </header>

        <div className="bx-main">
          <div className="bx-read">
            {BIO.map((c, k) => <BioChapter key={k} c={c} k={k} u={u} last={k === BIO.length - 1} />)}
          </div>

          <aside className="bx-card" aria-label="الكاتبة أمل الموسوي">
            <div className="bx-who">
              <div>
                <b>الكاتبة أمل الموسوي</b>
                <small>النجف الأشرف</small>
              </div>
            </div>

            <div className="bx-time">
              <motion.span className="bx-line" style={{ scaleY: line }} aria-hidden="true" />
              <ul>
                {BIO.map((c, k) => <BioTick key={k} c={c} k={k} u={u} onGo={go} />)}
              </ul>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={act}
                className="bx-fact"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <b>{cur.f1}</b>
                <span>{cur.f2}</span>
                {act === BIO.length - 1 && (
                  <div className="bx-covers" aria-hidden="true">
                    {BIO_COVERS.map((src) => <img key={src} src={src} alt="" decoding="async" />)}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </aside>
        </div>
      </div>
    </section>
  )
}

/* ───────────── 3 · shelves — the live thing ───────────── */

const SHELVES = [
  { id: 'quran', glow: 'rgba(40, 170, 115, 0.5)', name: 'القرآن والتفسير', c: '#14392d', t: '#ecd08a',
    icon: 'M30 46c-6-5-16-6-22-4V16c6-2 16-1 22 4zM30 46c6-5 16-6 22-4V16c-6-2-16-1-22 4z',
    text: 'القرآن بترجمة سلسة وتفاسير تضع الآية في سياقها؛ من التلاوة إلى التدبّر.',
    books: ['المصحف الشريف', 'تفسير الطبري', 'تفسير ابن كثير', 'تفسير السعدي'] },
  { id: 'hadith', glow: 'rgba(210, 70, 85, 0.45)', name: 'الحديث', c: '#4a1a1f', t: '#e9c779',
    icon: 'M38 8a22 22 0 1 0 0 44 18 18 0 1 1 0-44zM46 20l3 4-3 4-3-4z',
    text: 'أقوال النبي ﷺ وسنّته، مع الشروح والفهارس القابلة للبحث.',
    books: ['صحيح البخاري', 'صحيح مسلم', 'رياض الصالحين', 'الأربعون النووية'] },
  { id: 'fiqh', glow: 'rgba(80, 125, 235, 0.45)', name: 'الفقه والأحكام', c: '#1b2740', t: '#ecd08a',
    icon: 'M8 16h44v4H8zM28 16h4v30h-4zM18 46h24v4H18zM4 34l9-14 9 14zM38 34l9-14 9 14z',
    text: 'كتب الفقه والأحكام لمسائل الحياة اليومية، بلغة يمكن أن تتحول إلى عمل.',
    books: ['الفقه الميسّر', 'فقه السنة', 'المغني', 'بداية المجتهد'] },
  { id: 'seerah', glow: 'rgba(212, 162, 76, 0.5)', name: 'السيرة والتاريخ', c: '#4b2f18', t: '#f1d791',
    icon: 'M10 44a20 20 0 0 1 40 0zM28 10h4v10h-4zM6 44h48v5H6z',
    text: 'حياة النبي ﷺ وتاريخ الإسلام، من مكة إلى المدينة وما بعدهما، بروايات يُوثق بها.',
    books: ['السيرة النبوية لابن هشام', 'الرحيق المختوم', 'البداية والنهاية'] },
  { id: 'akhlaq', glow: 'rgba(175, 100, 225, 0.45)', name: 'الأخلاق والتزكية', c: '#3a2446', t: '#e6c77f',
    icon: 'M30 6l5 11 11-5-5 11 11 5-11 5 5 11-11-5-5 11-5-11-11 5 5-11-11-5 11-5-5-11 11 5z',
    text: 'كتب لصقل القلب: تهذيب النفس والصبر والشكر، والسكينة وسط الضجيج.',
    books: ['إحياء علوم الدين', 'مدارج السالكين', 'الرسالة القشيرية'] },
  { id: 'kids', glow: 'rgba(240, 195, 95, 0.55)', name: 'الأطفال والناشئة', c: '#c9993f', t: '#2a1c10',
    icon: 'M28 50h4V28h-4zM28 30C16 30 12 22 12 12c12 0 16 8 16 18zM32 38c10 0 14-6 14-14-10 0-14 6-14 14z',
    text: 'قصص قرآنية وتعليم مبسّط بالصور، ليكون أول لقاء مع الكتاب محبوبًا.',
    books: ['قصص الأنبياء للأطفال', 'أدعيتي الأولى', 'أخلاق المسلم الصغير'] },
]

function ShelfCover({ s }) {
  return (
    <svg viewBox="0 0 240 330" className="cf-svg" aria-hidden="true">
      <rect width="240" height="330" rx="8" fill={s.c} />
      <rect x="12" y="12" width="216" height="306" rx="3" fill="none" stroke={s.t} strokeWidth="2.500" opacity=".9" />
      <rect x="20" y="20" width="200" height="290" rx="2" fill="none" stroke={s.t} strokeWidth="1" opacity=".45" />
      <path d="M62 214V116C62 86 88 66 120 66s58 20 58 50v98z" fill="none" stroke={s.t} strokeWidth="2.500" />
      <g transform="translate(78 108) scale(1.4)" fill={s.t}><path d={s.icon} /></g>
      <text x="120" y="262" textAnchor="middle" fontFamily="'Cairo', sans-serif" fontSize="25" fontWeight="800" fill={s.t}>{s.name}</text>
      <text x="120" y="292" textAnchor="middle" fontFamily="'IBM Plex Sans Arabic', sans-serif" fontSize="13" fontWeight="500" fill={s.t} opacity=".8">مكتبة أمل الإسلام</text>
      <rect x="224" width="16" height="330" fill="#000" opacity=".22" />
    </svg>
  )
}

/* ضع روابط التطبيق الحقيقية هنا */
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.dijlah.alamalislam&hl=ar'
const APPSTORE_URL = 'https://apps.apple.com/us/app/%D9%85%D9%83%D8%AA%D8%A8%D8%A9-%D8%A3%D9%85%D9%84-%D8%A7%D9%84%D8%A7%D8%B3%D9%84%D8%A7%D9%85/id6833392995'
const WEB_URL = '/library'

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="store-ico" aria-hidden="true">
      <path d="M4 2.500 13 12 4 21.500z" fill="#00a0ff" />
      <path d="M4 2.500 16.500 9.500 13 12z" fill="#32c070" />
      <path d="M16.500 9.500 20.500 12 16.500 14.500 13 12z" fill="#ffd500" />
      <path d="M4 21.500 13 12 16.500 14.500z" fill="#f43249" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="store-ico" aria-hidden="true">
      <path fill="#fff" d="M12.152 6.896c-.948 0-2.415-1.078-3.960-1.040-2.040.027-3.910 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.090 1.013 1.454 2.208 3.090 3.792 3.039 1.520-.065 2.090-.987 3.935-.987 1.831 0 2.350.987 3.960.948 1.637-.026 2.676-1.480 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.220-4.857-.026-3.040 2.480-4.494 2.597-4.559-1.429-2.090-3.623-2.324-4.390-2.376-2-.156-3.675 1.090-4.610 1.090zM15.530 3.830c.843-1.012 1.400-2.427 1.245-3.830-1.207.052-2.662.805-3.532 1.818-.780.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  )
}

function Shot({ k }) {
  const shot = SHOTS[k]
  const [ok, setOk] = useState(false)
  const [top, setTop] = useState(null)
  const ref = useRef(null)

  const sample = (im) => {
    try {
      const c = document.createElement('canvas')
      c.width = 24
      c.height = 2
      const g = c.getContext('2d')
      g.drawImage(im, 0, 0, im.naturalWidth, Math.max(2, Math.round(im.naturalHeight * 0.004)), 0, 0, 24, 2)
      const d = g.getImageData(0, 0, 24, 2).data
      let r = 0, gg = 0, b = 0, n = 0
      for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++ }
      r = Math.round(r / n); gg = Math.round(gg / n); b = Math.round(b / n)
      setTop({ c: `rgb(${r},${gg},${b})`, dark: 0.299 * r + 0.587 * gg + 0.114 * b < 140 })
    } catch (e) { /* ignore */ }
  }

  useEffect(() => {
    const im = ref.current
    if (im && im.complete && im.naturalWidth) { setOk(true); sample(im) }
  }, [])

  return (
    <div
      className="sp"
      data-tone={top && top.dark ? 'dark' : 'light'}
      style={{ backgroundImage: `url(${shot.tiny})`, '--st': top ? top.c : '#f4ecdc' }}
    >
      <div className="sp-status" aria-hidden="true">
        <span className="sp-time">9:41</span>
        <span className="sp-icons">
          <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor" /><rect x="4.500" y="5" width="3" height="6" rx="1" fill="currentColor" /><rect x="9" y="2.500" width="3" height="8.500" rx="1" fill="currentColor" /><rect x="13.500" y="0" width="3" height="11" rx="1" fill="currentColor" /></svg>
          <svg width="16" height="11" viewBox="0 0 16 11"><path d="M8 10.500l1.900-2a2.700 2.700 0 0 0-3.800 0zM3.600 6.100a6.200 6.200 0 0 1 8.800 0l-1.200 1.300a4.400 4.400 0 0 0-6.400 0zM1.100 3.500a9.700 9.700 0 0 1 13.800 0l-1.200 1.200a8 8 0 0 0-11.400 0z" fill="currentColor" /></svg>
          <svg width="26" height="12" viewBox="0 0 26 12"><rect x="0.500" y="0.500" width="22" height="11" rx="3.500" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="19" height="8" rx="2.200" fill="currentColor" /><rect x="23.500" y="4" width="2" height="4" rx="1" fill="currentColor" opacity=".5" /></svg>
        </span>
      </div>
      <img
        ref={ref}
        className={'sp-img' + (ok ? ' ok' : '')}
        src={shot.src}
        alt=""
        decoding="async"
        fetchPriority={k === 'splash' ? 'high' : 'auto'}
        onLoad={(e) => { setOk(true); sample(e.currentTarget) }}
      />
      <div className={'sp-shine' + (ok ? ' off' : '')} />
    </div>
  )
}

function PhoneSplash() {
  return <Shot k="splash" />
}

function PhoneHome() {
  return (
    <div className="ph-ui">
      <div className="ph-bar"><Logo /><b>مكتبة أمل الإسلام</b></div>
      <div className="ph-card">
        <img src="/img/q1.jpg" alt="" />
        <div className="ph-card-cap"><small>اقرأ الآن</small><b>المصحف الشريف</b></div>
      </div>
      <p className="ph-label">الرفوف</p>
      <div className="ph-covers">
        {SHELVES.slice(0, 4).map((sh) => (
          <div key={sh.id} className="ph-mini"><ShelfCover s={sh} /></div>
        ))}
      </div>
      <p className="ph-label">تابع القراءة</p>
      <div className="ph-row"><i /><span>تفسير ابن كثير<small>الجزء الأول</small></span></div>
      <div className="ph-row"><i /><span>رياض الصالحين<small>باب الصبر</small></span></div>
      <div className="ph-tabs"><i className="on" /><i /><i /><i /></div>
    </div>
  )
}

function PhoneReader() {
  return (
    <div className="ph-ui ph-reader">
      <div className="ph-bar"><b>المصحف الشريف</b></div>
      <div className="ph-page"><img src="/img/q2.jpg" alt="" /></div>
      <div className="ph-prog"><i /></div>
      <div className="ph-tabs"><i /><i className="on" /><i /><i /></div>
    </div>
  )
}

function PhoneShelves() {
  return (
    <div className="ph-ui">
      <div className="ph-bar"><Logo /><b>الرفوف</b></div>
      <div className="ph-grid">
        {SHELVES.map((sh) => (
          <div key={sh.id} className="ph-mini"><ShelfCover s={sh} /></div>
        ))}
      </div>
      <div className="ph-tabs"><i /><i /><i className="on" /><i /></div>
    </div>
  )
}

function DownloadBlock() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const midY = useTransform(p, [0, 1], [150, 0])
  const sideY = useTransform(p, [0, 1], [230, 30])
  const { w: vw } = useViewport()
  const small = vw < 700
  const spread = small ? 150 : 300
  const fit = small ? Math.min(0.9, (vw - 40) / (262 + spread * 2)) : null
  const lx = useTransform(p, [0, 1], [0, -spread])
  const rx = useTransform(p, [0, 1], [0, spread])
  const lr = useTransform(p, [0, 1], [0, 20])
  const rr = useTransform(p, [0, 1], [0, -20])
  const glow = useTransform(p, [0, 1], [0.25, 1])
  const head = useTransform(p, [0, 0.5], [0, 1])

  return (
    <div className="dlx" id="download" ref={ref}>
      <motion.div className="dlx-glow" style={reduce ? undefined : { opacity: glow }} aria-hidden="true" />
      <motion.div className="dlx-head" style={reduce ? undefined : { opacity: head }}>
        <h3 className="dlx-title">
          <small>تحميل</small>
          <span>مكتبة أمل الإسلام</span>
        </h3>
        <p className="dlx-sub">كتبك ومخطوطاتك في جيبك. حمّل التطبيق واقرأ أينما كنت.</p>
        <div className="dlx-stores">
          <a className="store" href={PLAY_URL} target="_blank" rel="noopener noreferrer" aria-label="حمّل مكتبة أمل الإسلام من Google Play">
            <PlayIcon />
            <span><small>حمّلها من</small><b>Google Play</b></span>
          </a>
          <a className="store" href={APPSTORE_URL} target="_blank" rel="noopener noreferrer" aria-label="حمّل مكتبة أمل الإسلام من App Store">
            <AppleIcon />
            <span><small>حمّلها من</small><b>App Store</b></span>
          </a>
        </div>
        <a className="browse" href={WEB_URL} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 60 60" className="browse-ico" aria-hidden="true"><path d="M30 46c-6-5-16-6-22-4V16c6-2 16-1 22 4zM30 46c6-5 16-6 22-4V16c-6-2-16-1-22 4z" fill="currentColor" /></svg>
          <span>تصفح المكتبة</span>
          <svg viewBox="0 0 24 24" className="browse-arrow" aria-hidden="true"><path d="M19 12H5M11 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.600" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
      </motion.div>

      <div className="dlx-phones" aria-hidden="true" style={small ? { height: 620 * fit + 10 } : undefined}>
        <div className="dlx-stage" style={small ? { transform: `scale(${fit})`, transformOrigin: 'top center' } : undefined}>
          <motion.div className="ph-wrap dlx-l" style={reduce ? { x: -spread, y: 30, rotateY: 20 } : { x: lx, y: sideY, rotateY: lr }}>
            <div className="ph ph-b2"><div className="ph-screen"><div className="ph-island" /><Shot k="reader" /></div></div>
          </motion.div>
          <motion.div className="ph-wrap dlx-r" style={reduce ? { x: spread, y: 30, rotateY: -20 } : { x: rx, y: sideY, rotateY: rr }}>
            <div className="ph ph-b2"><div className="ph-screen"><div className="ph-island" /><Shot k="home" /></div></div>
          </motion.div>
          <motion.div className="ph-wrap dlx-m" style={reduce ? undefined : { y: midY }}>
            <div className="ph"><div className="ph-screen"><div className="ph-island" /><PhoneSplash /></div></div>
          </motion.div>
        </div>
      </div>

      <div className="dlx-foot">
        <p className="dlx-rights">جميع الحقوق محفوظة</p>
        <p className="dlx-power">Powered by <b>Dijlah IT</b></p>
      </div>
    </div>
  )
}

const BOOKS = [
  { id: 'shukr', name: 'الشُّكر وزيادة النعمة', word: 'الشكر', img: '/img/book-shukr.webp', t: '#ecd08a', glow: 'rgba(200, 140, 70, 0.5)', text: 'تأليف أمل الموسوي' },
  { id: 'wilaya', name: 'الولاية والعفة', word: 'الولاية', img: '/img/book-wilaya.webp', t: '#bfe9cf', glow: 'rgba(70, 175, 120, 0.5)', text: 'تأليف أمل الموسوي' },
  { id: 'dawaesh', name: 'الدواعش من هم؟!', word: 'الدواعش', img: '/img/book-dawaesh.webp', t: '#ffc8a8', glow: 'rgba(235, 100, 50, 0.5)', text: 'تأليف أمل الموسوي' },
  { id: 'fatayat', name: 'الفتيات بين الدراسة والزواج', word: 'الفتيات', img: '/img/book-fatayat.webp', t: '#bfe6f2', glow: 'rgba(80, 190, 225, 0.5)', text: 'تأليف أمل الموسوي' },
  { id: 'nahda', name: 'النهضة الحسينية: رؤى معاصرة', word: 'النهضة', img: '/img/book-nahda.webp', t: '#f3c6a0', glow: 'rgba(205, 55, 65, 0.5)', text: 'تأليف أمل الموسوي' },
  { id: 'tazweej', name: 'التزويج', word: 'التزويج', img: '/img/book-tazweej.webp', t: '#ffc6e2', glow: 'rgba(225, 100, 165, 0.5)', text: 'تأليف أمل الموسوي' },
]

function BookCover({ sh }) {
  return (
    <div className="bk">
      <img className="bk-img" src={sh.img} alt={sh.name} decoding="async" />
      <i className="bk-spine" />
      <i className="bk-sheen" />
    </div>
  )
}

function FlowCover({ sh, k, pos, gap }) {
  const x = useTransform(pos, (v) => -(k - v) * gap)
  const z = useTransform(pos, (v) => -Math.min(Math.abs(k - v), 4) * 170)
  const rotateY = useTransform(pos, (v) => Math.max(-1, Math.min(1, k - v)) * 50)
  const scale = useTransform(pos, (v) => 1.12 - Math.min(Math.abs(k - v), 1) * 0.22)
  const opacity = useTransform(pos, (v) => 1 - Math.min(Math.abs(k - v), 4) * 0.2)
  const zIndex = useTransform(pos, (v) => 20 - Math.round(Math.abs(k - v)))
  return (
    <motion.div className="cf-cover" role="img" aria-label={sh.name} style={{ x, z, rotateY, scale, opacity, zIndex }}>
      <BookCover sh={sh} />
    </motion.div>
  )
}

function FlowLayer({ sh, k, pos }) {
  const o = useTransform(pos, [k - 0.7, k, k + 0.7], [0, 1, 0])
  const y = useTransform(pos, [k - 1, k, k + 1], [70, 0, -70])
  const wo = useTransform(pos, [k - 0.7, k, k + 0.7], [0, 0.22, 0])
  return (
    <>
      <motion.div className="cfx-glow" aria-hidden="true" style={{ opacity: o, background: `radial-gradient(closest-side, ${sh.glow}, transparent 100%)` }} />
      <motion.div className="cfx-word" aria-hidden="true" style={{ opacity: wo, y, color: sh.t }}>{sh.word}</motion.div>
    </>
  )
}

function FlowCaption({ sh, k, pos }) {
  const o = useTransform(pos, [k - 0.4, k, k + 0.4], [0, 1, 0])
  const y = useTransform(pos, [k - 0.5, k, k + 0.5], [26, 0, -26])
  return (
    <motion.p className="cfx-cap" style={{ opacity: o, y }}>
      <b>{sh.name}</b>
    </motion.p>
  )
}

function FlowSeg({ sh, k, pos, onGo }) {
  const o = useTransform(pos, [k - 0.7, k, k + 0.7], [0.28, 1, 0.28])
  const fill = useTransform(pos, [k - 0.5, k], [0, 1])
  return (
    <button className="seg" onClick={() => onGo(k)} aria-label={sh.name}>
      <span className="seg-bar"><motion.i style={{ scaleX: fill }} /></span>
      <motion.span className="seg-name" style={{ opacity: o }}>{sh.name}</motion.span>
    </button>
  )
}

function Shelves() {
  const ref = useRef(null)
  const { w } = useViewport()
  const reduce = useReducedMotion()
  const gap = w < 800 ? 112 : 205
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const pos = useTransform(p, (v) => {
    const u = Math.max(0, Math.min(1, (v - 0.1) / 0.8)) * (BOOKS.length - 1)
    const f = Math.min(Math.floor(u), BOOKS.length - 1)
    const t = u - f
    return Math.min(BOOKS.length - 1, f + t * t * (3 - 2 * t))
  })

  const headScale = useTransform(p, [0, 0.1], [1, 0.52])
  const leadO = useTransform(p, [0, 0.06], [1, 0])
  const flowY = useTransform(p, [0, 0.12], ['22svh', '-7svh'])
  const flowO = useTransform(p, [0, 0.05], [0.4, 1])

  const go = (k) => {
    const el = ref.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const range = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + (0.1 + (0.8 * k) / (BOOKS.length - 1)) * range, behavior: 'smooth' })
  }

  return (
    <section className="cfs" id="shelves">
      <div className="cfs-run" ref={ref}>
        <div className="cfs-stage">
          {BOOKS.map((sh, k) => <FlowLayer key={sh.id} sh={sh} k={k} pos={pos} />)}

          <motion.div className="cfx" style={reduce ? undefined : { y: flowY, opacity: flowO }}>
            {BOOKS.map((sh, k) => <FlowCover key={sh.id} sh={sh} k={k} pos={pos} gap={gap} />)}
            <div className="cf-floor" aria-hidden="true" />
          </motion.div>

          <div className="cfx-caps" aria-live="polite">
            {BOOKS.map((sh, k) => <FlowCaption key={sh.id} sh={sh} k={k} pos={pos} />)}
          </div>

          <div className="segs" role="tablist" aria-label="الكتب">
            {BOOKS.map((sh, k) => <FlowSeg key={sh.id} sh={sh} k={k} pos={pos} onGo={go} />)}
          </div>
        </div>
      </div>

      <DownloadBlock />
    </section>
  )
}

/* ───────────── 4 · path — one verb at a time, pictures open through the arch ───────────── */

const PATH = [
  { verb: 'اقرأ', text: 'ابدأ بأول كلمة نزل بها الوحي: «اقرأ». اقرأ النص بهدوء وكاملًا.', img: '/img/q-wide.jpg', pos: '50% 40%' },
  { verb: 'تدبّر', text: 'قف عند الآية والحديث واسأل: ماذا يقول لي هذا الكلام اليوم؟', img: '/img/s2.jpg', pos: '50% 35%' },
  { verb: 'تعلّم', text: 'استعن بالشروح والتفاسير لينتقل فهمك من الظن إلى اليقين.', img: '/img/q2.jpg', pos: '50% 30%' },
  { verb: 'اعمل', text: 'يكتمل العلم حين يظهر في السلوك؛ أغلق الكتاب وانطلق.', img: '/img/s3.jpg', pos: '50% 40%' },
]

const CLIP_FROM = 'inset(48% 33% 0% 33% round 50% 50% 0% 0%)'
const CLIP_TO = 'inset(0% 0% 0% 0% round 0% 0% 0% 0%)'

function PathLayer({ p, k, item }) {
  const clip = useTransform(p, [k / 4 - 0.1, k / 4 + 0.03], [CLIP_FROM, CLIP_TO])
  return (
    <motion.div className="path-layer" style={k === 0 ? undefined : { clipPath: clip }}>
      <img src={item.img} alt="" style={{ objectPosition: item.pos }} />
    </motion.div>
  )
}

function Path() {
  const ref = useRef(null)
  const [i, setI] = useState(0)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(p, 'change', (v) => {
    const n = [1, 2, 3].filter((k) => v > k / 4 - 0.03).length
    setI(n)
  })
  const cur = PATH[i]
  return (
    <section ref={ref} className="path" id="path" data-nav="dark" aria-label="الطريق: اقرأ، تدبّر، تعلّم، اعمل">
      <div className="path-sticky">
        {PATH.map((it, k) => (
          <PathLayer key={it.verb} p={p} k={k} item={it} />
        ))}
        <div className="path-shade" />
        <h2 className="path-verb">
          <AnimatePresence mode="wait">
            <motion.span
              key={cur.verb}
              initial={{ opacity: 0, y: 60, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -60, scale: 1.04 }}
              transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {cur.verb}
            </motion.span>
          </AnimatePresence>
        </h2>
        <div className="path-caption">
          <AnimatePresence mode="wait">
            <motion.p
              key={cur.verb}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {cur.text}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="path-steps" aria-hidden="true">
          {PATH.map((it, k) => (
            <span key={it.verb} className={k === i ? 'on' : ''}>{it.verb}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────── 5 · manuscripts — one frame, contents change ───────────── */

const FRAMES = [
  { src: '/img/q1.jpg', cap: 'ورقة من مصحف جامعة برمنغهام؛ رقٌّ يعود إلى القرن الأول الهجري', pos: '50% 30%' },
  { src: '/img/s1.jpg', cap: 'صفحة من الشاهنامة بعنوان وهامش مذهّبين، نحو ١٦١٠م', pos: '70% 42%' },
  { src: '/img/q2.jpg', cap: 'ورقة أخرى من المصحف نفسه؛ خط حجازي على الرق', pos: '50% 35%' },
  { src: '/img/s3.jpg', cap: 'صفحة من «شرف نامه» لنظامي، نحو ١٦٢٠م', pos: '50% 40%' },
  { src: '/img/s2.jpg', cap: 'ورقة أخرى من الشاهنامة؛ خط نستعليق في أعمدة مذهّبة', pos: '70% 40%' },
]

function Manuscripts() {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setI((v) => (v + 1) % FRAMES.length), 3400)
    return () => clearInterval(t)
  }, [reduce, i])
  return (
    <section className="manu" id="manuscripts" data-nav="dark">
      <Reveal className="manu-text">
        <h2 className="h2">كل ورقة أفقٌ</h2>
        <p className="lead">
          قبل الطباعة كان الكتاب يُكتب باليد ويُزيَّن. وهذه الأوراق من تلك السنّة التي تواصلها مكتبتنا.
        </p>
        <p className="manu-cap" aria-live="polite">{FRAMES[i].cap}</p>
        <a className="textlink" href="#faq">اعرف أكثر</a>
      </Reveal>
      <button className="manu-frame" onClick={() => setI((v) => (v + 1) % FRAMES.length)} aria-label="الورقة التالية">
        {FRAMES.map((f, k) => (
          <img key={f.src} src={f.src} alt={f.cap} className={k === i ? 'on' : ''} style={{ objectPosition: f.pos }} />
        ))}
      </button>
    </section>
  )
}

/* ───────────── 6 · one figure owns the screen ───────────── */

const SURAHS = ["الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"]

const toAr = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d])

function StatTile({ i, count }) {
  const bg = useTransform(count, [i, i + 1], ['rgba(255,255,255,0.08)', 'rgba(212,162,76,1)'])
  const sc = useTransform(count, [i, i + 1, i + 4], [1, 1.45, 1])
  return <motion.i className="tile" style={{ backgroundColor: bg, scale: sc }} />
}

function Stat() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const live = useTransform(p, [0.06, 0.9], [0, 114])
  const still = useMotionValue(114)
  const count = reduce ? still : live
  const [n, setN] = useState(reduce ? 114 : 0)
  useMotionValueEvent(count, 'change', (v) => setN(Math.round(v)))
  const glow = useTransform(count, [0, 114], [0.15, 1])

  return (
    <section className="stat2" ref={ref} data-nav="dark">
      <div className="st-stage">
        <motion.div className="st-glow" aria-hidden="true" style={{ opacity: glow }} />

        <div className="st-top">
          <h2 className="st-claim">كتاب واحد في مئة وأربع عشرة سورة</h2>
          <p className="st-cap">للقرآن الكريم مئة وأربع عشرة سورة، من الفاتحة إلى الناس. ومن هنا تبدأ رفوفنا، ومنه تتفرّع.</p>
        </div>

        <div className="st-mid" aria-hidden="true">
          <div className="st-figure">
            <span className="st-num">{toAr(n)}</span>
            <span className="st-unit">سورة</span>
          </div>
          <p className="st-name">{n > 0 ? <>سورة <b>{SURAHS[Math.min(n, 114) - 1]}</b></> : 'انزل ببطء لتعدّها'}</p>
        </div>

        <div className="st-tiles" aria-hidden="true">
          {Array.from({ length: 114 }, (_, i) => <StatTile key={i} i={i} count={count} />)}
        </div>
      </div>
    </section>
  )
}

/* ───────────── 7 · faq — answers as reading text ───────────── */

const FAQ = [
  ['ما هي مكتبة أمل الإسلام؟', 'مكتبة ومتجر كتب للنصوص الإسلامية، من القرآن والتفسير إلى الحديث والفقه والسيرة والأخلاق، برفوف رُتّبت بعناية.'],
  ['من أين أبدأ؟', 'إن كنت في البداية فافتح رفّ «القرآن والتفسير» وابدأ بترجمة سلسة، ثم انتقل إلى السيرة والأخلاق.'],
  ['لم أجد الكتاب الذي أريده، ماذا أفعل؟', 'أرسل إلينا العنوان واسم المؤلف لنسعى إلى البحث عنه وإضافته إلى الفهرس.'],
  ['هل لديكم كتب للأطفال؟', 'نعم، في رفّ الأطفال والناشئة قصص قرآنية وتعليم مبسّط بالصور.'],
  ['كيف تُختار المصادر؟', 'من النصوص الأصيلة والطبعات الموثوقة؛ ويُذكر بجانب كل عنوان اسم المحقق والناشر وسنة الطبع.'],
  ['هل يمكنني إهداء كتاب؟', 'نعم. الكتاب خير هدية لمن تحب، ويمكنك كتابة رسالة ترافقه.'],
  ['هل تتوفر نسخ مطبوعة ورقمية؟', 'تفاصيل كل عنوان في صفحته؛ وحيث تتوفر النسختان يمكنك الاختيار.'],
  ['كيف أتواصل معكم؟', 'راسلنا عبر البريد في أسفل الصفحة؛ وسنجيبك بعناية وفي أقرب وقت.'],
]

function Faq() {
  return (
    <section className="faq" id="faq">
      <Reveal as="h2" className="h3 faq-h">الأسئلة</Reveal>
      <Reveal className="faq-cols" delay={0.1}>
        {FAQ.map(([q, a]) => (
          <p key={q}><strong>{q}</strong> {a}</p>
        ))}
      </Reveal>
    </section>
  )
}

/* ───────────── 8 · one word is the button ───────────── */

function Cta() {
  return (
    <a className="cta" href="#shelves" aria-label="اقرأ؛ ادخل الرفوف">
      <p className="cta-sentence">الرفوف في انتظارك؛ اختر أول كتاب.</p>
      <svg className="cta-arrow" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M34 14H14M34 14v20M34 14L12 36" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
      </svg>
      <span className="cta-word" aria-hidden="true">اقرأ</span>
    </a>
  )
}

/* ───────────── footer ───────────── */

function Footer() {
  return (
    <footer className="footer" data-nav="dark">
      <div className="footer-top">
        <ul className="footer-places">
          <li><a href="mailto:info@amal-al-islam.example">info@amal-al-islam.example</a></li>
          <li><a href="#shelves">الرفوف</a></li>
          <li><a href="#faq">الأسئلة</a></li>
        </ul>
        <div className="footer-links">
          <a href="#path">طريقنا</a>
          <a href="#manuscripts">المخطوطات</a>
          <a href="#shelves">القرآن والتفسير</a>
          <a href="#shelves">الحديث</a>
          <a href="#shelves">الفقه والأحكام</a>
          <a href="#shelves">السيرة والتاريخ</a>
          <a href="#shelves">الأخلاق والتزكية</a>
          <a href="#shelves">الأطفال والناشئة</a>
        </div>
      </div>
      <div className="footer-name" aria-hidden="true">أمل الإسلام</div>
      <div className="footer-legal">
        <p>
          الصور: مصحف جامعة برمنغهام الخطي (ملكية عامة)، وصفحات الشاهنامة و«شرف نامه» من متحف المتروبوليتان (CC0)، عبر ويكيميديا كومنز.
        </p>
        <a href="#top">العودة إلى الأعلى</a>
      </div>
    </footer>
  )
}

/* ───────────── app ───────────── */

function SiteFooter() {
  return (
    <footer className="sfoot">
      <p className="sfoot-copy">جميع الحقوق محفوظة</p>
      <p className="sfoot-power">Powered by <b>Dijlah IT</b></p>
    </footer>
  )
}

export default function App() {
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    /* diagnostic: add ?plain to the address to turn smooth-scrolling off */
    if (new URLSearchParams(window.location.search).has('plain')) return
    const lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.4,
      syncTouch: false,
    })
    let raf
    const loop = (t) => {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    /* section links: land directly on the target (no travelling through the other
       scenes), then let the section itself ease in. */
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const id = a.getAttribute('href')
      const node = id === '#top' ? document.getElementById('top') : document.querySelector(id)
      if (!node) return
      e.preventDefault()
      const y = id === '#top' ? 0 : Math.max(0, node.getBoundingClientRect().top + window.scrollY - 60)
      const dist = Math.abs(y - window.scrollY)
      if (dist < 4) return
      if (dist < window.innerHeight * 1.2) {
        lenis.scrollTo(y, { duration: 1, easing: (t) => 1 - Math.pow(1 - t, 4) })
        return
      }
      lenis.scrollTo(y, { immediate: true, force: true })
      node.getAnimations().forEach((x) => x.cancel())
      node.animate(
        [
          { opacity: 0, transform: 'translateY(46px) scale(0.985)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 750, easing: 'cubic-bezier(.2,.7,.2,1)' }
      )
    }
    document.addEventListener('click', onClick)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('click', onClick)
      lenis.destroy()
    }
  }, [reduce])

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Intro />
        <Shelves />
      </main>
    </>
  )
}
