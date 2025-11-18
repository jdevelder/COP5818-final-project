import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface PriceUpdate {
  cardId: string;
  price: number;
  change24h: number;
  timestamp: number;
}

export interface TradeNotification {
  id: string;
  type: 'trade' | 'match' | 'order' | 'liquidation';
  title: string;
  message: string;
  timestamp: number;
  severity: 'info' | 'success' | 'warning' | 'error';
}

interface WebSocketContextType {
  prices: Map<string, PriceUpdate>;
  notifications: TradeNotification[];
  isConnected: boolean;
  subscribe: (cardId: string) => void;
  unsubscribe: (cardId: string) => void;
  dismissNotification: (id: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [prices, setPrices] = useState<Map<string, PriceUpdate>>(new Map());
  const [notifications, setNotifications] = useState<TradeNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [subscribedCards, setSubscribedCards] = useState<Set<string>>(new Set());

  // Simulate WebSocket connection (in production, this would connect to a real WebSocket server)
  useEffect(() => {
    setIsConnected(true);

    // Simulate initial prices
    const initialPrices = new Map<string, PriceUpdate>();
    const cardIds = [
      'Charizard-BaseSet-Rare',
      'BlackLotus-Alpha-Mythic',
      'PikachuEX-XY-Rare',
      'TimeWalk-Alpha-Rare',
      'Blastoise-BaseSet-Rare',
      'Venusaur-BaseSet-Rare',
    ];

    cardIds.forEach(cardId => {
      initialPrices.set(cardId, {
        cardId,
        price: 50 + Math.random() * 100,
        change24h: (Math.random() - 0.5) * 20,
        timestamp: Date.now(),
      });
    });

    setPrices(initialPrices);

    // Simulate price updates every 2 minutes (120 seconds)
    const priceInterval = setInterval(() => {
      setPrices(prevPrices => {
        const newPrices = new Map(prevPrices);

        subscribedCards.forEach(cardId => {
          const current = newPrices.get(cardId);
          if (current) {
            const priceChange = (Math.random() - 0.5) * 2; // Small price changes (±$1)
            const newPrice = Math.max(10, current.price + priceChange);

            newPrices.set(cardId, {
              cardId,
              price: newPrice,
              change24h: current.change24h + ((newPrice - current.price) / current.price) * 100,
              timestamp: Date.now(),
            });
          }
        });

        return newPrices;
      });
    }, 120000); // Update every 2 minutes (120 seconds)

    // Simulate random notifications every 10 seconds
    const notificationInterval = setInterval(() => {
      const notificationTypes = [
        {
          type: 'trade' as const,
          title: 'Trade Executed',
          message: 'Your limit order for Charizard was filled at $95.50',
          severity: 'success' as const,
        },
        {
          type: 'match' as const,
          title: 'Order Matched',
          message: 'Buy order matched with seller at $96.00',
          severity: 'info' as const,
        },
        {
          type: 'order' as const,
          title: 'New Order Created',
          message: 'Stop-loss order placed for Black Lotus at $85.00',
          severity: 'info' as const,
        },
        {
          type: 'liquidation' as const,
          title: 'Liquidation Warning',
          message: 'Position approaching liquidation price',
          severity: 'warning' as const,
        },
      ];

      const randomNotif = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          ...randomNotif,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 9), // Keep only last 10 notifications
      ]);
    }, 10000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(notificationInterval);
      setIsConnected(false);
    };
  }, [subscribedCards]);

  const subscribe = (cardId: string) => {
    setSubscribedCards(prev => new Set(prev).add(cardId));
  };

  const unsubscribe = (cardId: string) => {
    setSubscribedCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(cardId);
      return newSet;
    });
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <WebSocketContext.Provider
      value={{
        prices,
        notifications,
        isConnected,
        subscribe,
        unsubscribe,
        dismissNotification,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
