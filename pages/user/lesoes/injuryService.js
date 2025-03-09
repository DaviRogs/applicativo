/**
 * Injury API service
 * Handles communication with the backend API for injuries using fetch
 */

// Replace with your actual API base URL
const API_BASE_URL = 'https://your-api-endpoint.com/api';



// Helper function to convert image URI to blob for upload
const uriToBlob = async (uri) => {
  if (Platform.OS === 'web') {
    // For web: fetch the image and get as blob
    const response = await fetch(uri);
    return response.blob();
  } else {
    // For React Native: Convert URI to blob
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function() {
        reject(new Error('uriToBlob failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  }
};

export const injuryService = {
  /**
   * @param {Array} injuries - 
   * @param {Object} patientData -
   * @returns {Promise} - 
   */
  saveInjuries: async (injuries, patientData) => {
    try {
      const formData = new FormData();
      
      // Add patient data
      if (patientData) {
        formData.append('patientId', patientData.id || '');
        formData.append('patientName', patientData.nome_paciente || '');
        formData.append('patientCpf', patientData.cpf_paciente || '');
      }
      
      formData.append('injuries', JSON.stringify(
        injuries.map(injury => ({
          id: injury.id,
          location: injury.location,
          description: injury.description,
          date: injury.date,
          title: injury.title,
          photoCount: injury.photos ? injury.photos.length : 0
        }))
      ));
      
      let photoIndex = 0;
      for (let i = 0; i < injuries.length; i++) {
        const injury = injuries[i];
        if (injury.photos && injury.photos.length > 0) {
          for (let j = 0; j < injury.photos.length; j++) {
            const photo = injury.photos[j];
            if (photo.uri) {
              try {
                const blob = await uriToBlob(photo.uri);
                const filename = `injury_${i}_photo_${j}.jpg`;
                
                formData.append('photos', blob, filename);
                formData.append(`photoMapping[${photoIndex}]`, `${i}_${j}`);
                photoIndex++;
              } catch (error) {
                console.error('Error processing photo:', error);
              }
            }
          }
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/injuries`, {
        method: 'POST',
        body: formData,
   
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  },
  
  /**
   * @param {string|number} injuryId 
   * @returns {Promise} 
   */
  deleteInjury: async (injuryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/injuries/${injuryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Delete injury error:', error);
      throw error;
    }
  }
};