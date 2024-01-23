import React, { useEffect, useState } from 'react';
import SpeakerImage from './icon/icon.png';
interface ChatBubbleProps {
  // Define your prop types here
  textPromise: Promise<unknown>;
  placement: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  textPromise,
  placement,
}) => {
  /**
   * Trigger speaking based on speech options selected.
   */
  function speak(text: string) {
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance();
      utterance.pitch = parseFloat('2.0');
      (utterance.rate = parseFloat('0.8')), (utterance.text = text);
      const voice = window.speechSynthesis
        .getVoices()
        .find((voice) => voice.name === 'Rishi');
      if (voice) {
        utterance.voice = voice;
      }
      (utterance.volume = parseFloat('1')),
        window.speechSynthesis.speak(utterance);
    }
  }

  const [diplayText, setDisplayText] = useState<string>();

  useEffect(() => {
    if (textPromise) {
      textPromise.then((result) => {
        if (typeof result === 'string') setDisplayText(result);
      });
    }
  }, [textPromise]);
  return (
    <div className={`bubble ${placement}`}>
      {diplayText ? (
        <>
          <span>{diplayText}</span>{' '}
          <span
            onClick={() => {
              speak(diplayText);
            }}
          >
            <img src={SpeakerImage} style={{ width: '20px', height: '20px' }} />
          </span>
        </>
      ) : (
        <div className="loader">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
    </div>
  );
};
