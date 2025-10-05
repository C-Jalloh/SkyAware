import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ErrorComponentProps {
  message: string;
  onRefresh: () => void;
}

const ErrorComponent = ({ message, onRefresh }: ErrorComponentProps) => {
  return (
    <div className='flex items-center justify-center min-h-[400px] p-4'>
      <div className='text-center max-w-md'>
        <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/50 mb-4'>
          <AlertTriangle className='w-8 h-8 text-red-500' />
        </div>

        <h2 className='text-xl font-semibold text-gray-200 mb-2'>
          Something went wrong
        </h2>

        <p className='text-gray-400 mb-6'>{message}</p>

        <Button
          onClick={onRefresh}
          className='bg-blue-600 hover:bg-blue-700 text-white'
        >
          <RefreshCw className='w-4 h-4 mr-2' />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default ErrorComponent;
