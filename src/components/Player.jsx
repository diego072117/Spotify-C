import { usePlayerStore } from "@/store/playerStore";
import { useRef, useEffect, useState } from "react";
import { Slider } from "@/components/Slider";
import {
  Pause,
  Play,
  VolumeSilence,
  Volume,
  Next,
  Previous,
} from "@/icons/IconsPlayer";

const VolumeControl = () => {
  const volume = usePlayerStore((state) => state.volume);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const previousVolumeRef = useRef(volume);

  const isVolumeSilenced = volume < 0.1;

  const handleClickVolume = () => {
    if (isVolumeSilenced) {
      setVolume(previousVolumeRef.current);
    } else {
      previousVolumeRef.current = volume;
      setVolume(0);
    }
  };

  return (
    <div className="flex justify-center gap-x-2">
      <button
        className="opacity-70 hover:opacity-100 transition"
        onClick={handleClickVolume}
      >
        {isVolumeSilenced ? <VolumeSilence /> : <Volume />}
      </button>
      <Slider
        defaultValue={[100]}
        max={100}
        min={0}
        className="w-[95px]"
        value={[volume * 100]}
        onValueChange={(value) => {
          const [newVolume] = value;
          const volumeValue = newVolume / 100;
          setVolume(volumeValue);
        }}
      />
    </div>
  );
};

const CurrentSong = ({ title, image, artists }) => {
  return (
    <div className="flex items-center gap-5 relative overflow-hidden">
      <picture className="w-16 h-16 bg-zinc-800 rounded-md shadow-lg overflow-hidden">
        <img src={image} alt={title} />
      </picture>
      <div className="flex flex-col">
        <h3 className="font-semibold text-sm block">{title}</h3>
        <span className="text-xs opacity-80">{artists?.join(", ")}</span>
      </div>
    </div>
  );
};

const SongControl = ({ audio }) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    audio.current.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audio.current.removeEventListener("timeupdate", handleTimeUpdate);
    };
  });

  const handleTimeUpdate = () => {
    setCurrentTime(audio.current.currentTime);
  };

  const formatTime = (time) => {
    if (time == null) return `0:00`;

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const duration = audio?.current?.duration ?? 0;

  return (
    <div className="flex gap-x-3 text-xs pt-2">
      <span className="opacity-50 w-12 text-right">
        {formatTime(currentTime)}
      </span>
      <Slider
        defaultValue={[0]}
        value={[currentTime]}
        max={audio?.current?.duration ?? 0}
        min={0}
        className="w-[400px]"
        onValueChange={(value) => {
          audio.current.currentTime = value;
        }}
      />

      {duration ? (
        <span className="opacity-50 w-12">{formatTime(duration)}</span>
      ) : (
        "0:00"
      )}
    </div>
  );
};

export function Player() {
  const { currentMusic, isPlaying, setIsPlaying, volume, setCurrentMusic } =
    usePlayerStore((state) => state);
  const audioRef = useRef();

  useEffect(() => {
    isPlaying ? audioRef.current.play() : audioRef.current.pause();
  }, [isPlaying]);

  useEffect(() => {
    audioRef.current.volume = volume;
  });

  useEffect(() => {
    const { song, playlist, songs } = currentMusic;
    if (song) {
      const src = `/music/${playlist?.id}/0${song.id}.mp3`;
      audioRef.current.src = src;
      audioRef.current.volume = volume;
      isPlaying && audioRef.current.play();
    }
  }, [currentMusic]);

  const handleClick = () => {
    setIsPlaying(!isPlaying);
  };

  const handleClickNextSong = () => {
    const totalSongs = currentMusic?.songs.length || 0;

    const currentSong = currentMusic?.song;

    if (currentSong) {
      // Encuentra el índice de la canción actual en la lista de canciones
      const currentIndex = currentMusic.songs.findIndex(
        (song) => song.id === currentSong.id
      );

      // Calcula el índice de la siguiente canción
      const nextIndex = (currentIndex + 1) % totalSongs;

      // Obtiene la siguiente canción
      const nextSong = currentMusic.songs[nextIndex];

      setCurrentMusic({ ...currentMusic, song: nextSong });
    }
  };

  const handleClickPreviousSong = () => {
    const totalSongs = currentMusic?.songs.length || 0;

    const currentSong = currentMusic?.song;

    if (currentSong) {
      // Encuentra el índice de la canción actual en la lista de canciones
      const currentIndex = currentMusic.songs.findIndex(
        (song) => song.id === currentSong.id
      );

      // Calcula el índice de la canción anterior
      const previousIndex = (currentIndex - 1 + totalSongs) % totalSongs;

      // Obtiene la canción anterior
      const previousSong = currentMusic.songs[previousIndex];

      setCurrentMusic({ ...currentMusic, song: previousSong });
    }
  };

  return (
    <div className="flex flex-row justify-between w-full px-1 z-50">
      <div className="w-[200px]">
        <CurrentSong {...currentMusic.song} />
      </div>
      <div className="grid place-content-center gap-4 flex-1">
        <div className="flex justify-center flex-col items-center">
          <div>
            <button
              className="opacity-70 hover:opacity-100 transition"
              onClick={() => {
                handleClickPreviousSong();
              }}
            >
              <Previous />
            </button>
            <button
              className="bg-white rounded-full p-2 ml-4 mr-4"
              onClick={() => {
                handleClick();
              }}
            >
              {isPlaying ? <Pause color="#000" /> : <Play color="#000" />}
            </button>
            <button
              className="opacity-70 hover:opacity-100 transition"
              onClick={() => {
                handleClickNextSong();
              }}
            >
              <Next />
            </button>
          </div>
          <SongControl audio={audioRef} />
          <audio ref={audioRef} />
        </div>
      </div>
      <div className="grid place-content-center">
        <VolumeControl />
      </div>
    </div>
  );
}
