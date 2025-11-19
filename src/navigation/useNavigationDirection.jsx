// useNavigationDirection.js
import { useEffect, useRef, useState } from 'react';
import { useNavigationState } from '@react-navigation/native';

export default function useNavigationDirection() {
  const routeKeyRef = useRef(null);
  const [isBack, setIsBack] = useState(false);
  const routesLength = useNavigationState(state => state.routes.length);
  const currentKey = useNavigationState(state => state.routes[state.index]?.key);

  useEffect(() => {
    if (routeKeyRef.current && currentKey !== routeKeyRef.current) {
      // Check if navigating back
      setIsBack(routesLength < routeKeyRef.current.length);
    }
    routeKeyRef.current = currentKey;
  }, [currentKey, routesLength]);

  return isBack;
}
