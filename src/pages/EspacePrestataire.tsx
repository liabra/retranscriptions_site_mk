import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  affectationsService,
  fichiersService,
  type Affectation,
  type Fichier,
} from '../services/prestataire.service'
import { authService } from '../services/auth.service'
import { getErrorMessage } from '../services/api'

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function isLate(iso: string | null | undefined) {
  if (!iso) return false
  return new Date(iso) < new Date()
}

const STATUT_LABELS: Record<string, string> = {
  en_cours:          'En cours',
  livre:             'Livré',
  valide:            'Validé',
  rejete:            'Rejeté',
  brouillon:         'Brouillon',
  en_retranscription:'En retranscription',
  en_correction:     'En correction',
  livre_client:      'Livré client',
  facture:           'Facturé',
  clos:              'Clos',
}

const ROLE_LABELS: Record<string, string> = {
  retranscripteur: 'Retranscription',
  correcteur:      'Correction',
}

// ── Upload zone ────────────────────────────────────────────────────────────

function UploadZone({
  dossierId,
  onSuccess,
}: {
  dossierId: string
  onSuccess: (f: Fichier) => void
}) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [error, setError]         = useState('')
  const [commentaire, setCommentaire] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const doUpload = useCallback(async (file: File) => {
    setError('')
    setUploading(true)
    setProgress(0)
    try {
      const f = await fichiersService.upload(dossierId, file, commentaire, setProgress)
      onSuccess(f)
      setCommentaire('')
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [dossierId, commentaire, onSuccess])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) doUpload(file)
  }

  return (
    <div style={{ marginTop: 12 }}>
      <input
        type="text" placeholder="Commentaire (optionnel)"
        value={commentaire} onChange={(e) => setCommentaire(e.target.value)}
        disabled={uploading}
        style={{
          width: '100%', padding: '7px 10px', marginBottom: 10,
          border: '1px solid var(--linen)', borderRadius: 4,
          fontSize: 13, fontFamily: 'Outfit, sans-serif',
          background: 'var(--paper)', color: 'var(--ink)',
        }}
      />
      <input
        ref={inputRef} type="file" style={{ display: 'none' }}
        accept=".doc,.docx,.pdf,.odt,.txt,.mp3,.wav,.m4a,.mp4"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) doUpload(f); e.target.value = '' }}
      />
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? 'var(--sky)' : 'var(--linen)'}`,
          borderRadius: 6, padding: '22px 16px', textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: dragOver ? 'var(--light-sky)' : 'var(--paper)',
          transition: 'all .2s',
        }}
      >
        {uploading ? (
          <div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
              Envoi en cours… {progress}%
            </div>
            <div style={{ height: 6, background: 'var(--linen)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'var(--sky)', transition: 'width .2s', borderRadius: 3,
              }} />
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 26, marginBottom: 6 }}>📎</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--sky)' }}>Cliquez pour choisir un fichier</strong>
              {' '}ou glissez-déposez ici
              <br />
              <span style={{ fontSize: 11 }}>.doc .docx .pdf .odt .txt — max 500 Mo</span>
            </div>
          </>
        )}
      </div>
      {error && (
        <div className="alert alert-error" style={{ marginTop: 8 }}>{error}</div>
      )}
    </div>
  )
}

// ── Mission card ───────────────────────────────────────────────────────────

function MissionCard({ aff, onDelivered }: {
  aff: Affectation
  onDelivered: (updated: Affectation) => void
}) {
  const [open, setOpen]           = useState(false)
  const [fichiers, setFichiers]   = useState<Fichier[]>([])
  const [loadingF, setLoadingF]   = useState(false)
  const [loadedOnce, setLoadedOnce] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [delivering, setDelivering] = useState(false)
  const [deliverError, setDeliverError] = useState('')

  async function toggleOpen() {
    setOpen((v) => !v)
    if (!loadedOnce) {
      setLoadingF(true)
      try {
        const fs = await fichiersService.list(aff.dossier.id)
        setFichiers(fs)
        setLoadedOnce(true)
      } finally {
        setLoadingF(false)
      }
    }
  }

  function handleNewFichier(f: Fichier) {
    setFichiers((prev) => [f, ...prev])
    setShowUpload(false)
  }

  async function deliver() {
    if (!confirm('Confirmer la livraison de votre travail sur ce dossier ?')) return
    setDelivering(true)
    setDeliverError('')
    try {
      const updated = await affectationsService.marquerLivre(aff.id)
      onDelivered({ ...aff, ...updated })
    } catch (e) {
      setDeliverError(getErrorMessage(e))
    } finally {
      setDelivering(false)
    }
  }

  const mesFichiers = fichiers.filter(
    (f) => f.type_document === 'retranscription_v1' || f.type_document === 'retranscription_corrigee'
  )
  const audioFichier = fichiers.find((f) => f.type_document === 'audio_brut')
  const late = isLate(aff.date_limite_rendu)

  return (
    <div style={{
      border: '1px solid var(--linen)', borderRadius: 6,
      marginBottom: 12, overflow: 'hidden',
      boxShadow: open ? '0 4px 20px rgba(0,0,0,.06)' : undefined,
      transition: 'box-shadow .2s',
    }}>
      {/* ── Header row ── */}
      <div
        onClick={toggleOpen}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto auto',
          gap: 12, alignItems: 'center',
          padding: '14px 18px', cursor: 'pointer',
          background: open ? 'var(--light-sky)' : 'white',
          transition: 'background .2s',
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--navy)' }}>
            {aff.dossier.reference}
          </div>
          {aff.dossier.titre && (
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{aff.dossier.titre}</div>
          )}
        </div>

        <span className={`badge ${aff.statut === 'livre' || aff.statut === 'valide' ? 'badge-green' : 'badge-blue'}`}>
          {STATUT_LABELS[aff.statut] ?? aff.statut}
        </span>

        <span className="badge badge-gray">
          {ROLE_LABELS[aff.type_role]}
        </span>

        <span style={{
          fontSize: 12, whiteSpace: 'nowrap',
          color: late ? 'var(--danger)' : 'var(--muted)',
          fontWeight: late ? 600 : 400,
        }}>
          {late && '⚠ '}Échéance : {formatDate(aff.date_limite_rendu)}
        </span>

        <span style={{ fontSize: 18, color: 'var(--muted)', userSelect: 'none', paddingLeft: 4 }}>
          {open ? '▲' : '▼'}
        </span>
      </div>

      {/* ── Expanded panel ── */}
      {open && (
        <div style={{ padding: '16px 18px', borderTop: '1px solid var(--linen)', background: 'white' }}>
          {loadingF && (
            <div style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 0' }}>Chargement des fichiers…</div>
          )}

          {/* Fichier audio disponible */}
          {audioFichier && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 6,
              background: 'var(--light-sky)', border: '1px solid var(--linen)',
              marginBottom: 14, fontSize: 13,
            }}>
              <span style={{ fontSize: 22 }}>🎧</span>
              <div style={{ flex: 1 }}>
                <strong>Fichier audio mis à disposition</strong>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{audioFichier.nom_fichier}</div>
              </div>
              <a
                href={fichiersService.downloadUrl(audioFichier.id)}
                download
                className="btn btn-sm btn-secondary"
                style={{ textDecoration: 'none', fontSize: 12 }}
                onClick={(e) => {
                  // Inject auth header via anchor trick — open in new tab instead
                  e.preventDefault()
                  const token = localStorage.getItem('a2c_token')
                  fetch(fichiersService.downloadUrl(audioFichier.id), {
                    headers: { Authorization: `Bearer ${token}` },
                  })
                    .then((r) => r.blob())
                    .then((blob) => {
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url; a.download = audioFichier.nom_fichier; a.click()
                      URL.revokeObjectURL(url)
                    })
                }}
              >
                ⬇ Télécharger
              </a>
            </div>
          )}

          {/* Fichiers déposés */}
          {mesFichiers.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
                Fichiers déposés
              </div>
              {mesFichiers.map((f) => (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 4,
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  marginBottom: 6, fontSize: 13,
                }}>
                  <span>📄</span>
                  <div style={{ flex: 1 }}>
                    <strong>{f.nom_fichier}</strong>
                    <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted)' }}>v{f.version}</span>
                    {f.commentaire && (
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        {f.commentaire}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {formatDate(f.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions (seulement si en cours) */}
          {aff.statut === 'en_cours' && (
            <>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setShowUpload((v) => !v)}
                >
                  {showUpload ? '✕ Annuler' : '⬆ Déposer un fichier'}
                </button>
                {mesFichiers.length > 0 && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={deliver}
                    disabled={delivering}
                  >
                    {delivering ? '…' : '✓ Marquer comme livré'}
                  </button>
                )}
              </div>

              {deliverError && (
                <div className="alert alert-error" style={{ marginTop: 8 }}>{deliverError}</div>
              )}

              {showUpload && (
                <UploadZone dossierId={aff.dossier.id} onSuccess={handleNewFichier} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export function EspacePrestataire() {
  const navigate    = useNavigate()
  const user        = authService.getUser()
  const [affectations, setAffectations] = useState<Affectation[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')

  useEffect(() => {
    affectationsService.mesAffectations()
      .then(setAffectations)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  function handleLogout() {
    authService.logout()
    navigate('/espace-prestataire/login')
  }

  function handleDelivered(updated: Affectation) {
    setAffectations((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)))
  }

  const enCours = affectations.filter((a) => a.statut === 'en_cours')
  const terminees = affectations.filter((a) => a.statut !== 'en_cours' && a.statut !== 'rejete')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      {/* ── Top bar ── */}
      <header style={{
        background: 'var(--navy)', padding: '0 5vw',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60, borderBottom: '2px solid var(--sky)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.3rem', fontWeight: 600, color: 'white',
        }}>
          A2C <span style={{ fontSize: '.6em', color: 'var(--accent)', fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            retranscription
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.55)' }}>
            {user?.nom}
          </span>
          <a href="/" style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>
            ← Site
          </a>
          <button
            onClick={handleLogout}
            className="btn btn-sm"
            style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.15)', fontSize: '.78rem' }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 5vw' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '2rem', fontWeight: 600, color: 'var(--navy)',
          }}>
            Mes missions
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginTop: '.3rem' }}>
            Dossiers qui vous sont affectés — déposez vos fichiers directement ici.
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
            Chargement de vos missions…
          </div>
        ) : affectations.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: 6, padding: '3rem',
            textAlign: 'center', color: 'var(--muted)',
            border: '1px solid var(--linen)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            Aucune mission en cours pour le moment.
          </div>
        ) : (
          <>
            {enCours.length > 0 && (
              <section style={{ marginBottom: '2.5rem' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 14,
                }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--navy)' }}>
                    En cours
                  </h2>
                  <span className="badge badge-blue">{enCours.length}</span>
                </div>
                {enCours.map((aff) => (
                  <MissionCard key={aff.id} aff={aff} onDelivered={handleDelivered} />
                ))}
              </section>
            )}

            {terminees.length > 0 && (
              <section>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 14,
                }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--muted)' }}>
                    Terminées
                  </h2>
                  <span className="badge badge-gray">{terminees.length}</span>
                </div>
                {terminees.map((aff) => (
                  <div key={aff.id} style={{
                    background: 'white', border: '1px solid var(--linen)', borderRadius: 6,
                    padding: '12px 18px', marginBottom: 8, opacity: .65,
                    display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                    gap: 12, alignItems: 'center', fontSize: 13,
                  }}>
                    <div>
                      <strong>{aff.dossier.reference}</strong>
                      {aff.dossier.titre && (
                        <span style={{ marginLeft: 8, color: 'var(--muted)' }}>{aff.dossier.titre}</span>
                      )}
                    </div>
                    <span className="badge badge-gray">{ROLE_LABELS[aff.type_role]}</span>
                    <span className="badge badge-green">{STATUT_LABELS[aff.statut] ?? aff.statut}</span>
                    <span style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(aff.date_rendu_effectif ?? aff.date_attribution)}
                    </span>
                  </div>
                ))}
              </section>
            )}
          </>
        )}

        {/* ── Aide ── */}
        <div style={{
          marginTop: '3rem', padding: '1.5rem',
          background: 'var(--navy)', borderRadius: 6,
          fontSize: '.85rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.75,
        }}>
          <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '.4rem' }}>
            Comment déposer un fichier ?
          </strong>
          Cliquez sur une mission "En cours" pour l'ouvrir → bouton <em>Déposer un fichier</em> →
          choisissez votre document (Word, PDF, ODF…) → ajoutez un commentaire si nécessaire →
          une fois le fichier déposé, cliquez <em>Marquer comme livré</em>.
          Mme Kpodar Muriel recevra une notification automatique.
        </div>
      </main>
    </div>
  )
}
