'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { fetchVideoById, normalizeBunnyUrl } from './videos'
import { probeStaticVideos, resolveLessonPlayback, type PlaybackMode } from './lessonPlayback'

type GetFile = (mi: number, vi: number) => string | undefined

export function useLessonPlayer(paid: boolean, backendVideoId: string | null, getFile: GetFile) {
  const [activeModulo, setActiveModulo] = useState(0)
  const [activeVideoIdx, setActiveVideoIdx] = useState(0)
  const [openModuloIdx, setOpenModuloIdx] = useState(0)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoMime, setVideoMime] = useState('video/mp4')
  const [playerKey, setPlayerKey] = useState('0-0')
  const [buffering, setBuffering] = useState(false)
  const [isPending, startTransition] = useTransition()

  const modeRef = useRef<PlaybackMode>('pending')
  const bunnyRef = useRef('')
  const readyRef = useRef(false)
  const errorKeyRef = useRef('')

  const applyLesson = useCallback((mi: number, vi: number) => {
    const pb = resolveLessonPlayback(mi, vi, modeRef.current, bunnyRef.current, getFile)
    setVideoMime(pb.mime)
    setVideoUrl(pb.url)
    setPlayerKey(pb.key)
  }, [getFile])

  useEffect(() => {
    if (!backendVideoId) return
    fetchVideoById(backendVideoId)
      .then(full => {
        bunnyRef.current = normalizeBunnyUrl(full?.url) ?? full?.url ?? ''
      })
      .catch(() => {})
  }, [backendVideoId])

  useEffect(() => {
    if (!paid) {
      readyRef.current = false
      modeRef.current = 'pending'
      return
    }
    let cancelled = false
    readyRef.current = false
    setBuffering(true)
    ;(async () => {
      const tasks: Promise<void>[] = [
        probeStaticVideos().then(ok => {
          if (!cancelled) modeRef.current = ok ? 'static' : 'embed'
        }),
      ]
      if (backendVideoId) {
        tasks.push(
          fetchVideoById(backendVideoId).then(full => {
            bunnyRef.current = normalizeBunnyUrl(full?.url) ?? full?.url ?? ''
          }),
        )
      }
      await Promise.all(tasks)
      if (cancelled) return
      readyRef.current = true
      setActiveModulo(0)
      setActiveVideoIdx(0)
      setOpenModuloIdx(0)
      applyLesson(0, 0)
    })()
    return () => { cancelled = true }
  }, [paid, backendVideoId, applyLesson])

  const selectLesson = useCallback((mi: number, vi: number) => {
    if (!paid || !readyRef.current) return
    errorKeyRef.current = ''
    setBuffering(true)
    startTransition(() => {
      setActiveModulo(mi)
      setActiveVideoIdx(vi)
      setOpenModuloIdx(mi)
    })
    applyLesson(mi, vi)
  }, [paid, applyLesson])

  const onVideoError = useCallback(() => {
    const tag = `${activeModulo}-${activeVideoIdx}`
    if (errorKeyRef.current === tag || !bunnyRef.current) return
    errorKeyRef.current = tag
    modeRef.current = 'embed'
    setBuffering(true)
    applyLesson(activeModulo, activeVideoIdx)
  }, [activeModulo, activeVideoIdx, applyLesson])

  const onPlayerReady = useCallback(() => setBuffering(false), [])

  return {
    activeModulo,
    activeVideoIdx,
    openModuloIdx,
    setOpenModuloIdx,
    videoUrl,
    videoMime,
    playerKey,
    selectLesson,
    onVideoError,
    onPlayerReady,
    buffering: buffering || isPending,
  }
}
