import SetupNotification from '@/components/SetupNotification';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <SetupNotification />
        <main className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Professional Resume Builder
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Create stunning, professional resumes in minutes. Choose from our collection of templates and customize them to match your style.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <a
              href="/generate"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg"
            >
              Start Building Resume
            </a>
            <a
              href="/templates"
              className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-8 rounded-lg border-2 border-blue-600 transition-colors duration-200"
            >
              View Templates
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
              <p className="text-gray-600">Intuitive interface that makes resume building simple and fast.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Professional Templates</h3>
              <p className="text-gray-600">Choose from a variety of professionally designed templates.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">💼</div>
              <h3 className="text-xl font-semibold mb-2">ATS Friendly</h3>
              <p className="text-gray-600">Optimized for Applicant Tracking Systems used by employers.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
