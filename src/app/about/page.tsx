export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About Resume Builder
          </h1>
          
          <div className="prose prose-lg text-gray-700">
            <p className="mb-6">
              Resume Builder is a modern, user-friendly platform designed to help professionals create stunning, professional resumes in minutes. Our mission is to make resume creation accessible to everyone, regardless of their technical skills or design experience.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Features</h2>
            <ul className="mb-6 space-y-2">
              <li>• Professional templates designed by experts</li>
              <li>• ATS-friendly formatting for better job application success</li>
              <li>• Real-time preview as you build your resume</li>
              <li>• Easy-to-use drag-and-drop interface</li>
              <li>• PDF export functionality</li>
              <li>• Mobile-responsive design</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="mb-6">
              We understand that creating a professional resume can be challenging. That&apos;s why we&apos;ve built a platform that combines powerful features with an intuitive interface. Our templates are carefully crafted to meet industry standards while allowing for personal customization.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technology</h2>
            <p className="mb-6">
              Built with modern web technologies including Next.js, React, and TypeScript, Resume Builder provides a fast, reliable, and secure experience. Your data is protected with industry-standard security measures.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-8">
              <p className="text-blue-800">
                <strong>Ready to get started?</strong> Choose a template and begin building your professional resume today!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
