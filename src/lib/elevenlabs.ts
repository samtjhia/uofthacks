import { DEFAULT_VOICE_ID } from '@/lib/voice';
import { useStore } from '@/store/useStore';

import { DEFAULT_ELEVENLABS_MODEL } from '@/lib/voice';

export const speakText = async (
  text: string,
  voiceId: string = DEFAULT_VOICE_ID,
  model: string = DEFAULT_ELEVENLABS_MODEL
) => {
  try {
    // 1. Get Tone from Global State
    const { speechTone } = useStore.getState();
    console.log(`🗣️ Speaking with tone: ${speechTone}`);

    // 2. Pre-process Text (Punctuation Hacking)
    let processedText = text;
    let settings = { stability: 0.5, similarity_boost: 0.75 }; // Default optimized

    switch (speechTone) {
        case 'happy':
            // Happy = More expressive (lower stability) + Exclamation
            // Valid values per error: 0.0, 0.5, 1.0. Using 0.0 for maximum expression.
            settings = { stability: 0.0, similarity_boost: 0.75 }; 
            if (!processedText.match(/[!?.]$/)) processedText += '!';
            else if (processedText.endsWith('.')) processedText = processedText.slice(0, -1) + '!';
            break;
            
        case 'serious':
            // Serious = Very stable + Period
            settings = { stability: 1.0, similarity_boost: 0.75 };
            if (!processedText.match(/[!?.]$/)) processedText += '.';
            else if (processedText.endsWith('!')) processedText = processedText.slice(0, -1) + '.';
            break;

        case 'empathic':
            // Empathic = Natural
            settings = { stability: 0.5, similarity_boost: 0.8 };
            // No strict punctuation rule, but avoid ALL CAPS if present? 
            break;

        case 'neutral':
        default:
             settings = { stability: 0.5, similarity_boost: 0.75 };
             break;
    }

    const response = await fetch('/api/speak', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: processedText, voiceId, model, settings }),
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