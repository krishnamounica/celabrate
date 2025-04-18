import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Guideline sizes based on a standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) => 
  size + (scale(size) - size) * factor;


export { moderateScale, scale, verticalScale };
