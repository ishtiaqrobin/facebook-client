
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DarkModeToggleProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ isDarkMode, toggleDarkMode }) => {
  const { toast } = useToast();

  const handleToggle = () => {
    toggleDarkMode();
    
    toast({
      title: isDarkMode ? "Light mode activated" : "Dark mode activated",
      description: `Theme preference has been saved.`,
    });
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <Button 
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className="rounded-full"
      >
        {isDarkMode ? '☀️' : '🌙'}
      </Button>
    </div>
  );
};

export default DarkModeToggle;
