'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { lessonPlaybackKey } from './bunnyLessons'
import { resolveLessonPlayback } from './lessonPlayback'

type GetFile = (mi: number, vi: number) => string | undefined

function firstPlaybackIndex(bunnyMap: Record<string, string>, getFile: GetFile): { mi: number; vi: number } {
  const keys = Object.keys(bunnyMap)
  if (keys.length > 0) {
    const parsed = keys
      .map(k => {
        const [mi, vi] = k.split('-').map(Number)
        return { mi, vi }
      })
      .filter(x => Number.isFinite(x.mi) && Number.isFinite(x.vi))
      .sort((a, b) => a.mi - b.mi || a.vi - b.vi)
    if (parsed[0]) return parsed[0]
  }
  for (let mi = 0; mi < 8; mi++) {
    for (let vi = 0; vi < 8; vi++) {
      if (getFile(mi, vi)) return { mi, vi }
    }
  }
  return { mi: 0, vi: 0 }
}

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
  const mapSig = Object.keys(bunnyMap).sort().join('|')

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
      const first = firstPlaybackIndex(bunnyMap, getFile)
      setOpenModuloIdx(first.mi)
      setActiveModulo(first.mi)
      setActiveVideoIdx(first.vi)
      applyLesson(first.mi, first.vi)
      return
    }
    applyLesson(activeModulo, activeVideoIdx)
  }, [paid, mapSig, activeModulo, activeVideoIdx, applyLesson, bunnyMap, getFile])

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
