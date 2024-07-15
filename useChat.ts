import { useState } from 'react';
import axios from 'axios';

export const useChat = () => {
  const [messages, setMessages] = useState<{ user: string, text: string }[]>([]);

  const sendMessage = async (message: string) => {
    setMessages([...messages, { user: 'me', text: message }]);
    try {
      const response = await axios.post('/.netlify/functions/chat', { query: message });
      setMessages([...messages, { user: 'me', text: message }, { user: 'bot', text: response.data.response }]);
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  return {
    messages,
    sendMessage,
  };
};
