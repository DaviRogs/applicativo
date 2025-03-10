import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProgressBar = ({ currentStep, totalSteps }) => {
  return (
    <View style={styles.progressBar}>
      {Array.from({ length: totalSteps }, (_, index) => index + 1).map((step) => (
        <React.Fragment key={step}>
          <View style={[styles.progressStep, step === currentStep && styles.activeStep]}>
            <Text style={[styles.stepText, step === currentStep && styles.activeStepText]}>
              {step}
            </Text>
          </View>
          {step < totalSteps && <View style={[
            styles.progressLine,
            step < currentStep && styles.completedLine
          ]} />}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  progressStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1e3d59',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStep: {
    backgroundColor: '#1e3d59',
  },
  stepText: {
    fontSize: 12,
    color: '#1e3d59',
    fontWeight: '500',
  },
  activeStepText: {
    color: '#fff',
  },
  progressLine: {
    height: 2,
    width: 40,
    backgroundColor: '#1e3d59',
    opacity: 0.3,
  },
  completedLine: {
    opacity: 1,
  },
});

export default ProgressBar;