import logo from "../../assets/logo.jpeg";

export default function SplashScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-gray-100">
      <div className="text-center">
        {/* Logo Container with subtle shadow and animation */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            {/* Animated ring effect behind logo */}
            <div className="absolute inset-0 rounded-full bg-blue-100 opacity-75 animate-ping"></div>
            <div className="relative bg-white rounded-full p-4 shadow-xl">
              <img
                src={logo}
                alt="SUROKKHA Logo"
                className="w-24 h-24 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-2xl font-bold tracking-tight text-gray-800 mt-2">
          SUROKKHA
        </h1>
        <p className="text-xs font-medium text-blue-600 tracking-wide uppercase mt-1">
          CCTV & SECURITY SOLUTION
        </p>

        {/* Loading status text */}
        <div className="mt-6 space-y-1">
          <h2 className="text-md font-semibold text-gray-700">
            Initializing System...
          </h2>
          <p className="text-xs text-gray-400">
            Please wait while we load your dashboard
          </p>
        </div>

        {/* Subtle decorative line */}
        <div className="mt-8 flex justify-center">
          <div className="w-12 h-1 bg-blue-100 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}