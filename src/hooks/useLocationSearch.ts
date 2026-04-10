import { useEffect, useState } from 'react'

export function useLocationSearch(): string {
  const [search, setSearch] = useState(() => window.location.search)
  useEffect(() => {
    const sync = () => setSearch(window.location.search)
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])
  return search
}
