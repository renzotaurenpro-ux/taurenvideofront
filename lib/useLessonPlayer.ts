'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { lessonPlaybackKey } from './bunnyLessons'
import { resolveLessonPlayback } from './lessonPlayback'

type GetFile = (mi: number, vi: number) => string | undefined

export function useLessonPlayer(
  paid: boolean,
  bunnyMap: Record<string, string>,
  getFile: GetFile,
) {
  const [activeModulo, setActiveModulo] = useState(0)
  const [activeVideoIdx, setActiveVideoIdx] = useState(0)
  const [openModuloIdx, setOpenModuloIdx] = useState(0)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoMime, setVideoMime] = useState('video/mp4')
  const [playerKey, setPlayerKey] = useState('init')
  const [buffering, setBuffering] = useState(false)
  const [isPending, startTransition] = useTransition()
  const readyRef = useRef(false)

  const hasPlayback = useCallback((mi: number, vi: number) => {
    const key = lessonPlaybackKey(mi, vi)
    return Boolean(bunnyMap[key] || getFile(mi, vi))
  }, [bunnyMap, getFile])

  const applyLesson = useCallback((mi: number, vi: number) => {
    const pb = resolveLessonPlayback(mi, vi, bunnyMap, getFile)
    setVideoMime(pb.mime)
    setVideoUrl(pb.url)
    setPlayerKey(pb.key)
    setBuffering(Boolean(pb.url))
  }, [bunnyMap, getFile])

  useEffect(() => {
    if (!paid) {
      readyRef.current = false
      setVideoUrl('')
      setPlayerKey('init')
      return
    }
    if (!readyRef.current) {
      readyRef.current = true
      setOpenModuloIdx(0)
      setActiveModulo(0)
      setActiveVideoIdx(0)
    }
    applyLesson(activeModulo, activeVideoIdx)
  }, [paid, bunnyMap, activeModulo, activeVideoIdx, applyLesson])

  const selectLesson = useCallback((mi: number, vi: number) => {
    if (!paid || !hasPlayback(mi, vi)) return
    setBuffering(true)
    startTransition(() => {
      setActiveModulo(mi)
      setActiveVideoIdx(vi)
      setOpenModuloIdx(mi)
    })
    applyLesson(mi, vi)
  }, [paid, hasPlayback, applyLesson])

  const onVideoError = useCallback(() => setBuffering(false), [])
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
    hasPlayback,
    onVideoError,
    onPlayerReady,
    buffering: buffering || isPending,
  }
}
