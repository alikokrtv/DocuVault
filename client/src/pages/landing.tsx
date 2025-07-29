import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Shield, Users, CheckCircle, MessageSquare } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pk-light-green to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="https://pluskitchen.com.tr/images/logo.png" 
                alt="Plus Kitchen Logo" 
                className="h-8 w-auto"
              />
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Dokumanet</h1>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-pk-green hover:bg-pk-dark-green text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Document Management
            <span className="block text-pk-green">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your document workflow with Dokumanet - Plus Kitchen's comprehensive 
            document and media management system. Upload, organize, and collaborate securely.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-pk-green hover:bg-pk-dark-green text-white px-8 py-3 text-lg"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage documents efficiently and securely
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-gray-100 hover:border-pk-green transition-colors">
              <CardHeader>
                <div className="p-3 bg-pk-light-green rounded-lg w-fit">
                  <Upload className="h-6 w-6 text-pk-green" />
                </div>
                <CardTitle>Easy File Upload</CardTitle>
                <CardDescription>
                  Upload documents with drag-and-drop. Supports PDF, images, videos, and Office files.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-gray-100 hover:border-pk-green transition-colors">
              <CardHeader>
                <div className="p-3 bg-blue-100 rounded-lg w-fit">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Department Isolation</CardTitle>
                <CardDescription>
                  Secure access control ensures departments only see their own files and data.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-gray-100 hover:border-pk-green transition-colors">
              <CardHeader>
                <div className="p-3 bg-orange-100 rounded-lg w-fit">
                  <CheckCircle className="h-6 w-6 text-pk-orange" />
                </div>
                <CardTitle>Approval Workflow</CardTitle>
                <CardDescription>
                  Streamlined approval process with admin oversight and status tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-gray-100 hover:border-pk-green transition-colors">
              <CardHeader>
                <div className="p-3 bg-purple-100 rounded-lg w-fit">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Comment System</CardTitle>
                <CardDescription>
                  Administrators can provide feedback and comments on submitted documents.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-gray-100 hover:border-pk-green transition-colors">
              <CardHeader>
                <div className="p-3 bg-red-100 rounded-lg w-fit">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Secure Storage</CardTitle>
                <CardDescription>
                  Files are stored securely with hashed filenames and access controls.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-gray-100 hover:border-pk-green transition-colors">
              <CardHeader>
                <div className="p-3 bg-green-100 rounded-lg w-fit">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>File Preview</CardTitle>
                <CardDescription>
                  Preview documents, images, and videos directly in the browser.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-pk-green text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Document Management?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join Plus Kitchen's digital transformation with Dokumanet
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-white text-pk-green hover:bg-gray-100 px-8 py-3 text-lg"
          >
            Sign In Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <img 
                src="https://pluskitchen.com.tr/images/logo.png" 
                alt="Plus Kitchen Logo" 
                className="h-8 w-auto filter brightness-0 invert"
              />
              <span className="text-lg font-semibold">Dokumanet</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 Plus Kitchen. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
