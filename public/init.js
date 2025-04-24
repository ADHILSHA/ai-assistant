// Script to safely initialize application state in production
(function() {
  try {
    // Function to safely interact with localStorage
    function safeLocalStorage(operation, key, value) {
      try {
        if (operation === 'get') {
          return localStorage.getItem(key);
        } else if (operation === 'set') {
          localStorage.setItem(key, value);
          return true;
        } else if (operation === 'remove') {
          localStorage.removeItem(key);
          return true;
        }
      } catch (e) {
        console.error(`localStorage operation ${operation} failed:`, e);
        return operation === 'get' ? null : false;
      }
    }

    // Set a flag indicating this is a fresh page load
    safeLocalStorage('set', 'freshPageLoad', 'true');

    // Clean up potentially corrupted or problematic data
    const chatHistory = safeLocalStorage('get', 'chatHistory');
    if (chatHistory) {
      try {
        // Validate JSON structure
        JSON.parse(chatHistory);
      } catch (e) {
        console.warn('Found corrupted chatHistory in localStorage, removing it');
        safeLocalStorage('remove', 'chatHistory');
      }
    }

    // Add event listener for when app is fully loaded
    window.addEventListener('load', function() {
      // Remove fresh page load flag after a small delay to ensure components have mounted
      setTimeout(function() {
        safeLocalStorage('remove', 'freshPageLoad');
      }, 1000);
    });

    // Set flag to indicate initialization completed successfully
    window.APP_INITIALIZED = true;
    console.log('Application initialization completed successfully');
  } catch (e) {
    console.error('Error during application initialization:', e);
  }
})(); 