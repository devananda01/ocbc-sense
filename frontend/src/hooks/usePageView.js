import { useEffect } from 'react'
import { useJourney } from '../context/JourneyContext'
import { logEvent } from '../api/client'

export default function usePageView(pageId) {
  const { sessionId } = useJourney()
  useEffect(() => {
    if (sessionId) logEvent(sessionId, pageId, 'page_view')
  }, [sessionId, pageId])
}