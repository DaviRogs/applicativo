import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const ProgressSteps = ({ 
  currentStep = 1, 
  totalSteps = 5, 
  stepLabels = [],
  currentDate,
  currentUser
}) => {
  // Use window dimensions to make the component responsive
  const { width } = useWindowDimensions();
  
  // Calculate sizes based on screen width
  const isSmallScreen = width < 360;
  
  // Circle size and connector width calculations
  const circleSize = isSmallScreen ? 28 : Math.min(36, (width - 32) / (totalSteps * 1.8));
  const fontSize = isSmallScreen ? 12 : 14;
  
  // Calculate connector width to fill available space
  const availableWidth = width - 32; // Subtract container padding
  const totalCirclesWidth = circleSize * totalSteps;
  const connectorWidth = Math.max(4, (availableWidth - totalCirclesWidth) / (totalSteps - 1) - 2);
  
  // Generate an array of steps from 1 to totalSteps
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {/* Date and User info */}
      {(currentDate || currentUser) && (
        <View style={styles.infoRow}>
          {currentDate && (
            <Text style={styles.infoText}>
              <Icon name="clock" size={12} color="#666" style={styles.infoIcon} /> {currentDate}
            </Text>
          )}
          {currentUser && (
            <Text style={styles.infoText}>
              <Icon name="user" size={12} color="#666" style={styles.infoIcon} /> {currentUser}
            </Text>
          )}
        </View>
      )}
      
      {/* Progress Steps */}
      <View style={styles.stepsRow}>
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
                step === currentStep && styles.currentStepShadow
              ]}
            >
              {step < currentStep ? (
                <Icon name="check" size={isSmallScreen ? 14 : 16} color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.stepText,
                    { fontSize },
                    step === currentStep ? styles.currentStepText : styles.futureStepText,
                  ]}
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
                  { width: connectorWidth },
                  step < currentStep ? styles.activeConnector : styles.inactiveConnector,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
      
      {/* Step Labels - show all labels */}
      {stepLabels.length > 0 && (
        <View style={styles.labelsContainer}>
          {steps.map((step, index) => {
            if (!stepLabels[index]) return null;
            
            const labelWidth = (width - 32) / totalSteps;
            const isCurrent = step === currentStep;
            
            return (
              <View 
                key={`label-${step}`} 
                style={[
                  styles.labelWrapper, 
                  { 
                    width: labelWidth,
                    left: `${((index) / (totalSteps - 1)) * 100}%`,
                    transform: [{ translateX: -labelWidth/2 }]
                  }
                ]}
              >
                <Text 
                  style={[
                    styles.stepLabel,
                    isCurrent && styles.currentStepLabel
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {stepLabels[index]}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f5f8fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  infoText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  infoIcon: {
    marginRight: 4,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  stepCircle: {
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentStep: {
    backgroundColor: '#1e3d59',
    borderWidth: 0,
  },
  completedStep: {
    backgroundColor: '#1e3d59',
    borderWidth: 0,
  },
  futureStep: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  currentStepShadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  stepText: {
    fontWeight: '600',
  },
  currentStepText: {
    color: '#ffffff',
  },
  futureStepText: {
    color: '#1f2937',
  },
  connector: {
    height: 3,
    borderRadius: 1.5,
  },
  activeConnector: {
    backgroundColor: '#1e3d59',
  },
  inactiveConnector: {
    backgroundColor: '#d1d5db',
  },
  labelsContainer: {
    position: 'relative',
    height: 20,
    marginTop: 8,
    width: '100%',
  },
  labelWrapper: {
    position: 'absolute',
  },
  stepLabel: {
    color: '#666',
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'center',
  },
  currentStepLabel: {
    color: '#1e3d59',
    fontWeight: '600',
    fontSize: 11,
  }
});

export default ProgressSteps;