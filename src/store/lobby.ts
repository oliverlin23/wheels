import { create } from 'zustand'
import type { LobbyPlayer, RoomPhase } from '../network/protocol'

interface LobbyStore {
  roomId: string | null
  myPlayer: 0 | 1 | 'spectator' | null
  players: LobbyPlayer[]
  spectatorCount: number
  phase: RoomPhase
  setRoomId: (id: string | null) => void
  setMyPlayer: (p: 0 | 1 | 'spectator') => void
  setLobbyState: (players: LobbyPlayer[], spectators: number, phase: RoomPhase) => void
  reset: () => void
}

export const useLobbyStore = create<LobbyStore>((set) => ({
  roomId: null,
  myPlayer: null,
  players: [],
  spectatorCount: 0,
  phase: 'lobby',
  setRoomId: (roomId) => set({ roomId }),
  setMyPlayer: (myPlayer) => set({ myPlayer }),
  setLobbyState: (players, spectatorCount, phase) => set({ players, spectatorCount, phase }),
  reset: () => set({ roomId: null, myPlayer: null, players: [], spectatorCount: 0, phase: 'lobby' }),
}))
