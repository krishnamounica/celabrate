
import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

const ledDotMap = {
 
  "A": [[1,0],[0,1],[2,1],[0,2],[1,2],[2,2],[0,3],[2,3],[0,4],[2,4]],
  "B": [[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],[0,3],[2,3],[0,4],[1,4],[2,4]],
  "C": [[1,0],[2,0],[0,1],[0,2],[0,3],[1,4],[2,4]],
  "D": [[0,0],[1,0],[2,1],[2,2],[2,3],[1,4],[0,4],[0,1],[0,2],[0,3]],
  "E": [[0,0],[1,0],[2,0],[0,1],[0,2],[1,2],[0,3],[0,4],[1,4],[2,4]],
  "F": [[0,0],[1,0],[2,0],[0,1],[0,2],[1,2],[0,3],[0,4]],
  "G": [[1,0],[2,0],[0,1],[0,2],[1,2],[2,2],[2,3],[1,4],[0,4]],
  "H": [[0,0],[0,1],[0,2],[1,2],[2,0],[2,1],[2,2],[2,3],[2,4],[0,3],[0,4]],
  "I": [[1,0],[1,1],[1,2],[1,3],[1,4]],
  "J": [[2,0],[2,1],[2,2],[0,3],[1,4],[2,4]],
  "K": [[0,0],[0,1],[0,2],[1,2],[2,0],[1,1],[1,3],[2,4],[0,3],[0,4]],
  "L": [[0,0],[0,1],[0,2],[0,3],[0,4],[1,4],[2,4]],
  "M": [[0,0],[0,1],[0,2],[1,1],[2,0],[2,1],[2,2],[0,3],[2,3],[0,4],[2,4]],
  "N": [[0,0],[0,1],[0,2],[1,1],[2,0],[2,1],[2,2],[2,3],[2,4],[0,3],[0,4]],
  "O": [[1,0],[0,1],[2,1],[0,2],[2,2],[0,3],[2,3],[1,4]],
  "P": [[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[0,3],[0,4]],
  "Q": [[1,0],[0,1],[2,1],[0,2],[2,2],[1,3],[2,3],[2,4]],
  "R": [[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[0,3],[1,3],[2,4]],
  "S": [[1,0],[2,0],[0,1],[1,2],[2,2],[2,3],[0,4],[1,4]],
  "T": [[0,0],[1,0],[2,0],[1,1],[1,2],[1,3],[1,4]],
  "U": [[0,0],[0,1],[0,2],[0,3],[1,4],[2,0],[2,1],[2,2],[2,3]],
  "V": [[0,0],[0,1],[0,2],[1,3],[2,0],[2,1],[2,2],[1,4]],
  "W": [[0,0],[0,1],[0,2],[1,2],[2,0],[2,1],[2,2],[1,3],[1,4]],
  "X": [[0,0],[2,0],[1,1],[1,2],[1,3],[0,4],[2,4]],
  "Y": [[0,0],[2,0],[1,1],[1,2],[1,3],[1,4]],
  "Z": [[0,0],[1,0],[2,0],[1,1],[1,2],[1,3],[0,4],[1,4],[2,4]],
};

const CELL_SIZE = 12;
const DOT_RADIUS = 4;
const CHAR_SPACING = 8;
const LINE_LIMIT = Math.floor((screenWidth - 40) / (5 * CELL_SIZE + CHAR_SPACING));

const LedLetter = ({ letter, xOffset, yOffset }) => {
  const dots = ledDotMap[letter.toUpperCase()] || [];
  return dots.map(([x, y], index) => (
    <Circle
      key={index}
      cx={xOffset + x * CELL_SIZE}
      cy={yOffset + y * CELL_SIZE}
      r={DOT_RADIUS}
      fill="gold"
      stroke="orange"
      strokeWidth={1}
      opacity={0.9}
    />
  ));
};

const LEDNamePreview = ({ text }) => {
  const safeText = text?.toUpperCase() || 'HELLO'; // fallback only if undefined
  const characters = safeText.split('');
  const lines = [];

  for (let i = 0; i < characters.length; i += LINE_LIMIT) {
    lines.push(characters.slice(i, i + LINE_LIMIT));
  }

  const svgHeight = lines.length * 5 * CELL_SIZE + lines.length * 10;
  const svgWidth = screenWidth - 80;

  return (
    <View style={{
    //   margin: 20,
      backgroundColor: 'black',
    //   padding: 10,
      borderRadius: 10,
      alignItems: 'center',
      width: 'auto'
    }}>
      <Svg height={svgHeight} width={svgWidth}>
        {lines.map((line, rowIndex) =>
          line.map((char, index) => (
            <LedLetter
              key={`${char}-${rowIndex}-${index}`}
              letter={char}
              xOffset={index * (5 * CELL_SIZE + CHAR_SPACING)}
              yOffset={rowIndex * (5 * CELL_SIZE + 10)}
            />
          ))
        )}
      </Svg>
    </View>
  );
};


export default LEDNamePreview;

