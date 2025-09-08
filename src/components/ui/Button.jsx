export function Button({ children, onClick, type = "button", disabled = false, variant = "primary", className = "" }) {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white focus:ring-gray-500",
    secondary: "bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-900 focus:ring-gray-500",
    danger: "bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white focus:ring-red-500",
    destructive: "bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white focus:ring-red-500",
    outline: "border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 focus:ring-gray-500"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}