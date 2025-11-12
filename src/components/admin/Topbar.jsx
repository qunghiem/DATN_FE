import React from "react";

const Topbar = () => {
  return (
    <header className="h-16 bg-white flex items-center justify-end px-6 shadow">
      <span className="mr-4">Admin Name</span>
      <button className="bg-red-500 text-white px-4 py-1 rounded">Logout</button>
    </header>
  );
};

export default Topbar;
