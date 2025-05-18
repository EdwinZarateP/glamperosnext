// src/hooks/useFavorito.ts
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export function useFavorito(usuarioId: string | undefined, glampingId: string) {
  const [esFavorito, setEsFavorito] = useState<boolean>(false);
  const [loading, setLoading]       = useState<boolean>(true);

  // Fetch inicial
  useEffect(() => {
    if (!usuarioId) {
      setLoading(false);
      return;
    }
    axios.get('/favoritos/buscar', { params: { usuario_id: usuarioId, glamping_id: glampingId } })
      .then(res => setEsFavorito(res.data.favorito_existe))
      .catch(() => {/* opcional: mostrar error */})
      .finally(() => setLoading(false));
  }, [usuarioId, glampingId]);

  // Toggle con optimistic update
  const toggleFavorito = useCallback(async () => {
    if (!usuarioId) throw new Error('Usuario no autenticado');
    const nuevoEstado = !esFavorito;
    setEsFavorito(nuevoEstado);

    try {
      if (nuevoEstado) {
        await axios.post('/favoritos/', { usuario_id: usuarioId, glamping_id: glampingId });
      } else {
        await axios.delete('/favoritos/', { params: { usuario_id: usuarioId, glamping_id: glampingId } });
      }
    } catch (err) {
      // Revertir en caso de error
      setEsFavorito(!nuevoEstado);
      console.error('Error actualizando favorito', err);
      throw err;
    }
  }, [usuarioId, glampingId, esFavorito]);

  return { esFavorito, loading, toggleFavorito };
}
