import React, { useContext, useRef, useState } from "react";
import { useTransition, animated } from "react-spring";

const SPRING_CONFIG = { mass: 1, tension: 110, friction: 20, precision: 0.001 };

const getNotificationColor = (color) => {
  if (color === "failure") return "#f00";
  if (color === "victory") return "#6ab10e";
  if (color === "defeat") return "#fff";
  return "#000";
};

function useAnimatedNotifications() {
  const [items, setItems] = useState([]);

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const itemsTransition = useTransition(items, (item) => item.id, {
    config: SPRING_CONFIG,
    from: { progress: 0 },
    enter: { progress: 0 },
    leave: { progress: 1 },
    onStart: ({ id }) => {
      removeItem(id);
    },
  });

  const lastId = useRef(0);

  const add = (label, color) => {
    setItems([
      ...items,
      { id: lastId.current++, label, color: getNotificationColor(color) },
    ]);
  };

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
            {notifications.map(
              ({ props: { progress }, item: { label, color }, key }) => (
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
                      .interpolate((p) => `translate(${100 * p}px, 50px)`),
                    color,
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
