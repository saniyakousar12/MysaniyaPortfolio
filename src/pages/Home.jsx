import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import emailjs from '@emailjs/browser'
import { useEffect, useRef, useState } from 'react'
import {
  FaGithub, FaLinkedin, FaEnvelope, FaAward, FaCode,
  FaUsers, FaMapMarkerAlt, FaCalendarAlt,
  FaRegLightbulb, FaHeart, FaRocket, FaArrowRight,
  FaBriefcase
} from 'react-icons/fa'
import {
  SiReact, SiJavascript, SiPython, SiSpringboot, SiTailwindcss,
  SiMysql, SiGit, SiHtml5, SiSpring, SiCplusplus, SiC, SiHibernate, SiPostman
} from 'react-icons/si'

/* ─── Animated background ────────────────────────────────────────── */
const Background = () => {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: -999, y: -999 })
  const raf = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let W, H
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const onMouse = e => { mouse.current = { x: e.clientX, y: e.clientY } }
    const onTouch = e => { mouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('touchmove', onTouch, { passive: true })
    const orbs = [
      { x: 0.15, y: 0.2,  r: 320, c: '0,212,255',  speed: 0.0003 },
      { x: 0.85, y: 0.15, r: 260, c: '6,182,212',   speed: 0.0004 },
      { x: 0.5,  y: 0.6,  r: 200, c: '99,102,241',  speed: 0.0005 },
      { x: 0.2,  y: 0.8,  r: 180, c: '0,180,220',   speed: 0.0006 },
      { x: 0.9,  y: 0.75, r: 240, c: '14,165,233',  speed: 0.00035 },
    ]
    let t = 0
    const draw = () => {
      t++
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#020b18'
      ctx.fillRect(0, 0, W, H)
      orbs.forEach((o, i) => {
        const ox = (o.x + Math.sin(t * o.speed + i) * 0.08) * W
        const oy = (o.y + Math.cos(t * o.speed * 1.3 + i) * 0.06) * H
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r)
        g.addColorStop(0, `rgba(${o.c},0.18)`)
        g.addColorStop(0.5, `rgba(${o.c},0.06)`)
        g.addColorStop(1, `rgba(${o.c},0)`)
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(ox, oy, o.r, 0, Math.PI * 2); ctx.fill()
      })
      const mx = mouse.current.x, my = mouse.current.y
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 200)
      mg.addColorStop(0, 'rgba(0,212,255,0.07)')
      mg.addColorStop(1, 'rgba(0,212,255,0)')
      ctx.fillStyle = mg
      ctx.beginPath(); ctx.arc(mx, my, 200, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(0,212,255,0.04)'; ctx.lineWidth = 1
      const gs = 60
      for (let x = 0; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
      for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
      const sl = (t * 0.5) % H
      const slg = ctx.createLinearGradient(0, sl - 40, 0, sl + 40)
      slg.addColorStop(0, 'rgba(0,212,255,0)')
      slg.addColorStop(0.5, 'rgba(0,212,255,0.025)')
      slg.addColorStop(1, 'rgba(0,212,255,0)')
      ctx.fillStyle = slg; ctx.fillRect(0, sl - 40, W, 80)
      raf.current = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
}

/* ─── Glowing cursor (desktop only) ─────────────────────────────── */
const CursorGlow = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const move = e => { setPos({ x: e.clientX, y: e.clientY }); setVisible(true) }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])
  if (!visible) return null
  return (
    <div style={{
      position: 'fixed', left: pos.x - 6, top: pos.y - 6,
      width: 12, height: 12, borderRadius: '50%',
      background: 'rgba(0,212,255,0.9)',
      boxShadow: '0 0 20px 6px rgba(0,212,255,0.4)',
      pointerEvents: 'none', zIndex: 9999,
      transition: 'left 0.05s linear, top 0.05s linear',
    }} />
  )
}

/* ─── Typewriter ─────────────────────────────────────────────────── */
const Typewriter = ({ words }) => {
  const [idx, setIdx] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    const word = words[idx]
    let timer
    if (!deleting && text.length < word.length) timer = setTimeout(() => setText(word.slice(0, text.length + 1)), 80)
    else if (!deleting && text.length === word.length) timer = setTimeout(() => setDeleting(true), 1800)
    else if (deleting && text.length > 0) timer = setTimeout(() => setText(text.slice(0, -1)), 45)
    else if (deleting && text.length === 0) { setDeleting(false); setIdx((idx + 1) % words.length) }
    return () => clearTimeout(timer)
  }, [text, deleting, idx, words])
  return (
    <span style={{ color: '#00d4ff', fontFamily: "'Syne', sans-serif" }}>
      {text}<span style={{ animation: 'blink 1s step-end infinite' }}>|</span>
    </span>
  )
}

/* ─── Section heading ────────────────────────────────────────────── */
const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 48, textAlign: 'center' }}>
    {sub && <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.3em', color: '#06b6d4', textTransform: 'uppercase', marginBottom: 12 }}>{sub}</p>}
    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>{children}</h2>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <div style={{ height: 1, width: 64, background: 'linear-gradient(to right, transparent, #00d4ff)' }} />
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 12px rgba(0,212,255,0.8)' }} />
      <div style={{ height: 1, width: 64, background: 'linear-gradient(to left, transparent, #00d4ff)' }} />
    </div>
  </div>
)

/* ─── Reveal animation ───────────────────────────────────────────── */
const Reveal = ({ children, delay = 0 }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.08 })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 48 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}>
      {children}
    </motion.div>
  )
}

/* ─── Glass styles ───────────────────────────────────────────────── */
const glass = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(24px)',
  borderRadius: 20,
}
const glassGlow = { ...glass, boxShadow: '0 0 40px rgba(0,212,255,0.08)' }

/* ─── useWindowWidth hook ────────────────────────────────────────── */
const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return width
}

/* ─── ProjectCard (No Add Image Button) ──────────────────────────── */
/* ─── ProjectCard (With Hover Images) ──────────────────────────── */
const ProjectCard = ({ p, i }) => {
  const [isHovered, setIsHovered] = useState(false)
  const width = useWindowWidth()
  const isMobile = width < 768

  return (
    <Reveal delay={i * 0.15}>
      <div
        className="proj-card"
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        style={{
          borderRadius: 20, overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
          position: 'relative',
          transition: 'all 0.35s ease',
          minHeight: isHovered && !isMobile ? 480 : 'auto',
        }}
      >
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${p.accent}, transparent)`, opacity: 0.6 }} />

        {/* Image visible on mobile */}
        {p.image && isMobile && (
          <div style={{ width: '100%', height: 220, overflow: 'hidden' }}>
            <img 
              src={p.image} 
              alt={p.title} 
              loading="lazy"
              style={{ 
                width: '100%', height: '100%', objectFit: 'cover', 
                objectPosition: 'center top', display: 'block' 
              }} 
            />
          </div>
        )}

        {/* Hover overlay - shows image on desktop hover */}
        <AnimatePresence>
          {isHovered && p.image && !isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                zIndex: 20, 
                borderRadius: 20, 
                overflow: 'hidden' 
              }}
            >
              <img 
                src={p.image} 
                alt={p.title} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  objectPosition: 'center top', 
                  display: 'block' 
                }} 
              />
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(to top, rgba(2,11,24,0.7), transparent)',
                display: 'flex', 
                alignItems: 'flex-end', 
                padding: '24px 28px' 
              }}>
                <span style={{ 
                  color: p.accent, 
                  fontSize: 13, 
                  fontFamily: "'DM Sans', sans-serif", 
                  background: 'rgba(2,11,24,0.7)', 
                  padding: '6px 14px', 
                  borderRadius: 999, 
                  border: `1px solid ${p.accent}50`,
                  backdropFilter: 'blur(4px)'
                }}>
                  🔍 {p.title} Preview
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div style={{
          padding: isMobile ? '24px 20px' : '36px 40px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
          gap: isMobile ? 20 : 32,
          alignItems: 'flex-start',
          position: 'relative',
          zIndex: 10,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
              <span className="proj-num" style={{ 
                fontFamily: "'Syne', sans-serif", 
                fontWeight: 900, 
                fontSize: isMobile ? 36 : 48, 
                color: isHovered && !isMobile ? p.accent : 'rgba(255,255,255,0.07)',
                lineHeight: 1, 
                transition: 'all 0.3s', 
                flexShrink: 0,
                textShadow: isHovered && !isMobile ? `0 0 20px ${p.accent}` : 'none'
              }}>{p.num}</span>
              <div>
                <p style={{ fontSize: 10, letterSpacing: '0.2em', color: '#4b5563', textTransform: 'uppercase', marginBottom: 4 }}>{p.tag}</p>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: isMobile ? 22 : 28, color: '#fff', letterSpacing: '-0.02em' }}>{p.title}</h3>
              </div>
            </div>
            <p style={{ color: '#9ca3af', fontSize: isMobile ? 14 : 15, lineHeight: 1.7, marginBottom: 20 }}>{p.desc}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {p.features.map((f, fi) => (
                <span key={fi} style={{ 
                  padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, 
                  background: `${p.accent}14`, border: `1px solid ${p.accent}35`, color: p.accent 
                }}>{f}</span>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {p.tech.map((t, ti) => (
                <span key={ti} style={{ 
                  padding: '4px 12px', borderRadius: 999, fontSize: 12, color: '#4b5563', 
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' 
                }}>{t}</span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 12, alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'center', flexWrap: 'wrap' }}>
            <a href={p.github} target="_blank" rel="noopener noreferrer" className="glow-btn"
              style={{ padding: '10px 20px', borderRadius: 14, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <FaGithub size={14} /> GitHub
            </a>
            {!isMobile && (
              <div style={{ 
                width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', 
                justifyContent: 'center', fontSize: 26, background: `${p.accent}12`, 
                border: `1px solid ${p.accent}25`,
                transition: 'all 0.3s',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)'
              }}>
                {p.emoji}
              </div>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  )
}

/* ══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const scrollTo = id => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
  const width = useWindowWidth()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024
  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    message: '',
  })
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState({ message: '', type: '' })

  // EmailJS credentials
  const EMAILJS_SERVICE_ID = 'service_qhpp6ob'
  const EMAILJS_TEMPLATE_ID = 'template_t65l62b'
  const EMAILJS_PUBLIC_KEY = '7jt1aw-a62UnrGp7B'

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setStatus({ message: '', type: '' })

    try {
      const templateParams = {
        from_name: formData.from_name,
        from_email: formData.from_email,
        message: formData.message,
        to_name: 'Saniya Kousar',
      }

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      )

      if (response.status === 200) {
        setStatus({ 
          message: '✨ Message sent successfully! I\'ll get back to you soon.', 
          type: 'success' 
        })
        setFormData({ from_name: '', from_email: '', message: '' })
      } else {
        throw new Error('Failed to send')
      }
    } catch (error) {
      console.error('EmailJS Error:', error)
      setStatus({ 
        message: '❌ Failed to send message. Please try again or email me directly.', 
        type: 'error' 
      })
    } finally {
      setSending(false)
      setTimeout(() => setStatus({ message: '', type: '' }), 5000)
    }
  }

  const skills = [
    { cat: 'Languages', items: [
      { name: 'Java', icon: FaCode, color: '#f89820' },
      { name: 'Python', icon: SiPython, color: '#3776AB' },
      { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
      { name: 'C++', icon: SiCplusplus, color: '#00599C' },
      { name: 'C', icon: SiC, color: '#A8B9CC' },
    ]},
    { cat: 'Frameworks & Technologies', items: [
      { name: 'React', icon: SiReact, color: '#61DAFB' },
      { name: 'Spring Boot', icon: SiSpringboot, color: '#6DB33F' },
      { name: 'Spring AI', icon: SiSpring, color: '#6DB33F' },
      { name: 'Tailwind CSS', icon: SiTailwindcss, color: '#06B6D4' },
      { name: 'Bootstrap', icon: SiHtml5, color: '#7952B3' },
      { name: 'Hibernate', icon: SiHibernate, color: '#59666C' },
    ]},
    { cat: 'Tools & Databases', items: [
      { name: 'MySQL', icon: SiMysql, color: '#4479A1' },
      { name: 'Git / GitHub', icon: SiGit, color: '#F05032' },
      { name: 'Postman', icon: SiPostman, color: '#FF6C37' },
    ]},
  ]

  const projects = [
    {
      num: '01', title: 'BookSwap', tag: 'Full Stack · AI-Powered',
      desc: 'Community book exchange platform with AI-powered recommendation engine, real-time WebSocket notifications, secure payments, trust scores, and gamified badges.',
      tech: ['React', 'Spring Boot', 'Spring AI', 'MySQL', 'REST APIs'],
      features: ['AI Recommendations', 'Real-time Chat', 'Payment Integration', 'Gamification'],
      github: 'https://github.com/saniyakousar12/BookSwap.git',
      accent: '#00d4ff', emoji: '📚',
      image: '/projects/bookswap.png',
    },
    {
      num: '02', title: 'Plagiarism Detector', tag: 'Python · Image Processing',
      desc: 'Detects text & image plagiarism — computes word-overlap similarity percentages and uses hologram matching to identify duplicated visual content with threshold highlighting.',
      tech: ['Python', 'Django', 'MySQL', 'Image Processing'],
      features: ['Text Similarity', 'Hologram Matching', 'Visual Highlighting'],
      github: 'https://github.com/saniya-kousar/plagiarism-detection',
      accent: '#818cf8', emoji: '🔍',
      image: '/projects/text.jpg',
    },
  ]

  const stats = [
    { value: '9.96', label: 'Diploma CGA', icon: '🏆' },
    { value: '9.63', label: 'Current CGA', icon: '🎓' },
    { value: '300+', label: 'Students Reached', icon: '👥' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (pointer: fine) { * { cursor: none !important; } }
        ::selection { background: rgba(0,212,255,0.25); color: #fff; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulseRing { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(1.9);opacity:0} }
        .float { animation: floatY 6s ease-in-out infinite; }
        .ring1 { position:absolute;inset:-8px;border-radius:50%;border:1px solid rgba(0,212,255,0.35);animation:pulseRing 3s ease-out infinite; }
        .ring2 { position:absolute;inset:-8px;border-radius:50%;border:1px solid rgba(0,212,255,0.35);animation:pulseRing 3s ease-out infinite 1.5s; }
        .glow-btn { background:linear-gradient(135deg,rgba(0,212,255,0.15),rgba(6,182,212,0.1));border:1px solid rgba(0,212,255,0.4);box-shadow:0 0 20px rgba(0,212,255,0.12);transition:all 0.3s ease;color:#67e8f9; }
        .glow-btn:hover { background:linear-gradient(135deg,rgba(0,212,255,0.25),rgba(6,182,212,0.2));box-shadow:0 0 40px rgba(0,212,255,0.3);border-color:rgba(0,212,255,0.7);transform:translateY(-2px); }
        .skill-chip { transition:all 0.2s ease; }
        .skill-chip:hover { border-color:rgba(0,212,255,0.45)!important;box-shadow:0 0 16px rgba(0,212,255,0.2);transform:translateY(-3px); }
        .proj-card { transition:all 0.35s ease; }
        .proj-card:hover { border-color:rgba(0,212,255,0.35)!important;box-shadow:0 0 60px rgba(0,212,255,0.07);transform:translateY(-4px); }
        .proj-card:hover .proj-num { color:#00d4ff;text-shadow:0 0 20px rgba(0,212,255,0.6); }
        .glass-card { transition:border-color 0.3s,box-shadow 0.3s; }
        .glass-card:hover { border-color:rgba(0,212,255,0.3)!important;box-shadow:0 0 30px rgba(0,212,255,0.08)!important; }
        input:not([type="file"]), textarea { background:rgba(255,255,255,0.04)!important;border:1px solid rgba(255,255,255,0.08)!important;border-radius:12px;color:#fff;padding:12px 16px;width:100%;outline:none;font-family:'DM Sans',sans-serif;font-size:14px;transition:box-shadow 0.2s,border-color 0.2s; }
        input::placeholder, textarea::placeholder { color:rgba(255,255,255,0.2); }
        input:focus, textarea:focus { border-color:rgba(0,212,255,0.5)!important;box-shadow:0 0 0 3px rgba(0,212,255,0.12); }
        .terminal-line::before { content:'> ';color:#00d4ff;font-family:monospace; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#020b18; }
        ::-webkit-scrollbar-thumb { background:rgba(0,212,255,0.3);border-radius:2px; }
        /* Responsive nav */
        .nav-links { display:flex;gap:32px; }
        @media(max-width:767px) { .nav-links { display:none!important; } }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <CursorGlow />
      <Background />

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#020b18', minHeight: '100vh', position: 'relative' }}>

        {/* ══ NAV ════════════════════════════════════════════════════ */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: isMobile ? '14px 20px' : '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(2,11,24,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 20, color: '#fff' }}>SK<span style={{ color: '#00d4ff' }}>.</span></span>
          <div className="nav-links">
            {['About', 'Skills', 'Projects', 'Certifications', 'Contact'].map(item => (
              <button key={item} onClick={() => scrollTo(`#${item.toLowerCase()}`)}
                style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = '#6b7280'}
              >{item}</button>
            ))}
          </div>
          <button onClick={() => scrollTo('#contact')} className="glow-btn"
            style={{ padding: isMobile ? '8px 16px' : '10px 22px', borderRadius: 999, fontSize: isMobile ? 12 : 14, fontWeight: 600, border: 'none' }}>
            Hire Me
          </button>
        </nav>

        {/* ══ HERO ═══════════════════════════════════════════════════ */}
        <section id="home" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 'clamp(60px, 18vw, 220px)', color: 'rgba(255,255,255,0.025)', letterSpacing: '-0.05em', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none' }}>SANIYA</div>

          <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '60px 20px 80px' : '80px 24px', display: 'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 80, alignItems: 'center', position: 'relative', zIndex: 10, width: '100%' }}>

            {/* LEFT */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 32, height: 1, background: '#00d4ff' }} />
                <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#06b6d4', textTransform: 'uppercase', fontWeight: 600 }}>Full Stack Developer</span>
              </div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(36px, 10vw, 72px)', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 16 }}>
                Saniya<br />
                <span style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.2)', color: 'transparent' }}>Kousar</span>
              </h1>
              <p style={{ fontSize: isMobile ? 17 : 20, color: '#6b7280', marginBottom: 8, fontWeight: 300 }}>
                I build <Typewriter words={['web apps.', 'REST APIs.', 'AI features.', 'clean UIs.']} />
              </p>
              <p style={{ color: '#4b5563', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
                <FaMapMarkerAlt style={{ color: '#0e7490' }} size={11} />
                Telangana, India · CSE @ UCE, Osmania University
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
                <button onClick={() => scrollTo('#projects')} className="glow-btn" style={{ padding: '12px 24px', borderRadius: 999, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, border: 'none' }}>
                  View Work <FaArrowRight size={12} />
                </button>
                <button onClick={() => scrollTo('#contact')}
                  style={{ padding: '12px 24px', borderRadius: 999, fontWeight: 600, fontSize: 14, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#d1d5db', transition: 'all 0.3s', fontFamily: "'DM Sans', sans-serif" }}
                  onMouseEnter={e => { e.target.style.borderColor='rgba(255,255,255,0.2)'; e.target.style.background='rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { e.target.style.borderColor='rgba(255,255,255,0.1)'; e.target.style.background='transparent' }}>
                  Contact
                </button>
              </div>
              <div style={{ display: 'flex', gap: 14 }}>
                {[
                  { icon: FaGithub, href: 'https://github.com/saniyakousar12' },
                  { icon: FaLinkedin, href: 'https://linkedin.com/in/saniya-kousar-48b73327a' },
                  { icon: FaEnvelope, href: 'mailto:saniyakousar013@gmail.com' },
                ].map(({ icon: Icon, href }, i) => (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                    style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', textDecoration: 'none', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.color='#00d4ff'; e.currentTarget.style.borderColor='rgba(0,212,255,0.5)'; e.currentTarget.style.boxShadow='0 0 16px rgba(0,212,255,0.25)' }}
                    onMouseLeave={e => { e.currentTarget.style.color='#6b7280'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow='none' }}>
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* RIGHT — profile card, hidden on mobile */}
            {!isMobile && (
              <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.3 }}
                style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <div className="float" style={{ width: isTablet ? 260 : 300, borderRadius: 28, overflow: 'hidden', background: 'linear-gradient(145deg, rgba(0,212,255,0.1) 0%, rgba(2,11,24,0.95) 100%)', border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 0 40px rgba(0,212,255,0.1)' }}>
                    <div style={{ height: 3, background: 'linear-gradient(90deg, #00d4ff, #0ea5e9, #00d4ff)' }} />
                    <div style={{ padding: 28, textAlign: 'center' }}>
                      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                        <div className="ring1" /><div className="ring2" />
                        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(6,182,212,0.08))', border: '2px solid rgba(0,212,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46 }}>👩‍💻</div>
                        <div style={{ position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: '50%', background: '#34d399', border: '2px solid #020b18', boxShadow: '0 0 8px rgba(52,211,153,0.8)' }} />
                      </div>
                      <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, color: '#fff', marginBottom: 4 }}>Saniya Kousar</h3>
                      <p style={{ color: '#00d4ff', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 20 }}>Full Stack Developer</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                        {stats.map((s, i) => (
                          <div key={i} style={{ borderRadius: 12, padding: '8px 4px', textAlign: 'center', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)' }}>
                            <div style={{ fontSize: 13, marginBottom: 2 }}>{s.icon}</div>
                            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, color: '#fff' }}>{s.value}</div>
                            <div style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.3 }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ borderRadius: 12, padding: '10px 14px', textAlign: 'left', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,212,255,0.1)' }}>
                        <p style={{ fontSize: 10, color: '#374151', marginBottom: 4, fontFamily: 'monospace' }}>// status</p>
                        <p className="terminal-line" style={{ fontSize: 11, color: '#67e8f9', fontFamily: 'monospace', margin: '2px 0' }}>open to opportunities</p>
                        <p className="terminal-line" style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', margin: '2px 0' }}>based in Telangana, India</p>
                      </div>
                    </div>
                  </div>
                  {/* Floating badges — only on large screens */}
                  {!isTablet && (<>
                    <motion.div animate={{ y: [0,-8,0] }} transition={{ duration: 3, repeat: Infinity }}
                      style={{ position: 'absolute', left: -70, top: 60, padding: '8px 14px', borderRadius: 12, background: 'rgba(2,11,24,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,212,255,0.3)', fontSize: 12, fontWeight: 600, color: '#67e8f9' }}>
                      ⚡ Spring Boot
                    </motion.div>
                    <motion.div animate={{ y: [0,8,0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                      style={{ position: 'absolute', right: -60, bottom: 90, padding: '8px 14px', borderRadius: 12, background: 'rgba(2,11,24,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,212,255,0.3)', fontSize: 12, fontWeight: 600, color: '#67e8f9' }}>
                      ⚛️ React
                    </motion.div>
                    <motion.div animate={{ y: [0,-6,0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                      style={{ position: 'absolute', right: -50, top: 30, padding: '8px 14px', borderRadius: 12, background: 'rgba(2,11,24,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,212,255,0.3)', fontSize: 12, fontWeight: 600, color: '#67e8f9' }}>
                      🤖 Spring AI
                    </motion.div>
                  </>)}
                </div>
              </motion.div>
            )}
          </div>

          <motion.div animate={{ y: [0,6,0] }} transition={{ duration: 2, repeat: Infinity }} onClick={() => scrollTo('#about')}
            style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <span style={{ fontSize: 10, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase' }}>scroll</span>
            <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, rgba(0,212,255,0.6), transparent)' }} />
          </motion.div>
        </section>

        {/* ══ ABOUT ══════════════════════════════════════════════════ */}
        <section id="about" style={{ padding: isMobile ? '72px 20px' : '112px 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal><SectionTitle sub="Who I Am">About Me</SectionTitle></Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 20 }}>
              <Reveal delay={0.1}>
                <div className="glass-card" style={{ ...glassGlow, padding: isMobile ? 24 : 40 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaCode style={{ color: '#00d4ff' }} size={15} />
                    </div>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: 15 }}>My Story</span>
                  </div>
                  <p style={{ color: '#9ca3af', lineHeight: 1.8, fontSize: isMobile ? 14 : 15, marginBottom: 16 }}>
                    Motivated Computer Science Engineering student with strong foundations in programming, data structures, and software development. Passionate about building scalable full-stack applications that solve real problems.
                  </p>
                  <p style={{ color: '#6b7280', lineHeight: 1.8, fontSize: 14 }}>
                    Currently seeking a Software Engineer role to apply technical skills, contribute to real-world projects, and grow in a dynamic environment. I believe great code is both functional and beautifully crafted.
                  </p>
                  <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                    <div>
                      <p style={{ fontSize: 10, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Education</p>
                      <p style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>B.E. Computer Science</p>
                      <p style={{ color: '#06b6d4', fontSize: 12 }}>UCET, Osmania University · 9.63 CGA</p>
                    </div>
                    <div style={{ marginTop: isMobile ? 12 : 0 }}>
                      <p style={{ fontSize: 10, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Previously</p>
                      <p style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Diploma in CSE</p>
                      <p style={{ color: '#06b6d4', fontSize: 12 }}>Govt Polytechnic Warangal · 9.96 CGA</p>
                    </div>
                  </div>
                </div>
              </Reveal>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : '1fr', gap: 16 }}>
                {stats.map((s, i) => (
                  <Reveal key={i} delay={0.15 + i * 0.1}>
                    <div className="glass-card" style={{ ...glass, padding: isMobile ? '16px 8px' : '24px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: isMobile ? 22 : 28, marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: isMobile ? 22 : 32, color: '#fff', textShadow: '0 0 20px rgba(0,212,255,0.5)', marginBottom: 4 }}>{s.value}</div>
                      <div style={{ fontSize: isMobile ? 10 : 12, color: '#6b7280' }}>{s.label}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={0.2}>
              <div className="glass-card" style={{ ...glass, padding: isMobile ? 24 : 36, marginTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FaBriefcase style={{ color: '#00d4ff' }} size={16} />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 2 }}>Work Experience</p>
                      <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: isMobile ? 16 : 20, color: '#fff', marginBottom: 2 }}>Java Developer Intern</h3>
                      <p style={{ color: '#06b6d4', fontSize: 13 }}>Infosys Springboard</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4b5563', fontSize: 12 }}><FaCalendarAlt size={10} /> Nov 2025 – Feb 2026</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4b5563', fontSize: 12 }}><FaMapMarkerAlt size={10} /> Remote</span>
                  </div>
                </div>
                <p style={{ marginTop: 16, color: '#9ca3af', fontSize: 14, lineHeight: 1.8 }}>
                  Hands-on experience in Core Java — OOP, exception handling, collections, multithreading. Built backend applications with Spring Boot: RESTful services, layered architecture, and database integration. Contributed to real-world projects following Agile methodology.
                </p>
                <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Java', 'Spring Boot', 'REST APIs', 'Agile', 'MySQL'].map(t => (
                    <span key={t} className="skill-chip" style={{ padding: '4px 12px', borderRadius: 999, background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)', color: '#67e8f9', fontSize: 12, fontWeight: 500 }}>{t}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ SKILLS ═════════════════════════════════════════════════ */}
        <section id="skills" style={{ padding: isMobile ? '72px 20px' : '112px 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal><SectionTitle sub="What I Know">Technical Skills</SectionTitle></Reveal>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {skills.map((group, gi) => (
                <Reveal key={gi} delay={gi * 0.1}>
                  <div className="glass-card" style={{ ...glass, padding: isMobile ? 20 : 28 }}>
                    <p style={{ fontSize: 10, letterSpacing: '0.2em', color: '#0e7490', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>{group.cat}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {group.items.map((skill, si) => (
                        <motion.div key={si} whileHover={{ y: -4, scale: 1.04 }} className="skill-chip"
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: isMobile ? '8px 14px' : '10px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <skill.icon size={16} style={{ color: skill.color, filter: `drop-shadow(0 0 5px ${skill.color}66)` }} />
                          <span style={{ color: '#d1d5db', fontSize: isMobile ? 13 : 14, fontWeight: 500 }}>{skill.name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PROJECTS ═══════════════════════════════════════════════ */}
        <section id="projects" style={{ padding: isMobile ? '72px 20px' : '112px 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal><SectionTitle sub="What I've Built">Featured Projects</SectionTitle></Reveal>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {projects.map((p, i) => <ProjectCard key={p.num} p={p} i={i} />)}
            </div>
          </div>
        </section>

        {/* ══ CERTIFICATIONS ═════════════════════════════════════════ */}
        <section id="certifications" style={{ padding: isMobile ? '72px 20px' : '112px 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal><SectionTitle sub="Achievements">Certifications & Leadership</SectionTitle></Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
              <Reveal delay={0.1}>
                <div className="glass-card" style={{ ...glassGlow, padding: isMobile ? 24 : 36 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaAward style={{ color: '#f59e0b' }} size={16} />
                    </div>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: 15 }}>Certification</span>
                  </div>
                  <div style={{ borderLeft: '2px solid rgba(0,212,255,0.4)', paddingLeft: 20 }}>
                    <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', marginBottom: 12 }}>Elite · 75%</span>
                    <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 6 }}>Data Structures & Algorithms using Java</h4>
                    <p style={{ color: '#06b6d4', fontSize: 13, marginBottom: 4 }}>NPTEL – IIT Kharagpur</p>
                    <p style={{ color: '#4b5563', fontSize: 12, marginBottom: 10 }}>July – October 2025</p>
                    <p style={{ color: '#374151', fontSize: 11, fontFamily: 'monospace' }}>ID: NPTEL25CS148S1072700380</p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="glass-card" style={{ ...glass, padding: isMobile ? 24 : 36 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaHeart style={{ color: '#ec4899' }} size={15} />
                    </div>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: 15 }}>Leadership</span>
                  </div>
                  <div style={{ borderLeft: '2px solid rgba(236,72,153,0.4)', paddingLeft: 20 }}>
                    <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 4 }}>Organizer — IEEE Women in Engineering (WIE)</h4>
                    <p style={{ color: '#06b6d4', fontSize: 13, marginBottom: 2 }}>Osmania University</p>
                    <p style={{ color: '#4b5563', fontSize: 12, marginBottom: 16 }}>April 2025 – Present</p>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { Icon: FaRegLightbulb, text: 'Led events, workshops & seminars to empower women in tech' },
                        { Icon: FaUsers, text: 'Collaborated with faculty to expand outreach initiatives' },
                        { Icon: FaRocket, text: 'Organised programmes reaching 300+ students in STEM' },
                      ].map(({ Icon, text }, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: '#9ca3af', fontSize: 13 }}>
                          <Icon style={{ color: '#ec4899', flexShrink: 0, marginTop: 2 }} size={12} />{text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══ CONTACT ════════════════════════════════════════════════ */}
        <section id="contact" style={{ padding: isMobile ? '72px 20px' : '112px 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <Reveal><SectionTitle sub="Get In Touch">Let's Connect</SectionTitle></Reveal>
            <Reveal delay={0.1}>
              <div className="glass-card" style={{ ...glassGlow, padding: isMobile ? 28 : 48 }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <p style={{ color: '#9ca3af', fontSize: isMobile ? 14 : 15, lineHeight: 1.8, marginBottom: 16 }}>
                    Open to internships, full-time roles, and interesting collaborations. Drop me a message and I'll get back within 24 hours.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <a href="mailto:saniyakousar013@gmail.com" style={{ color: '#00d4ff', fontSize: 13, textDecoration: 'none' }}>saniyakousar013@gmail.com</a>
                    <span style={{ color: '#1f2937' }}>·</span>
                    <span style={{ color: '#4b5563', fontSize: 13 }}>+91 9059447996</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Name</label>
                      <input 
                        type="text" 
                        name="from_name" 
                        required 
                        placeholder="Your name"
                        value={formData.from_name}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Email</label>
                      <input 
                        type="email" 
                        name="from_email" 
                        required 
                        placeholder="your@email.com"
                        value={formData.from_email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 10, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Message</label>
                    <textarea 
                      name="message" 
                      required 
                      rows={5} 
                      placeholder="What's on your mind?" 
                      style={{ resize: 'none' }}
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>
                  
                  {status.message && (
                    <div style={{
                      marginBottom: 16,
                      padding: '12px',
                      borderRadius: 8,
                      background: status.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${status.type === 'success' ? '#22c55e' : '#ef4444'}`,
                      color: status.type === 'success' ? '#22c55e' : '#ef4444',
                      fontSize: 13,
                      textAlign: 'center'
                    }}>
                      {status.message}
                    </div>
                  )}
                  
                  <motion.button 
                    type="submit" 
                    disabled={sending}
                    whileHover={{ scale: sending ? 1 : 1.02 }} 
                    whileTap={{ scale: sending ? 1 : 0.98 }}
                    style={{
                      width: '100%', padding: '14px 0', borderRadius: 14,
                      fontWeight: 600, fontSize: 14, color: '#fff',
                      background: sending 
                        ? 'linear-gradient(135deg, rgba(100,100,100,0.3), rgba(80,80,80,0.2))'
                        : 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(6,182,212,0.15))',
                      border: '1px solid rgba(0,212,255,0.4)',
                      boxShadow: '0 0 30px rgba(0,212,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      fontFamily: "'DM Sans', sans-serif",
                      cursor: sending ? 'not-allowed' : 'pointer',
                      opacity: sending ? 0.7 : 1,
                    }}
                  >
                    {sending ? (
                      <>
                        <span className="spinner" style={{
                          width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                          borderTop: '2px solid #00d4ff', borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite'
                        }} />
                        Sending...
                      </>
                    ) : (
                      <>Send Message <FaArrowRight size={13} /></>
                    )}
                  </motion.button>
                </form>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────── */}
        <footer style={{ padding: '28px 24px', textAlign: 'center', borderTop: '1px solid rgba(0,212,255,0.06)', position: 'relative', zIndex: 10 }}>
          <p style={{ color: '#1f2937', fontSize: 12 }}>Built with ❤️ by <span style={{ color: '#0e7490' }}>Saniya Kousar</span> · 2025</p>
        </footer>

      </div>
    </>
  )
}