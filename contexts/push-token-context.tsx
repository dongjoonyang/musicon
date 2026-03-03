import { createContext, useContext, type ReactNode } from 'react';

type PushTokenContextValue = {
  expoPushToken: string | null;
};

const PushTokenContext = createContext<PushTokenContextValue>({
  expoPushToken: null,
});

export function PushTokenProvider({
  expoPushToken,
  children,
}: {
  expoPushToken: string | null;
  children: ReactNode;
}) {
  return (
    <PushTokenContext.Provider value={{ expoPushToken }}>
      {children}
    </PushTokenContext.Provider>
  );
}

export function usePushToken() {
  return useContext(PushTokenContext);
}
