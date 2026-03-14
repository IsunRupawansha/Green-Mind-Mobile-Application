import React, { createContext, useState } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  return (
    <ChatContext.Provider value={{ history, setHistory }}>
      {children}
    </ChatContext.Provider>
  );
};