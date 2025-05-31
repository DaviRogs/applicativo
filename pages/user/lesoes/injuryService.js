import { Platform } from 'react-native';
import { API_URL } from '@env';

const processImageForUpload = async (uri) => {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    return response.blob();
  } else {
    const filename = uri.split('/').pop() || `image_${Date.now()}.jpg`;

    // Determine the file type
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    return {
      uri: uri,
      name: filename,
      type: type,
    };
  }
};

export const injuryService = {
  /**
   * Save injuries to the backend
   * @param {Array} injuries - Array of injury objects
   * @param {Object} patientData - Patient data including attendance_id
   * @param {String} token - Authentication token
   * @returns {Promise} - Promise resolving to the API response
   */
  saveInjuries: async (injuries, patientData, token) => {
    if (!injuries || injuries.length === 0) {
      console.warn('No injuries to save');
      return Promise.resolve({
        success: false,
        message: 'No injuries to save',
      });
    }

    if (!patientData || !patientData.attendance_id) {
      console.error('Missing attendance_id in patientData');
      return Promise.reject(new Error('Missing attendance_id in patientData'));
    }

    try {
      const attendanceId = patientData.attendance_id;
      const results = [];

      // Process each injury separately
      for (const injury of injuries) {
        const formData = new FormData();

        // Add required fields
        formData.append('atendimento_id', attendanceId.toString());
        formData.append('local_lesao_id', injury.locationId || injury.location);
        formData.append('descricao_lesao', injury.description || '');

        // Process and add photos if available
        if (injury.photos && injury.photos.length > 0) {
          for (const photo of injury.photos) {
            let fileObj;

            // Handle different photo formats
            if (typeof photo === 'string') {
              // Photo is a URI string
              fileObj = await processImageForUpload(photo);
            } else if (photo.uri) {
              // Photo is an object with uri
              fileObj = await processImageForUpload(photo.uri);
            } else {
              // Skip invalid photos
              continue;
            }

            formData.append('files', fileObj);
          }
        }

        // Send request to API
        const response = await fetch(`${API_URL}/cadastrar-lesao`, {
          method: 'POST',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
            // Content-Type is set automatically by FormData
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `API responded with status: ${response.status}`,
          );
        }

        const result = await response.json();
        results.push(result);
      }

      return {
        success: true,
        message: 'All injuries saved successfully',
        results,
      };
    } catch (error) {
      console.error('Error saving injuries:', error);
      throw error;
    }
  },

  /**
   * Delete an injury
   * @param {string|number} injuryId - ID of the injury to delete
   * @param {string} token - Authentication token
   * @returns {Promise} - Promise resolving to the API response
   */
  deleteInjury: async (injuryId, token) => {
    try {
      const response = await fetch(`${API_URL}/lesoes/${injuryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API responded with status: ${response.status}`,
        );
      }

      return response.json();
    } catch (error) {
      console.error('Delete injury error:', error);
      throw error;
    }
  },

  /**
   * Get location name by ID (for display purposes)
   * @param {number|string} locationId - Location ID
   * @returns {string} - Location name
   */
  getLocationNameById: (locationId) => {
    const locations = {
      1: 'Face',
      2: 'Pescoço',
      3: 'Tronco anterior',
      4: 'Tronco posterior',
      5: 'Membros superiores',
      6: 'Membros inferiores',
      7: 'Mãos',
      8: 'Pés',
      9: 'Couro cabeludo',
      10: 'Outro',
    };

    return locations[locationId] || 'Localização desconhecida';
  },

  /**
   * Format injury data for API submission
   * @param {Object} injury - Injury object
   * @returns {Object} - Formatted injury data for API
   */
  formatInjuryForSubmission: (injury) => {
    return {
      location: injury.locationId || injury.location,
      description: injury.description || '',
      photos: injury.photos || [],
    };
  },
};
