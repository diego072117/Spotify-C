import { create } from "zustand";
import { playlists, songs } from "@/lib/data";

const firstPlaylist = playlists[6];
const firstSong = songs.find((song) => song.albumId === firstPlaylist.albumId);

export const usePlayerStore = create((set) => ({
  isPlaying: null,
  currentMusic: { playlist: firstPlaylist, song: firstSong, songs: [] },
  volume: 1,
  setVolume: (volume) => set({ volume }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentMusic: (currentMusic) => set({ currentMusic }),
}));
