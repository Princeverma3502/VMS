import React, { useState } from 'react';
import { Sun, Moon, Palette } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, updateTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { name: 'light', label: 'Light Mode', icon: Sun },
    { name: 'dark', label: 'Dark Mode', icon: Moon },
    { name: 'nss-blue', label: 'NSS Blue', icon: Palette },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        title="Change Theme"
      >
        <Palette size={20} className="text-gray-600 dark:text-gray-300" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Choose Theme</p>
            <div className="space-y-2">
              {themes.map(({ name, label, icon: Icon }) => (
                <button
                  key={name}
                  onClick={() => {
                    updateTheme(name);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                    theme === name
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{label}</span>
                  {theme === name && <span className="ml-auto text-blue-600 dark:text-blue-300">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
