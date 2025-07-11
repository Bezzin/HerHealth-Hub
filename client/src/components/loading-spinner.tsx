interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  submessage?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  message = 'Loading...', 
  submessage 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin border-4 border-primary border-t-transparent rounded-full ${sizeClasses[size]} mb-3`}></div>
      <p className="text-gray-600 font-medium">{message}</p>
      {submessage && (
        <p className="text-sm text-gray-500 mt-1">{submessage}</p>
      )}
    </div>
  );
}