import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft } from 'lucide-react';

const CancelPage: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4" style={{background: '#011412'}}>
      <Card className="w-full max-w-md bg-gray-900/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-center text-orange-400 flex items-center justify-center gap-2">
            <XCircle className="h-6 w-6" />
            Payment Canceled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-gray-300 mb-2">
              No worries! Your payment was canceled.
            </p>
            <p className="text-gray-400 mb-6">
              You can try again anytime or explore our free content.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setLocation('/pricing')} 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pricing
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation('/')} 
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Browse Free Content
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CancelPage;