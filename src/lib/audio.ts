let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

export async function playAudio(url: string): Promise<void> {
  // Use HTML5 Audio for simplicity and better compatibility
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);

    audio.addEventListener('ended', () => {
      resolve();
    });

    audio.addEventListener('error', (e) => {
      console.warn('Audio playback failed:', url, e);
      // Resolve anyway to not block the app
      resolve();
    });

    audio.play().catch((error) => {
      console.warn('Audio play failed:', error);
      resolve();
    });
  });
}

export function preloadAudio(urls: string[]): void {
  urls.forEach(url => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = url;
  });
}
