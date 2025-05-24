/**
 * Utility functions for managing injuries in local storage
 * This is useful for persisting data between screens and app sessions
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const INJURIES_STORAGE_KEY = '@injuries_data';

export const injuryStorage = {
  /**
   * @param {Array} injuries - Array of injury objects
   * @returns {Promise<void>}
   */
  saveInjuries: async (injuries) => {
    try {
      const jsonValue = JSON.stringify(injuries);
      await AsyncStorage.setItem(INJURIES_STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving injuries:', error);
      throw error;
    }
  },

  /**
   * Get injuries from AsyncStorage
   * @returns {Promise<Array>} - Promise resolving to array of injury objects
   */
  getInjuries: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(INJURIES_STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error getting injuries:', error);
      return [];
    }
  },

  /**
   * @param {Object} injury - New injury object to add
   * @returns {Promise<Array>} - Promise resolving to updated array of injury objects
   */
  addInjury: async (injury) => {
    try {
      const injuries = await injuryStorage.getInjuries();
      const updatedInjuries = [...injuries, injury];
      await injuryStorage.saveInjuries(updatedInjuries);
      return updatedInjuries;
    } catch (error) {
      console.error('Error adding injury:', error);
      throw error;
    }
  },

  /**
   * @param {Object} updatedInjury - Updated injury object
   * @returns {Promise<Array>} - Promise resolving to updated array of injury objects
   */
  updateInjury: async (updatedInjury) => {
    try {
      const injuries = await injuryStorage.getInjuries();
      const index = injuries.findIndex(
        (injury) => injury.id === updatedInjury.id,
      );

      if (index !== -1) {
        injuries[index] = updatedInjury;
        await injuryStorage.saveInjuries(injuries);
      }

      return injuries;
    } catch (error) {
      console.error('Error updating injury:', error);
      throw error;
    }
  },

  /**
   * @param {string|number} injuryId
   * @returns {Promise<Array>} - Promise resolving to updated array of injury objects
   */
  deleteInjury: async (injuryId) => {
    try {
      const injuries = await injuryStorage.getInjuries();
      const updatedInjuries = injuries.filter(
        (injury) => injury.id !== injuryId,
      );
      await injuryStorage.saveInjuries(updatedInjuries);
      return updatedInjuries;
    } catch (error) {
      console.error('Error deleting injury:', error);
      throw error;
    }
  },

  /**
   * @returns {Promise<void>}
   */
  clearInjuries: async () => {
    try {
      await AsyncStorage.removeItem(INJURIES_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing injuries:', error);
      throw error;
    }
  },
};
