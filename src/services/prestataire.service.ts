import { apiClient } from './api'

// ── Types ──────────────────────────────────────────────────────────────────

export interface Dossier {
  id: string
  reference: string
  titre: string | null
  statut: string
}

export interface Affectation {
  id: string
  dossier: Dossier
  type_role: 'retranscripteur' | 'correcteur'
  statut: 'en_cours' | 'livre' | 'valide' | 'rejete'
  date_attribution: string | null
  date_limite_rendu: string | null
  date_rendu_effectif: string | null
}

export interface Fichier {
  id: string
  dossier_id: string
  uploaded_by_id: string
  type_document: string
  nom_fichier: string
  url_onedrive: string | null
  version: string
  statut: string
  commentaire: string | null
  created_at: string
}

// ── Affectations ───────────────────────────────────────────────────────────

export const affectationsService = {
  mesAffectations(): Promise<Affectation[]> {
    return apiClient.get('/affectations/mes-affectations').then((r) => r.data)
  },

  marquerLivre(id: string): Promise<Affectation> {
    return apiClient.patch(`/affectations/${id}`, { statut: 'livre' }).then((r) => r.data)
  },
}

// ── Fichiers ───────────────────────────────────────────────────────────────

export const fichiersService = {
  list(dossierId: string): Promise<Fichier[]> {
    return apiClient.get(`/dossiers/${dossierId}/fichiers`).then((r) => r.data)
  },

  async upload(
    dossierId: string,
    file: File,
    commentaire: string,
    onProgress?: (pct: number) => void
  ): Promise<Fichier> {
    const form = new FormData()
    form.append('file', file)
    form.append('commentaire', commentaire)
    const res = await apiClient.post<Fichier>(`/dossiers/${dossierId}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
      },
    })
    return res.data
  },

  downloadUrl(fichierId: string): string {
    const base = import.meta.env.VITE_API_URL ?? 'https://backend-production-xxxx.up.railway.app/api/v1'
    return `${base}/fichiers/${fichierId}/download`
  },
}
