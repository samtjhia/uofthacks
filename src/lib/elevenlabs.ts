import { DEFAULT_VOICE_ID } from '@/lib/voice';
import { useStore } from '@/store/useStore';

import { DEFAULT_ELEVENLABS_MODEL } from '@/lib/voice';

export const speakText = async (
  text: string,
  voiceId: string = DEFAULT_VOICE_ID,
  model: string = DEFAULT_ELEVENLABS_MODEL
) => {
  try {
    const response = await fetch('/api/speak', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, voiceId, model }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('ElevenLabs Error response:', response.status, errText);
      throw new Error(errText || 'Failed to synthesize speech');
    }

    // The response is an audio blob (the actual sound file)
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    // Play the audio (may reject if browser blocks autoplay)
    try {
      useStore.getState().setIsSpeaking(true);

      audio.onended = () => {
        useStore.getState().setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        useStore.getState().setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (playError) {
      console.error('Audio play error:', playError);
      useStore.getState().setIsSpeaking(false);
      URL.revokeObjectURL(audioUrl);
      return false;
    }

    return true;
  } catch (error) {
    console.error('ElevenLabs Error:', error);
    return false;
  }
};