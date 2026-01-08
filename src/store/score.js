import React, { useContext, useRef, useState, useCallback } from "react";
import { useTransition, animated } from "react-spring";

const SPRING_CONFIG = { mass: 1, tension: 40, friction: 20, precision: 0.001 };

const getNotificationColor = (color) => {
  if (color === "failure") return "#f00";
  if (color === "victory") return "#6ab10e";
  if (color === "defeat") return "#fff";
  return "#000";
};

const getPosition = (type) => {
  if (type === "failure") return -40;
  if (type === "victory") return 0;
  if (type === "defeat") return -20;
  return -40;
};

function useAnimatedNotifications() {
  const [items, setItems] = useState([]);

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const itemsTransition = useTransition(items, {
    keys: item => item.id,
    from: { progress: 0 },
    enter: { progress: 0 },
    leave: { progress: 1 },
    onRest: ({ item, phase }) => {
      if (phase === 'leave') {
        removeItem(item.id);
      }
    },
    config: SPRING_CONFIG,
  });

  const lastId = useRef(0);

  const add = useCallback((label, color) => {
    setItems((items) => [
      ...items,
      { id: lastId.current++, label, color: getNotificationColor(color), top: getPosition(color) },
    ]);
  }, []);

  return [itemsTransition, add];
}

const NotificationsContext = React.createContext();

export function ScoreProvider({ children }) {
  const [notifications, add] = useAnimatedNotifications();

  return (
    <NotificationsContext.Provider value={add}>
      <div className="secondWrapper">
        <div className="col">
          <div className="scoreContext">
            {Array.isArray(notifications) && notifications.map(
              ({ props: { progress }, item: { label, color, top }, key }) => (
                <animated.div
                  className="pts"
                  key={key}
                  style={{
                    opacity: progress.interpolate({
                      range: [0, 0.5, 0.99, 1],
                      output: [0, 1, 1, 0],
                    }),
                    transform: progress
                      .interpolate({
                        range: [0, 0.3, 0.9, 1],
                        output: [0, 1, 1, 1],
                      })
                      .interpolate((p) => `translate(${40 * p}px, 50px)`),
                    color,
                    top
                  }}
                >
                  {label}
                </animated.div>
              )
            )}
          </div>
        </div>
      </div>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useScore() {
  return useContext(NotificationsContext);
}
