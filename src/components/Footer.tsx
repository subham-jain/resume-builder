export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Resume Builder</h3>
            <p className="text-gray-400">
              Create professional resumes with ease. Built with modern technology for the best user experience.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Professional Templates</li>
              <li>ATS Optimization</li>
              <li>PDF Export</li>
              <li>Real-time Preview</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>FAQ</li>
              <li>Documentation</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Twitter</li>
              <li>LinkedIn</li>
              <li>GitHub</li>
              <li>Blog</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Resume Builder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
