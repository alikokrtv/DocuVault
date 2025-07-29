import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, LogIn } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img 
              src="https://pluskitchen.com.tr/images/logo.png" 
              alt="Plus Kitchen Logo" 
              className="h-12 w-auto"
            />
          </div>
          
          {/* System Name */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dokumanet</h1>
            <p className="text-gray-600">Belge Yönetim Sistemi</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* System Features */}
              <div className="text-center space-y-4">
                <div className="p-4 bg-pk-light-green rounded-lg">
                  <FileText className="h-8 w-8 text-pk-green mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Güvenli Belge Yönetimi</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Departman bazlı erişim kontrolü ile belgelerinizi güvenle yönetin
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-pk-green rounded-full mr-2"></div>
                    Dosya Yükleme
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-pk-green rounded-full mr-2"></div>
                    Onay Süreci
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-pk-green rounded-full mr-2"></div>
                    Yorum Sistemi
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-pk-green rounded-full mr-2"></div>
                    Dosya Önizleme
                  </div>
                </div>
              </div>

              {/* Login Button */}
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="w-full bg-pk-green hover:bg-pk-dark-green text-white py-3 text-base font-medium"
                size="lg"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Sisteme Giriş Yap
              </Button>

              {/* Info */}
              <div className="text-center text-sm text-gray-500">
                <p>Replit hesabınızla giriş yapın</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400">
          © 2024 Plus Kitchen - Tüm hakları saklıdır
        </div>
      </div>
    </div>
  );
}
