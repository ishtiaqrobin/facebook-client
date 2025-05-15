import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-2 md:mb-0">
            © {new Date().getFullYear()} Facebook Auto Poster. All rights
            reserved.
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/privacy-policy"
              className="text-sm text-gray-500 hover:text-[#1877F2] transition-colors"
            >
              Privacy
            </a>
            <a
              href="/terms-of-service"
              className="text-sm text-gray-500 hover:text-[#1877F2] transition-colors"
            >
              Terms
            </a>
            <a
              href="/data-deletion"
              className="text-sm text-gray-500 hover:text-[#1877F2] transition-colors"
            >
              Data
            </a>
            <a
              href="/help"
              className="text-sm text-gray-500 hover:text-[#1877F2] transition-colors"
            >
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
