import { useCallback, useEffect, useRef, useState } from 'react'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useConnectionState,
  useDataChannel,
  useLocalParticipant,
  useParticipants,
  useTracks,
} from '@livekit/components-react'
import {
  ConnectionState,
  DisconnectReason,
  Track,
  VideoPresets,
  VideoQuality,
} from 'livekit-client'
import '@livekit/components-styles'
import { fetchLiveKitConnection } from './api/liveApi'

const BROADCAST_QUALITY_OPTIONS = {
  SD: {
    capture: { resolution: VideoPresets.h360.resolution, frameRate: 20 },
    publish: {
      simulcast: true,
      videoEncoding: VideoPresets.h360.encoding,
      videoSimulcastLayers: [VideoPresets.h180],
    },
  },
  HD: {
    capture: { resolution: VideoPresets.h720.resolution, frameRate: 30 },
    publish: {
      simulcast: true,
      videoEncoding: VideoPresets.h720.encoding,
      videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360],
    },
  },
  FHD: {
    capture: { resolution: VideoPresets.h1080.resolution, frameRate: 30 },
    publish: {
      simulcast: true,
      videoEncoding: VideoPresets.h1080.encoding,
      videoSimulcastLayers: [VideoPresets.h360, VideoPresets.h720],
    },
  },
}

const VIEWER_QUALITY_OPTIONS = {
  AUTO: VideoQuality.HIGH,
  LOW: VideoQuality.LOW,
  MEDIUM: VideoQuality.MEDIUM,
  HIGH: VideoQuality.HIGH,
}

function LiveVideoSurface({ owner, viewerQuality, onReadyChange }) {
  const cameraTracks = useTracks([Track.Source.Camera])
  const cameraTrack = cameraTracks.find(({ participant }) => (
    owner ? participant.isLocal : !participant.isLocal
  ))

  useEffect(() => {
    if (owner || !cameraTrack?.publication) return
    cameraTrack.publication.setVideoQuality(
      VIEWER_QUALITY_OPTIONS[viewerQuality] ?? VideoQuality.HIGH
    )
  }, [cameraTrack, owner, viewerQuality])

  return (
    <div className="browser-live-player__surface">
      {cameraTrack ? (
        <VideoTrack trackRef={cameraTrack} />
      ) : (
        <div className="browser-live-player__notice">
          <span>{owner ? '카메라 영상을 준비하고 있습니다...' : '방송자의 영상을 기다리고 있습니다...'}</span>
        </div>
      )}
      <RoomAudioRenderer />
      {owner && <PublisherReadyState onReadyChange={onReadyChange} />}
    </div>
  )
}

function PublisherReadyState({ onReadyChange }) {
  const {
    isCameraEnabled,
    isMicrophoneEnabled,
    lastCameraError,
    lastMicrophoneError,
  } = useLocalParticipant()

  useEffect(() => {
    onReadyChange?.(isCameraEnabled && isMicrophoneEnabled)
    return () => onReadyChange?.(false)
  }, [isCameraEnabled, isMicrophoneEnabled, onReadyChange])

  const deviceError = lastCameraError ?? lastMicrophoneError
  if (!deviceError) return null

  return (
    <div className="browser-live-player__warning">
      카메라 또는 마이크를 시작하지 못했습니다. 브라우저 권한과 사용 중인 장치를 확인해 주세요.
    </div>
  )
}

function LocalLivePreview({ owner, broadcastQuality, onReadyChange, onError }) {
  const videoRef = useRef(null)
  const [preparing, setPreparing] = useState(owner)

  useEffect(() => {
    if (!owner) {
      onReadyChange?.(false)
      return undefined
    }

    let mediaStream
    let cancelled = false
    const preset = BROADCAST_QUALITY_OPTIONS[broadcastQuality] ?? BROADCAST_QUALITY_OPTIONS.HD
    navigator.mediaDevices.getUserMedia({
      video: preset.capture,
      audio: true,
    }).then((stream) => {
      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      mediaStream = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setPreparing(false)
      onReadyChange?.(true)
    }).catch(() => {
      setPreparing(false)
      onReadyChange?.(false)
      onError?.('카메라와 마이크 권한 또는 장치 상태를 확인해 주세요.')
    })

    return () => {
      cancelled = true
      mediaStream?.getTracks().forEach((track) => track.stop())
      onReadyChange?.(false)
    }
  }, [broadcastQuality, onError, onReadyChange, owner])

  if (!owner) {
    return (
      <div className="browser-live-player browser-live-player--local">
        <div className="browser-live-player__notice">
          <span>
            현재 LOCAL 미리보기 모드입니다.<br />
            실제 영상 시청은 LIVE_PROVIDER=LIVEKIT으로 전환한 뒤 가능합니다.
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="browser-live-player browser-live-player--local">
      <video ref={videoRef} autoPlay playsInline muted />
      <span className="browser-live-player__local-badge">LOCAL 미리보기</span>
      {preparing && (
        <div className="browser-live-player__notice"><span>카메라와 마이크를 준비하고 있습니다...</span></div>
      )}
    </div>
  )
}

function LiveRoomBridge({
  owner,
  chatEnabled,
  onChatEnabledChange,
  onChatMessage,
  onStreamEnded,
  onChatControllerChange,
  onViewerCountChange,
  onViewerParticipantsChange,
}) {
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()
  const connectionState = useConnectionState()
  const connected = connectionState === ConnectionState.Connected
  const lastViewerSignatureRef = useRef('')

  const handleDataMessage = useCallback((message) => {
    try {
      const data = JSON.parse(new TextDecoder().decode(message.payload))
      if (data.type === 'CHAT_STATE' && !owner) {
        onChatEnabledChange?.(Boolean(data.enabled))
        return
      }
      if (data.type === 'STREAM_ENDED' && !owner) {
        onStreamEnded?.()
        return
      }
      if (data.type === 'DONATION') {
        onChatMessage?.({
          id: data.id,
          text: data.message || '방송을 응원합니다!',
          amount: data.amount,
          donation: true,
          sentAt: data.sentAt,
          senderIdentity: message.from?.identity ?? 'unknown',
          senderName: data.donorName ?? message.from?.name ?? '시청자',
          host: false,
          mine: false,
        })
        return
      }
      if (data.type !== 'CHAT' || !chatEnabled) return

      onChatMessage?.({
        id: data.id,
        text: data.text,
        sentAt: data.sentAt,
        senderIdentity: message.from?.identity ?? 'unknown',
        senderName: message.from?.name ?? '시청자',
        host: data.senderRole === 'HOST' || Boolean(message.from?.identity?.startsWith('host-')),
        mine: false,
      })
    } catch {
      // 다른 기능에서 보낸 데이터 메시지는 채팅에서 무시합니다.
    }
  }, [chatEnabled, onChatEnabledChange, onChatMessage, onStreamEnded, owner])

  const { send, isSending } = useDataChannel('festlog.chat', handleDataMessage)

  useEffect(() => {
    const viewers = participants.filter(
      (participant) => !participant.identity.startsWith('host-')
    )
    const viewerList = viewers.map((participant) => ({
      identity: participant.identity,
      name: participant.name ?? '시청자',
      mine: participant.isLocal,
    })).sort((left, right) => left.name.localeCompare(right.name, 'ko-KR'))
    const viewerSignature = JSON.stringify(viewerList)

    onViewerCountChange?.(viewers.length)
    if (lastViewerSignatureRef.current !== viewerSignature) {
      lastViewerSignatureRef.current = viewerSignature
      onViewerParticipantsChange?.(viewerList)
    }
  }, [onViewerCountChange, onViewerParticipantsChange, participants])

  useEffect(() => {
    if (!owner || !connected) return
    const payload = new TextEncoder().encode(JSON.stringify({
      type: 'CHAT_STATE',
      enabled: chatEnabled,
    }))
    send(payload, { reliable: true }).catch(() => {})
  }, [chatEnabled, connected, owner, send])

  useEffect(() => {
    if (!connected) {
      onChatControllerChange?.(null)
      return undefined
    }

    async function sendChat(text) {
      if (!chatEnabled) throw new Error('방송자가 채팅을 중지했습니다.')

      const chatMessage = {
        type: 'CHAT',
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        text,
        sentAt: new Date().toISOString(),
        senderRole: owner ? 'HOST' : 'VIEWER',
      }
      await send(
        new TextEncoder().encode(JSON.stringify(chatMessage)),
        { reliable: true }
      )
      onChatMessage?.({
        ...chatMessage,
        senderIdentity: localParticipant.identity,
        senderName: localParticipant.name ?? (owner ? '방송자' : '시청자'),
        host: owner,
        mine: true,
      })
    }

    async function notifyStreamEnded() {
      if (!owner) return
      await send(
        new TextEncoder().encode(JSON.stringify({ type: 'STREAM_ENDED' })),
        { reliable: true }
      )
    }

    async function sendDonation(donation) {
      if (owner) return
      const donationMessage = {
        type: 'DONATION',
        id: `donation-${donation.donationId}`,
        donationId: donation.donationId,
        amount: donation.amount,
        message: donation.message,
        donorName: donation.donorNickname,
        sentAt: new Date().toISOString(),
      }
      await send(
        new TextEncoder().encode(JSON.stringify(donationMessage)),
        { reliable: true }
      )
      onChatMessage?.({
        ...donationMessage,
        text: donation.message || '방송을 응원합니다!',
        donation: true,
        senderIdentity: localParticipant.identity,
        senderName: donation.donorNickname ?? localParticipant.name ?? '시청자',
        host: false,
        mine: true,
      })
    }

    onChatControllerChange?.({ sendChat, sendDonation, notifyStreamEnded, isSending })
    return () => onChatControllerChange?.(null)
  }, [chatEnabled, connected, isSending, localParticipant, onChatControllerChange, onChatMessage, owner, send])

  return null
}

export default function BrowserLivePlayer({
  streamId,
  owner,
  status,
  broadcastQuality = 'HD',
  viewerQuality = 'AUTO',
  chatEnabled,
  onReadyChange,
  onError,
  onChatEnabledChange,
  onChatMessage,
  onStreamEnded,
  onChatControllerChange,
  onViewerCountChange,
  onViewerParticipantsChange,
}) {
  const [connection, setConnection] = useState(null)
  const [connecting, setConnecting] = useState(!owner && status === 'LIVE')
  const [connectRequested, setConnectRequested] = useState(false)
  const [connectionAttempt, setConnectionAttempt] = useState(0)
  const [notice, setNotice] = useState(
    owner ? '카메라와 마이크를 시작해 주세요.' : '방송 모드를 확인하는 중입니다...'
  )

  const shouldConnect = connectRequested || (!owner && status === 'LIVE')

  useEffect(() => {
    if (!shouldConnect || connection) return

    let cancelled = false
    fetchLiveKitConnection(streamId)
      .then((result) => {
        if (!cancelled) {
          setConnection(result)
          setNotice(result.provider === 'LOCAL'
            ? '로컬 카메라를 준비하고 있습니다...'
            : 'LiveKit Cloud에 연결하는 중입니다...')
        }
      })
      .catch((connectionError) => {
        if (!cancelled) {
          setNotice(connectionError.message)
          onError?.(connectionError.message)
        }
      })
      .finally(() => {
        if (!cancelled) setConnecting(false)
      })

    return () => { cancelled = true }
  }, [connection, connectionAttempt, onError, shouldConnect, streamId])

  function startCamera() {
    setNotice('방송 모드를 확인하고 있습니다...')
    setConnectRequested(true)
    setConnecting(true)
    setConnectionAttempt((current) => current + 1)
  }

  const handleRoomConnected = useCallback(() => {
    setNotice('')
  }, [])

  const handleRoomDisconnected = useCallback((reason) => {
    onReadyChange?.(false)
    onChatControllerChange?.(null)
    onViewerCountChange?.(0)
    onViewerParticipantsChange?.([])
    setConnection(null)
    setConnectRequested(false)

    if (owner && reason === DisconnectReason.DUPLICATE_IDENTITY) {
      const message = '다른 창에서 이미 동일한 계정으로 방송을 실행 중입니다. 다른 창을 닫은 뒤 다시 연결해 주세요.'
      setNotice(message)
      onError?.(message)
      return
    }

    setNotice(owner ? '방송 연결이 종료되었습니다. 다시 연결해 주세요.' : '방송 연결이 종료되었습니다.')
  }, [onChatControllerChange, onError, onReadyChange, onViewerCountChange, onViewerParticipantsChange, owner])

  const handleRoomError = useCallback((liveKitError) => {
    setNotice(liveKitError.message)
    onError?.(`LiveKit 연결 오류: ${liveKitError.message}`)
  }, [onError])

  const handleMediaDeviceFailure = useCallback(() => {
    const message = '카메라와 마이크 권한 또는 장치 상태를 확인해 주세요.'
    setNotice(message)
    onError?.(message)
  }, [onError])

  if (!connection) {
    return (
      <div className="browser-live-player">
        <div className="browser-live-player__notice"><span>{notice}</span></div>
        {owner && !connectRequested && (
          <button type="button" className="live-button live-button--primary" onClick={startCamera}>
            카메라·마이크 시작
          </button>
        )}
        {owner && connectRequested && !connecting && (
          <button type="button" className="live-button live-button--ghost" onClick={startCamera}>
            다시 연결
          </button>
        )}
      </div>
    )
  }

  if (connection.provider === 'LOCAL') {
    return (
      <LocalLivePreview
        owner={owner}
        broadcastQuality={broadcastQuality}
        onReadyChange={onReadyChange}
        onError={onError}
      />
    )
  }

  const broadcastPreset = BROADCAST_QUALITY_OPTIONS[broadcastQuality] ?? BROADCAST_QUALITY_OPTIONS.HD

  return (
    <LiveKitRoom
      token={connection.token}
      serverUrl={connection.serverUrl}
      connect
      video={owner ? broadcastPreset.capture : false}
      audio={owner}
      options={owner ? {
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: broadcastPreset.publish,
      } : {
        adaptiveStream: true,
      }}
      data-lk-theme="default"
      className="browser-live-player"
      onConnected={handleRoomConnected}
      onDisconnected={handleRoomDisconnected}
      onError={handleRoomError}
      onMediaDeviceFailure={handleMediaDeviceFailure}
    >
      <LiveVideoSurface
        owner={owner}
        viewerQuality={viewerQuality}
        onReadyChange={onReadyChange}
      />
      <LiveRoomBridge
        owner={owner}
        chatEnabled={chatEnabled}
        onChatEnabledChange={onChatEnabledChange}
        onChatMessage={onChatMessage}
        onStreamEnded={onStreamEnded}
        onChatControllerChange={onChatControllerChange}
        onViewerCountChange={onViewerCountChange}
        onViewerParticipantsChange={onViewerParticipantsChange}
      />
    </LiveKitRoom>
  )
}
