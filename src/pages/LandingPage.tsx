import { useEffect, useRef, useState } from 'react'
import './LandingPage.css'

// ── Reveal on scroll ────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

// ── Counter animation ───────────────────────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const { ref, visible } = useReveal()
  useEffect(() => {
    if (!visible) return
    const duration = 1400
    const step = target / (duration / 16)
    let cur = 0
    const t = setInterval(() => {
      cur = Math.min(cur + step, target)
      setVal(Math.floor(cur))
      if (cur >= target) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [visible, target])
  return <span ref={ref}>{val}{suffix}</span>
}

// ── Reveal wrapper ──────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, direction = 'up' }: {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'left' | 'right'
}) {
  const { ref, visible } = useReveal()
  const base: React.CSSProperties = {
    transition: `opacity .7s ${delay}s, transform .7s ${delay}s`,
    opacity: visible ? 1 : 0,
    transform: visible
      ? 'none'
      : direction === 'left'
      ? 'translateX(-30px)'
      : direction === 'right'
      ? 'translateX(30px)'
      : 'translateY(28px)',
  }
  return <div ref={ref} style={base}>{children}</div>
}

// ── Icons (inline SVG helpers) ──────────────────────────────────────────────
const Icon = ({ path, size = 24 }: { path: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
)

// ── Contact form ────────────────────────────────────────────────────────────
function ContactForm() {
  const [sent, setSent] = useState(false)
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }
  if (sent) return (
    <div style={{
      background: 'white', borderRadius: 4, padding: '3rem 2rem',
      textAlign: 'center', boxShadow: '0 4px 40px rgba(0,0,0,.06)',
    }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
      <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.8rem', marginBottom: '.5rem' }}>
        Demande envoyée !
      </h3>
      <p style={{ color: 'var(--muted)', fontSize: '.92rem' }}>
        Mme Kpodar Muriel vous recontactera dans les meilleurs délais.
      </p>
    </div>
  )
  return (
    <div style={{ background: 'white', borderRadius: 4, padding: '2.5rem', boxShadow: '0 4px 40px rgba(0,0,0,.06)' }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.55rem', fontWeight: 600, marginBottom: '1.8rem', color: 'var(--navy)' }}>
        Demande de devis ou de renseignements
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="fg-row">
          <div className="fg">
            <label htmlFor="prenom">Prénom</label>
            <input id="prenom" type="text" placeholder="Marie" required />
          </div>
          <div className="fg">
            <label htmlFor="nom">Nom</label>
            <input id="nom" type="text" placeholder="Dupont" required />
          </div>
        </div>
        <div className="fg">
          <label htmlFor="email">Email professionnel</label>
          <input id="email" type="email" placeholder="m.dupont@entreprise.fr" required />
        </div>
        <div className="fg">
          <label htmlFor="tel">Téléphone</label>
          <input id="tel" type="tel" placeholder="06 XX XX XX XX" />
        </div>
        <div className="fg">
          <label htmlFor="structure">Type de structure</label>
          <select id="structure">
            <option value="">— Sélectionnez —</option>
            <option>Comité d'Entreprise (CE)</option>
            <option>CHSCT / CSSCT</option>
            <option>Entreprise / PME</option>
            <option>Association</option>
            <option>Autre</option>
          </select>
        </div>
        <div className="fg-row">
          <div className="fg">
            <label htmlFor="duree">Durée du fichier son</label>
            <select id="duree">
              <option value="">— Sélectionnez —</option>
              <option>Moins d'1 heure</option>
              <option>1 à 2 heures</option>
              <option>2 à 4 heures</option>
              <option>Plus de 4 heures</option>
              <option>Non définie</option>
            </select>
          </div>
          <div className="fg">
            <label htmlFor="pages">Nombre de pages estimé</label>
            <select id="pages">
              <option value="">— Sélectionnez —</option>
              <option>1 – 9 pages</option>
              <option>10 – 20 pages</option>
              <option>21 – 40 pages</option>
              <option>41 – 60 pages</option>
              <option>61 – 80 pages</option>
              <option>81 – 100 pages</option>
              <option>Non défini</option>
            </select>
          </div>
        </div>
        <div className="fg">
          <label htmlFor="message">Votre message</label>
          <textarea id="message" placeholder="Décrivez votre besoin, le contexte de la réunion, les délais souhaités…" />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '.95rem', fontSize: '.9rem' }}>
          Envoyer ma demande →
        </button>
      </form>
    </div>
  )
}

// ── Main landing page ───────────────────────────────────────────────────────
export function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50)
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100
      setProgress(Math.min(pct, 100))
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="landing">
      {/* Progress bar */}
      <div className="lp-progress" style={{ width: `${progress}%` }} />

      {/* ── NAV ── */}
      <nav className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
        <a href="#" className="lp-logo">
          A2C <sup>retranscription</sup>
        </a>
        <ul className="lp-nav-links">
          <li><a href="#methode">Méthode</a></li>
          <li><a href="#tarifs">Tarifs</a></li>
          <li><a href="#engagements">Engagements</a></li>
          <li><a href="#references">Références</a></li>
          <li><a href="#contact" className="lp-nav-cta">Nous contacter</a></li>
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero" id="accueil">
        <div className="lp-hero-dots" />
        <div className="lp-hero-orb" />
        <div className="lp-hero-content">
          <div className="lp-hero-tag">8 ans d'expérience en retranscription professionnelle</div>
          <h1 className="lp-hero-title">
            La parole captée<span className="dot">.</span><br />
            Le mot <em>juste</em><span className="dot">.</span><br />
            La trace fidèle<span className="dot">.</span>
          </h1>
          <p className="lp-hero-sub">
            A2C assure la retranscription professionnelle de vos réunions de CE, CHSCT et assemblées — avec rigueur, confidentialité absolue et dans les délais convenus.
          </p>
          <div className="lp-hero-pills">
            {['Délais garantis', 'Confidentialité totale', 'Relecture comparative', 'Times/Comic 12 · Interligne 1,5'].map((p) => (
              <div key={p} className="lp-pill">{p}</div>
            ))}
          </div>
          <a href="#contact" className="btn btn-primary lp-hero-cta">
            Faire une demande →
          </a>
        </div>
        <div className="lp-hero-stats">
          <div className="lp-hstat">
            <div className="lp-hstat-n"><Counter target={8} suffix=" ans" /></div>
            <div className="lp-hstat-l">d'expérience</div>
          </div>
          <div className="lp-hstat">
            <div className="lp-hstat-n"><Counter target={5} suffix="+" /></div>
            <div className="lp-hstat-l">entreprises clientes</div>
          </div>
        </div>
      </section>

      {/* ── MÉTHODE ── */}
      <section id="methode" className="lp-section lp-bg-white">
        <div className="lp-container">
          <Reveal>
            <span className="lp-tag">Notre méthode</span>
            <h2 className="lp-title">Comment se déroule <em>une mission ?</em></h2>
          </Reveal>
          <div className="lp-steps">
            {[
              { n: '1', t: 'Réception du dossier', d: 'Vous transmettez le fichier son et, si disponible, la prise de notes de séance. Les deux supports se complètent pour une retranscription optimale.' },
              { n: '2', t: 'Attribution & retranscription', d: 'Votre dossier est traité sous convention de confidentialité. Le document est rendu en Times 12 ou Comic 12, pages numérotées, interligne 1,5, au format Word.' },
              { n: '3', t: 'Relecture & correction', d: 'En cas de corrections importantes, vous recevez le fichier corrigé et sa version comparative pour une transparence totale.' },
              { n: '4', t: 'Livraison & facturation', d: 'Le document final vous est remis dans les délais convenus. La facture est émise le lendemain de la réception du PV. Règlement par chèque ou virement.' },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="lp-step">
                  <div className="lp-step-num">{s.n}</div>
                  <h3 className="lp-step-title">{s.t}</h3>
                  <p className="lp-step-desc">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TARIFS ── */}
      <section id="tarifs" className="lp-section lp-bg-paper">
        <div className="lp-container">
          <Reveal>
            <span className="lp-tag">Grille tarifaire</span>
            <h2 className="lp-title">Des tarifs <em>clairs</em> et transparents</h2>
            <p className="lp-subtitle">Format livré : Times 12 ou Comic 12, pages numérotées, interligne 1,5. Tarification forfaitaire par tranche de pages.</p>
          </Reveal>

          <div className="lp-tarif-grid">
            {/* Pages */}
            <Reveal delay={0.08}>
              <div className="lp-card">
                <div className="lp-card-head">
                  <Icon path="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />
                  <div>
                    <div className="lp-card-title">Tarification au nombre de pages</div>
                    <div className="lp-card-sub">Forfait tout compris</div>
                  </div>
                </div>
                <div className="lp-card-body">
                  <div style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.6rem', color: 'var(--navy)' }}>
                    Avec prise de notes en séance <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(+ 20 € / heure)</span>
                  </div>
                  <table className="lp-table" style={{ marginBottom: '1.4rem' }}>
                    <thead><tr><th>Pages</th><th>Forfait</th></tr></thead>
                    <tbody>
                      {[
                        ['20 – 40 pages',  '400 €'],
                        ['41 – 60 pages',  '600 €'],
                        ['61 – 80 pages',  '700 €'],
                        ['81 – 100 pages', '800 €'],
                      ].map(([v, p]) => (
                        <tr key={v}><td>{v}</td><td>{p}</td></tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.6rem', color: 'var(--navy)' }}>
                    Sans prise de notes en séance
                  </div>
                  <table className="lp-table">
                    <thead><tr><th>Pages</th><th>Forfait</th></tr></thead>
                    <tbody>
                      {[
                        ['20 – 40 pages', '400 €'],
                        ['41 – 60 pages', '550 €'],
                        ['61 – 80 pages', '750 €'],
                      ].map(([v, p]) => (
                        <tr key={v}><td>{v}</td><td>{p}</td></tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ marginTop: '1.2rem', padding: '.8rem 1rem', background: 'rgba(0,0,0,.03)', borderRadius: 4, fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--navy)' }}>Retranscription retravaillée (avec synthèse) :</strong> forfait ci-dessus + 50 à 100 € selon le volume de pages.
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Délais + Règlement */}
            <div className="lp-tarif-right">
              <Reveal delay={0.18}>
                <div className="lp-card">
                  <div className="lp-card-head">
                    <Icon path="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2" />
                    <div>
                      <div className="lp-card-title">Délais de livraison</div>
                      <div className="lp-card-sub">À réception du fichier son</div>
                    </div>
                  </div>
                  <div className="lp-card-body">
                    {[
                      ['Fichier standard',   '2 semaines'],
                      ['Fichier de 4 heures', '3 semaines'],
                    ].map(([d, b]) => (
                      <div key={d} className="lp-delai-row">
                        <span className="lp-delai-dur">{d}</span>
                        <span className="lp-delai-badge">{b}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: '1rem', fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                      Délai décompté à partir du lendemain de la remise du fichier son. PV livré au format Word.
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.28}>
                <div className="lp-card" style={{ marginTop: '1.5rem' }}>
                  <div className="lp-card-head">
                    <Icon path="M1 4h22v16a2 2 0 01-2 2H3a2 2 0 01-2-2V4z M1 10h22" />
                    <div>
                      <div className="lp-card-title">Conditions de règlement</div>
                      <div className="lp-card-sub">Selon votre structure</div>
                    </div>
                  </div>
                  <div className="lp-card-body">
                    {[
                      { tag: 'Chèque',   text: 'Règlement par chèque à l\'ordre de l\'Association Deuxième Chance.' },
                      { tag: 'Virement', text: 'Règlement par virement bancaire.' },
                    ].map(({ tag, text }) => (
                      <div key={tag} className="lp-reg-row">
                        <span className="lp-reg-tag">{tag}</span>
                        <span className="lp-reg-text">{text}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: '1rem', fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                      La facture est émise le lendemain de la réception du PV.
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── ENGAGEMENTS ── */}
      <section id="engagements" className="lp-section lp-bg-dark">
        <div className="lp-eng-dots" />
        <div className="lp-container" style={{ position: 'relative', zIndex: 1 }}>
          <Reveal>
            <span className="lp-tag" style={{ color: 'var(--accent)' }}>Ce qui nous distingue</span>
            <h2 className="lp-title" style={{ color: 'white' }}>Nos <em>engagements</em> envers vous</h2>
          </Reveal>
          <div className="lp-eng-grid">
            {[
              { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', t: 'Confidentialité absolue', d: 'Chaque retranscripteur signe une convention de confidentialité. Ce qui se dit en réunion reste strictement protégé.' },
              { icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2', t: 'Délais contractuels', d: '7, 18 ou 25 jours selon la durée du fichier — un engagement ferme, pas une estimation.' },
              { icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z', t: 'Relecture comparative', d: 'En cas de corrections importantes, vous recevez les deux versions pour une transparence totale.' },
              { icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z', t: 'Interlocutrice dédiée', d: 'Mme Kpodar Muriel suit personnellement chaque dossier. Un seul contact, une relation durable.' },
              { icon: 'M9 12l2 2 4-4 M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', t: 'Convention systématique', d: 'Un cadre contractuel est établi avec chaque retranscripteur pour garantir qualité et responsabilités.' },
              { icon: 'M22 12h-4l-3 9L9 3l-3 9H2', t: '8 ans d\'expertise', d: 'Au service d\'entreprises et d\'institutions telles que le GEMAG, la CAF et EDF pour leurs réunions de CE, CHSCT, CSP et conseils de discipline.' },
            ].map((e, i) => (
              <Reveal key={e.t} delay={i * 0.07}>
                <div className="lp-eng-card">
                  <div className="lp-eng-icon"><Icon path={e.icon} size={38} /></div>
                  <div className="lp-eng-title">{e.t}</div>
                  <div className="lp-eng-desc">{e.d}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── RÉFÉRENCES ── */}
      <section id="references" className="lp-section lp-bg-white">
        <div className="lp-container">
          <Reveal>
            <span className="lp-tag">Ils nous font confiance</span>
            <h2 className="lp-title">Paroles de <em>clients</em></h2>
          </Reveal>
          <div className="lp-ref-grid">
            {[
              { t: 'Sérieux, rigueur et respect des délais. Les comptes rendus de nos réunions de CE sont toujours impeccables.', a: 'Secrétaire de CE', r: 'Grande entreprise industrielle' },
              { t: 'La confidentialité est notre priorité absolue pour nos séances CHSCT. A2C comprend ces enjeux et les respecte scrupuleusement.', a: 'Président de CHSCT', r: 'Secteur santé' },
              { t: 'Nous travaillons avec A2C depuis plusieurs années. La qualité est constante et Mme Kpodar est toujours réactive et disponible.', a: 'Directeur des relations sociales', r: 'PME nationale' },
              { t: 'Tarifs clairs, délais tenus, document de qualité. On ne peut pas demander mieux pour un prestataire de retranscription.', a: 'Responsable administratif', r: 'Association professionnelle' },
              { t: 'La relecture comparative nous a permis de vérifier la fidélité de la transcription. Un vrai plus que peu de prestataires proposent.', a: 'Élue syndicale', r: "Comité d'entreprise" },
            ].map((ref, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <div className="lp-ref-card">
                  <div className="lp-ref-quote">"</div>
                  <p className="lp-ref-text">{ref.t}</p>
                  <div className="lp-ref-author">{ref.a}</div>
                  <div className="lp-ref-role">{ref.r}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="lp-section lp-bg-paper">
        <div className="lp-container">
          <Reveal>
            <span className="lp-tag">Prise de contact</span>
            <h2 className="lp-title">Parlons de <em>votre mission</em></h2>
          </Reveal>
          <div className="lp-contact-grid">
            <Reveal direction="left">
              <p style={{ color: 'var(--muted)', fontSize: '.92rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                Décrivez votre besoin et nous vous revenons rapidement pour convenir ensemble des modalités de la retranscription.
              </p>
              <div className="lp-contact-info">
                {[
                  { icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z', label: 'Dirigeante principale', val: 'Mme Kpodar Muriel' },
                  { icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6', label: 'Email', val: 'contact@a2c-retranscription.fr' },
                  { icon: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.5 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012.41 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.4a16 16 0 006.29 6.29l.77-.77a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z', label: 'Téléphone', val: 'À compléter' },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="lp-ci-row">
                    <Icon path={icon} size={18} />
                    <div>
                      <div className="lp-ci-label">{label}</div>
                      <div className="lp-ci-val">{val}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lp-contact-note">
                <p><strong>Modalités acceptées :</strong> Titre de Travail Simplifié (TTS) ou sur réception de facture. Une convention est établie avant toute mission.</p>
              </div>
            </Reveal>

            <Reveal direction="right">
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <a href="#" className="lp-logo">A2C <sup>retranscription</sup></a>
        <p style={{ fontSize: '.76rem', color: 'rgba(255,255,255,.22)' }}>© 2025 A2C — Tous droits réservés</p>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {['Mentions légales', 'Confidentialité'].map((l) => (
            <a key={l} href="#" style={{ fontSize: '.74rem', color: 'rgba(255,255,255,.28)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
