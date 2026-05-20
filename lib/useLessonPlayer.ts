'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { resolveLessonPlayback } from './lessonPlayback'

type GetFile = (mi: number, vi: number) => string | undefined

export function useLessonPlayer(paid: boolean, _backendVideoId: string | null, getFile: GetFile) {
  const [activeModulo, setActiveModulo] = useState(0)
  const [activeVideoIdx, setActiveVideoIdx] = useState(0)
  const [openModuloIdx, setOpenModuloIdx] = useState(0)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoMime, setVideoMime] = useState('video/mp4')
  const [playerKey, setPlayerKey] = useState('init')
  const [buffering, setBuffering] = useState(false)
  const initializedRef = useRef(false)

  const applyLesson = useCallback((mi: number, vi: number) => {
    const pb = resolveLessonPlayback(mi, vi, getFile)
    setVideoMime(pb.mime)
    setVideoUrl(pb.url)
    setPlayerKey(pb.key)
    setBuffering(true)
  }, [getFile])

  useEffect(() => {
    if (!paid || initializedRef.current) return
    initializedRef.current = true
    applyLesson(0, 0)
  }, [paid, applyLesson])

  useEffect(() => {
    if (!paid) {
      initializedRef.current = false
      setVideoUrl('')
      setPlayerKey('init')
    }
  }, [paid])

  const selectLesson = useCallback((mi: number, vi: number) => {
    if (!paid) return
    setActiveModulo(mi)
    setActiveVideoIdx(vi)
    setOpenModuloIdx(mi)
    applyLesson(mi, vi)
  }, [paid, applyLesson])

  const onVideoError = useCallback(() => {
    setBuffering(false)
  }, [])

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
    buffering,
  }
}
