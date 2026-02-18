// src/components/Card.js (single source of truth)
import styled from 'styled-components/native';
import { theme } from '../../theme';

export const Card = styled.View`
  background-color: ${p => p.bg || theme.colors.card};
  border-radius: ${theme.radius.card}px;
  padding: ${theme.spacing.card}px;
  margin-bottom: ${theme.spacing.section}px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.06;
  shadow-radius: 8px;
  elevation: 3;
`;
