import { DEFAULT_VOICE_ID } from '@/lib/voice';

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
      await audio.play();
    } catch (playError) {
      console.error('Audio play error:', playError);
      URL.revokeObjectURL(audioUrl);
      return false;
    }

    // Clean up memory after playing
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

    return true;
  } catch (error) {
    console.error('ElevenLabs Error:', error);
    return false;
  }
};