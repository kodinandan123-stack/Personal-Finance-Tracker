const LoadingSpinner = ({ size = 'md', message = '' }) => {
    const sizeClasses = {
          sm: 'h-5 w-5 border-2',
          md: 'h-10 w-10 border-4',
          lg: 'h-16 w-16 border-4',
    };

    return (
          <div className="flex flex-col items-center justify-center gap-3">
                <div
                          className={`animate-spin rounded-full border-gray-200 border-t-blue-600 ${
                                      sizeClasses[size] || sizeClasses.md
                          }`}
                        />
            {message && (
                    <p className="text-sm text-gray-500 animate-pulse">{message}</p>p>
                )}
          </div>div>
        );
};

export default LoadingSpinner;</div>
