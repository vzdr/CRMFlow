'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export interface Transcript {
  text: string
  isFinal: boolean
  timestamp: number
}

export interface LiveSessionOptions {
  onTranscript?: (transcript: Transcript) => void
  onError?: (error: Error) => void
  sampleRate?: number
  chunkDuration?: number // milliseconds
  useWebRTC?: boolean
}

export function useLiveSession(options: LiveSessionOptions = {}) {
  const {
    onTranscript,
    onError,
    sampleRate = 16000,
    chunkDuration = 1000,
    useWebRTC = true,
  } = options

  const [isActive, setIsActive] = useState(false)
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const eventSourceRef = useRef<EventSource | null>(null)

  // Start live session
  const startSession = useCallback(async () => {
    try {
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)

      // Initialize session on server
      const initResponse = await fetch('/api/audio/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: newSessionId,
          action: 'start',
        }),
      })

      if (!initResponse.ok) {
        throw new Error('Failed to initialize session')
      }

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)

          // Convert to base64 and send to server
          const reader = new FileReader()
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1]

            try {
              const response = await fetch('/api/audio/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId: newSessionId,
                  action: 'chunk',
                  audioData: base64,
                }),
              })

              if (response.ok) {
                const result = await response.json()
                if (result.data?.transcript) {
                  const transcript = result.data.transcript
                  setTranscripts((prev) => [...prev, transcript])
                  onTranscript?.(transcript)
                }
              }
            } catch (error) {
              console.error('Failed to send audio chunk:', error)
              onError?.(error as Error)
            }
          }
          reader.readAsDataURL(event.data)
        }
      }

      // Start recording in chunks
      mediaRecorder.start(chunkDuration)
      setIsActive(true)

      // Set up SSE for transcript streaming
      if (useWebRTC) {
        const eventSource = new EventSource(`/api/audio/stream?sessionId=${newSessionId}`)
        eventSourceRef.current = eventSource

        eventSource.onmessage = (event) => {
          try {
            const transcript: Transcript = JSON.parse(event.data)
            setTranscripts((prev) => [...prev, transcript])
            onTranscript?.(transcript)
          } catch (error) {
            console.error('Failed to parse transcript:', error)
          }
        }

        eventSource.onerror = (error) => {
          console.error('EventSource error:', error)
          eventSource.close()
        }
      }
    } catch (error) {
      console.error('Failed to start session:', error)
      onError?.(error as Error)
      setIsActive(false)
    }
  }, [sampleRate, chunkDuration, useWebRTC, onTranscript, onError])

  // Stop live session
  const stopSession = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    if (sessionId) {
      try {
        await fetch('/api/audio/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            action: 'end',
          }),
        })
      } catch (error) {
        console.error('Failed to end session:', error)
      }
    }

    setIsActive(false)
    setSessionId(null)
    audioChunksRef.current = []
  }, [sessionId])

  // Fallback: Upload audio file in chunks
  const uploadAudioFile = useCallback(
    async (file: File) => {
      const newSessionId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)

      const chunkSize = 1024 * 1024 // 1MB chunks
      const totalChunks = Math.ceil(file.size / chunkSize)

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize
        const end = Math.min(start + chunkSize, file.size)
        const chunk = file.slice(start, end)

        const formData = new FormData()
        formData.append('audio', chunk)
        formData.append('chunkIndex', i.toString())
        formData.append('totalChunks', totalChunks.toString())
        formData.append('sessionId', newSessionId)

        try {
          const response = await fetch('/api/audio/upload', {
            method: 'POST',
            body: formData,
          })

          if (response.ok) {
            const result = await response.json()
            if (result.data?.transcript) {
              const transcript: Transcript = {
                ...result.data.transcript,
                isFinal: i === totalChunks - 1,
              }
              setTranscripts((prev) => [...prev, transcript])
              onTranscript?.(transcript)
            }
          }
        } catch (error) {
          console.error('Failed to upload chunk:', error)
          onError?.(error as Error)
        }
      }

      setSessionId(null)
    },
    [onTranscript, onError]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActive) {
        stopSession()
      }
    }
  }, [isActive, stopSession])

  return {
    isActive,
    sessionId,
    transcripts,
    startSession,
    stopSession,
    uploadAudioFile,
  }
}
