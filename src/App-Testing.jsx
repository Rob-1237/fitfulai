// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './styles/App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App


import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocket, faHeart, faCoffee } from "@fortawesome/pro-duotone-svg-icons";



function App() {
  const [message, setMessage] = useState("Testing...");

  // useEffect(() => {
  //   const testConnection = async () => {
  //     try {
  //       const { data, error } = await supabase.from("test_table").select("*");
  //       if (error) {
  //         console.error("❌ Error:", error.message);
  //         setMessage("Supabase connected, but table not found (this is expected).");
  //       } else {
  //         console.log("✅ Data:", data);
  //         setMessage("Supabase connection successful!");
  //       }
  //     } catch (err) {
  //       console.error("🔥 Exception:", err);
  //       setMessage("Supabase connection failed.");
  //     }
  //   };

  //   testConnection();
  // }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{message}</h1>
      <TestComponent />
    </div>
  );
}

export default App;




// Test Component for Tailwind, Framer Motion, and FontAwesome
const TestComponent = () => {
  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Library Test Component</h2>
      
      {/* Tailwind CSS Test */}
      <div className="bg-white rounded-md p-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">✅ Tailwind CSS</h3>
        <div className="flex space-x-2">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">Red</div>
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">Green</div>
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">Blue</div>
        </div>
      </div>

      {/* Framer Motion Test */}
      <motion.div 
        className="bg-white rounded-md p-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-2">✅ Framer Motion</h3>
        <motion.div 
          className="bg-yellow-400 w-16 h-16 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* FontAwesome Test */}
      <div className="bg-white rounded-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">✅ FontAwesome Pro</h3>
        <div className="flex space-x-4 text-2xl">
          <FontAwesomeIcon icon={faRocket} className="text-blue-500" />
          <FontAwesomeIcon icon={faHeart} className="text-red-500" />
          <FontAwesomeIcon icon={faCoffee} className="text-brown-600" />
        </div>
      </div>
    </div>
  );
};
