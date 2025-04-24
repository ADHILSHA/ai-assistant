// Initialize theme based on system preference or saved preference
(function() {
  try {
    // First check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Apply the theme based on localStorage or system preference
    if (savedTheme === 'dark' || 
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      console.log('Theme script: Applied dark theme');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      console.log('Theme script: Applied light theme');
    }
    
    // Add a class instead of directly setting style to avoid hydration errors
    document.documentElement.classList.add('theme-loaded');
    
  } catch (e) {
    console.error('Error initializing theme:', e);
  }
})(); 