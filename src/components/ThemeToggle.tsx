import { useState, useEffect } from 'react';
import { Button } from '@mui/material';

const ThemeToggle = () => {
  const [theme, setTheme] = useState<string>('theme-one'); // Default theme is 'theme-one'

  // Function to toggle the theme
  const toggleTheme = () => {
    const currentTheme = document.documentElement.classList.contains('theme-one') ? 'theme-one' : 'theme-two';
    const newTheme = currentTheme === 'theme-one' ? 'theme-two' : 'theme-one';
    document.documentElement.classList.remove('theme-one', 'theme-two');
    document.documentElement.classList.add(newTheme);
  };
  

  // Apply the theme class to the HTML tag
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <div style={{ position: 'fixed', top: 20, right: 20 }}>
      <Button variant="contained" onClick={toggleTheme}>
        Toggle Theme
      </Button>
    </div>
  );
};

export default ThemeToggle;
