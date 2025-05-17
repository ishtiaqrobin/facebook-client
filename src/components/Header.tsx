import React from "react";
import Image from "next/image";
import logo from "../assets/logo.png";

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center">
            {/* <span className="text-white text-lg font-bold">F</span> */}
            <Image src={logo} alt="logo" width={32} height={32} priority />
          </div>
          <h1 className="text-xl font-bold text-gray-800">
            Facebook Auto Poster
          </h1>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a
            href="#"
            className="text-gray-600 hover:text-[#1877F2] transition-colors"
          >
            Dashboard
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-[#1877F2] transition-colors"
          >
            Sessions
          </a>
          <a
            href="/help"
            className="text-gray-600 hover:text-[#1877F2] transition-colors"
          >
            Help
          </a>
        </nav>

        {/* Chrome is not supported this padding right*/}
        <div className="hidden md:flex items-center space-x-4 pr-0 md:pr-16">
          <button className="px-4 py-2 bg-[#1877F2] text-white rounded-md hover:bg-[#145db2] transition-colors cursor-pointer">
            Connect
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
