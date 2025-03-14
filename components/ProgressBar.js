import React from 'react';
import { View, Text, StyleSheet, Dimensions, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const ProgressSteps = ({ currentStep = 1, totalSteps = 5 }) => {
  // Use window dimensions to make the component responsive
  const { width } = useWindowDimensions();
  
  // Calculate sizes based on screen width
  const isSmallScreen = width < 360;
  
  // Calculate circle size and connector width based on available space
  const circleSize = isSmallScreen ? 36 : Math.min(48, width / (totalSteps * 2));
  const fontSize = isSmallScreen ? 14 : 18;
  
  // Calculate connector width to fill available space
  const totalCirclesWidth = circleSize * totalSteps;
  const availableWidth = width - 32; // Subtract container padding
  const connectorWidth = (availableWidth - totalCirclesWidth) / (totalSteps - 1);
  
  // Generate an array of steps from 1 to totalSteps
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          {/* Step Circle */}
          <View
            style={[
              styles.stepCircle,
              { width: circleSize, height: circleSize },
              step === currentStep
                ? styles.currentStep
                : step < currentStep
                  ? styles.completedStep
                  : styles.futureStep,
            ]}
          >
            {step < currentStep ? (
              <Icon name="check" size={isSmallScreen ? 16 : 20} color="#fff" />
            ) : (
              <Text
                style={[
                  styles.stepText,
                  { fontSize },
                  step === currentStep ? styles.currentStepText : styles.futureStepText,
                ]}
                numberOfLines={1}
              >
                {step}
              </Text>
            )}
          </View>
          
          {/* Connecting Line (if not the last step) */}
          {index < totalSteps - 1 && (
            <View
              style={[
                styles.connector,
                { width: Math.max(8, connectorWidth) },
                step < currentStep ? styles.activeConnector : styles.inactiveConnector,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 16,
    backgroundColor: '#f3f4f6',
    flexWrap: 'nowrap',
  },
  stepCircle: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentStep: {
    backgroundColor: '#5F84A1', 
  },
  completedStep: {
    backgroundColor: ' #5F84A1', 
  },
  futureStep: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db', 
  },
  stepText: {
    fontWeight: '500',
  },
  currentStepText: {
    color: '#ffffff',
  },
  futureStepText: {
    color: '#1f2937', 
  },
  connector: {
    height: 4,
    marginHorizontal: 2,
  },
  activeConnector: {
    backgroundColor: '#2563eb', 
  },
  inactiveConnector: {
    backgroundColor: '#d1d5db', 
  },
});

export default ProgressSteps;