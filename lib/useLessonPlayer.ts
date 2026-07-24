'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { lessonPlaybackKey } from './bunnyLessons'
import { resolveLessonPlayback } from './lessonPlayback'

function firstPlaybackIndex(bunnyMap: Record<string, string>) {
  const parsed = Object.keys(bunnyMap)
    .map(k => {
      const [mi, vi] = k.split('-').map(Number)
      return { mi, vi }
    })
    .filter(x => Number.isFinite(x.mi) && Number.isFinite(x.vi))
    .sort((a, b) => a.mi - b.mi || a.vi - b.vi)
  return parsed[0] ?? { mi: 0, vi: 0 }
}

export function useLessonPlayer(paid: boolean, bunnyMap: Record<string, string>) {
  const [activeModulo, setActiveModulo] = useState(0)
  const [activeVideoIdx, setActiveVideoIdx] = useState(0)
  const [openModuloIdx, setOpenModuloIdx] = useState(0)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoMime, setVideoMime] = useState('video/mp4')
  const [playerKey, setPlayerKey] = useState('init')
  const [buffering, setBuffering] = useState(false)
  const [isPending, startTransition] = useTransition()
  const readyRef = useRef(false)
  const mapSig = Object.keys(bunnyMap).sort().join('|')

  const hasPlayback = useCallback(
    (mi: number, vi: number) => Boolean(bunnyMap[lessonPlaybackKey(mi, vi)]),
    [bunnyMap],
  )

  const applyLesson = useCallback((mi: number, vi: number) => {
    const pb = resolveLessonPlayback(mi, vi, bunnyMap)
    setVideoMime(pb.mime)
    setVideoUrl(pb.url)
    setPlayerKey(pb.key)
    setBuffering(Boolean(pb.url))
  }, [bunnyMap])

  useEffect(() => {
    if (!paid) {
      readyRef.current = false
      setVideoUrl('')
      setPlayerKey('init')
      return
    }
    if (!readyRef.current) {
      readyRef.current = true
      const first = firstPlaybackIndex(bunnyMap)
      setOpenModuloIdx(first.mi)
      setActiveModulo(first.mi)
      setActiveVideoIdx(first.vi)
      applyLesson(first.mi, first.vi)
      return
    }
    applyLesson(activeModulo, activeVideoIdx)
  }, [paid, mapSig, activeModulo, activeVideoIdx, applyLesson, bunnyMap])

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
    onVideoError: () => setBuffering(false),
    onPlayerReady: () => setBuffering(false),
    buffering: buffering || isPending,
  }
}
