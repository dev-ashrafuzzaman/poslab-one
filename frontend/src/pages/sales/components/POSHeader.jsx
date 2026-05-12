import { Clock, Store, CreditCard, TrendingUp } from 'lucide-react';

const POSHeader = ({user}) => {
console.log(user)


  return (
    <header className="w-full">
      {/* Main Header Container */}
      <div className="relative">
        {/* Background Gradient Effect */}
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/5 via-transparent to-purple-600/5 rounded-3xl" />
        
        {/* Main Content */}
        <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-3xl shadow-lg shadow-blue-600/5 hover:shadow-xl transition-shadow duration-300">
          
          {/* Top Status Bar - Optional but adds professionalism */}
          <div className="flex items-center justify-between px-8 py-2 border-b border-gray-100">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">System Online</span>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-full">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-medium text-blue-600">+23% today</span>
              </div>
            </div>
          </div>

          {/* Main Header Content */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 py-5 gap-4 sm:gap-0">
            
            {/* Left Section - Store Identity */}
            <div className="flex items-center gap-5 group">
              {/* Animated Logo Container */}
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-cyan-500 rounded-2xl opacity-75 blur-md group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative w-14 h-14 rounded-2xl bg-linear-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-300">
                  <CreditCard className="w-7 h-7 text-white" strokeWidth={1.5} />
                </div>
              </div>

              {/* Store Info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  Point of Sale
                  <span className="hidden lg:inline-block px-2 py-0.5 text-xs font-medium bg-linear-to-r from-blue-600 to-cyan-600 text-white rounded-full">
                    v2.0
                  </span>
                </h1>
                
                {/* Session Status with Tooltip-like Design */}
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-linear-to-r from-green-50 to-emerald-50 border border-green-200">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-green-700">Live Session</span>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500">
                    <Store className="w-3.5 h-3.5" />
                    <span>Operator: {user?.name} ({user?.roleName})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Business Info with Enhanced Styling */}
            <div className="flex items-center gap-6">
              {/* Outlet Info */}
              <div className="text-right">
                <h2 className="text-2xl font-black bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                  RICHWEAR
                </h2>
                <div className="mt-1 flex items-center justify-end gap-2">
                  <div className="px-3 py-1 bg-linear-to-r from-blue-600 to-blue-700 rounded-full shadow-sm">
                    <p className="text-xs font-semibold text-white tracking-wide">
                     {user?.branchName}
                    </p>
                  </div>
                 
                </div>
              </div>

    
            </div>
          </div>
    
        </div>
      </div>
    </header>
  );
};

export default POSHeader;