// Global audio context and pre-loaded audio for better browser compatibility
let audioContext: AudioContext | null = null;
let preloadedAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;
let audioInitialized = false;

// Initialize audio system - must be called from user interaction
const initializeAudio = async () => {
  if (audioInitialized) return;
  
  console.log('🔊 Initializing audio system...');
  
  try {
    // Create audio context
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    console.log('🔊 AudioContext created, state:', audioContext.state);
    
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
      console.log('🔊 AudioContext resumed, state:', audioContext.state);
    }
    
    // Create and configure preloaded audio
    preloadedAudio = new Audio('/notification-sound-effect-372475.mp3');
    preloadedAudio.volume = 0.5;
    preloadedAudio.preload = 'auto';
    
    // Load the audio file
    await new Promise<void>((resolve, reject) => {
      if (!preloadedAudio) {
        reject(new Error('Audio element not created'));
        return;
      }
      
      preloadedAudio.addEventListener('canplaythrough', () => {
        console.log('🔊 Audio file loaded and ready to play');
        resolve();
      }, { once: true });
      
      preloadedAudio.addEventListener('error', (e) => {
        console.log('🔊 Audio file loading error:', e);
        reject(e);
      }, { once: true });
      
      // Trigger loading
      preloadedAudio.load();
    });
    
    // Play a silent sound to unlock audio
    try {
      preloadedAudio.currentTime = 0;
      preloadedAudio.volume = 0; // Silent
      await preloadedAudio.play();
      preloadedAudio.pause();
      preloadedAudio.volume = 0.5; // Restore volume
      audioUnlocked = true;
      console.log('🔊 Audio unlocked successfully with silent play');
    } catch (silentPlayError) {
      console.log('🔊 Silent play failed, trying oscillator unlock:', silentPlayError);
      
      // Fallback: unlock with silent oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.01);
      
      audioUnlocked = true;
      console.log('🔊 Audio unlocked with oscillator method');
    }
    
    audioInitialized = true;
    console.log('🔊 Audio system fully initialized and unlocked');
    
  } catch (error) {
    console.log('🔊 Error initializing audio system:', error);
    audioInitialized = false;
    audioUnlocked = false;
  }
};

// Utility function to play notification sound
export const playNotificationSound = async () => {
  console.log('🔊 Attempting to play notification sound...');
  console.log('🔊 Audio state - initialized:', audioInitialized, 'unlocked:', audioUnlocked);
  
  // Check if audio is properly initialized
  if (!audioInitialized || !audioUnlocked) {
    console.log('🔊 Audio not ready - cannot play sound automatically');
    console.log('🔊 This is expected due to browser autoplay policy');
    return;
  }
  
  try {
    // Use preloaded audio
    if (preloadedAudio && audioContext) {
      console.log('🔊 Playing preloaded audio...');
      console.log('🔊 AudioContext state:', audioContext.state);
      
      // Ensure audio context is running
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('🔊 AudioContext resumed');
      }
      
      // Reset and play audio
      preloadedAudio.currentTime = 0;
      
      try {
        await preloadedAudio.play();
        console.log('🔊 Notification sound played successfully!');
      } catch (playError) {
        console.log('🔊 Preloaded audio play failed:', playError);
        await playWebAudioNotification();
      }
    } else {
      console.log('🔊 Preloaded audio not available, trying Web Audio API...');
      await playWebAudioNotification();
    }
  } catch (error) {
    console.log('🔊 All audio methods failed:', error);
    console.log('🔊 Playing console beep as last resort');
    console.log('\u0007'); // ASCII bell character
  }
};

// Fallback Web Audio API notification sound
const playWebAudioNotification = async () => {
  console.log('🔊 Playing Web Audio API fallback sound...');
  
  try {
    // Use existing audio context or create new one
    const currentAudioContext = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
    
    console.log('🔊 AudioContext state:', currentAudioContext.state);
    
    // Resume audio context if it's suspended
    if (currentAudioContext.state === 'suspended') {
      await currentAudioContext.resume();
      console.log('🔊 AudioContext resumed');
    }
    
    await createAndPlayTone(currentAudioContext);
    
  } catch (error) {
    console.log('🔊 Web Audio API also failed:', error);
    console.log('🔊 Playing console beep as last resort');
    console.log('\u0007'); // ASCII bell character
  }
};

const createAndPlayTone = async (audioContext: AudioContext) => {
  return new Promise<void>((resolve) => {
    // Create oscillator for the notification sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect oscillator to gain node to speakers
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure the sound
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // High frequency
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1); // Drop to lower frequency
    
    // Configure volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    // Handle oscillator end
    oscillator.onended = () => {
      console.log('🔊 Web Audio tone completed');
      resolve();
    };
    
    // Start and stop the oscillator
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  });
};

// Alternative function using a simple audio file
export const playNotificationSoundFile = () => {
  try {
    const audio = new Audio('/notification-sound-effect-372475.mp3');
    audio.volume = 0.5;
    audio.play().catch(error => {
      console.log('Could not play notification sound file:', error);
    });
  } catch (error) {
    console.log('Could not create audio element:', error);
  }
};

// Function to unlock audio on user interaction
export const unlockAudio = async () => {
  console.log('🔊 unlockAudio() called');
  await initializeAudio();
};

// Test function - call this from browser console to test sound
export const testNotificationSound = async () => {
  console.log('🧪 Testing notification sound...');
  await initializeAudio(); // Ensure audio is initialized
  await playNotificationSound();
};

// Alternative function for manual sound testing (always works with user interaction)
export const playNotificationSoundManual = async () => {
  console.log('🔊 Manual notification sound triggered by user...');
  
  try {
    // Always try to initialize first on manual trigger
    await initializeAudio();
    
    // Create a fresh audio element for manual testing
    const audio = new Audio('/notification-sound-effect-372475.mp3');
    audio.volume = 0.5;
    
    await audio.play();
    console.log('🔊 Manual notification sound played successfully!');
    
  } catch (error) {
    console.log('🔊 Manual audio failed, trying Web Audio API:', error);
    
    try {
      await playWebAudioNotification();
    } catch (webAudioError) {
      console.log('🔊 All manual audio methods failed:', webAudioError);
    }
  }
};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testNotificationSound = testNotificationSound;
  (window as any).unlockAudio = unlockAudio;
  (window as any).playNotificationSoundManual = playNotificationSoundManual;
  
  // Auto-initialize audio on any user interaction
  const autoUnlock = async () => {
    console.log('🔊 User interaction detected, initializing audio...');
    
    try {
      await initializeAudio();
      
      // Remove listeners after successful unlock
      if (audioInitialized && audioUnlocked) {
        console.log('🔊 Audio fully unlocked, removing event listeners');
        document.removeEventListener('click', autoUnlock);
        document.removeEventListener('keydown', autoUnlock);
        document.removeEventListener('touchstart', autoUnlock);
      }
    } catch (error) {
      console.log('🔊 Auto-unlock failed:', error);
    }
  };
  
  // Add event listeners for auto-unlock
  document.addEventListener('click', autoUnlock, { once: false });
  document.addEventListener('keydown', autoUnlock, { once: false });
  document.addEventListener('touchstart', autoUnlock, { once: false });
  
  console.log('🔊 Audio auto-unlock event listeners registered');
}
