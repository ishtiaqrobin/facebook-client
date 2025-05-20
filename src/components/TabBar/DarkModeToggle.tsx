import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DarkModeToggleProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  isDarkMode,
  toggleDarkMode,
}) => {
  const { toast } = useToast();

  const handleToggle = () => {
    const newMode = !isDarkMode;
    toggleDarkMode();

    toast({
      title: newMode ? "Dark mode activated" : "Light mode activated",
      description: `Theme preference has been saved.`,
    });
  };

  return (
    <div className="absolute top- right-2 z-10">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className="rounded-full cursor-pointer"
      >
        {isDarkMode ? "☀️" : "🌙"}
      </Button>
    </div>
  );
};

export default DarkModeToggle;
