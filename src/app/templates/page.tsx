export default function TemplatesPage() {
  const templates = [
    {
      id: 1,
      name: "Classic Professional",
      description: "Clean and traditional design perfect for corporate positions",
      category: "Professional",
      preview: "/api/placeholder/400/500"
    },
    {
      id: 2,
      name: "Modern Minimalist",
      description: "Contemporary design with clean lines and modern typography",
      category: "Modern",
      preview: "/api/placeholder/400/500"
    },
    {
      id: 3,
      name: "Creative Portfolio",
      description: "Bold design ideal for creative professionals and designers",
      category: "Creative",
      preview: "/api/placeholder/400/500"
    },
    {
      id: 4,
      name: "Tech Specialist",
      description: "Technical layout optimized for software engineers and developers",
      category: "Technical",
      preview: "/api/placeholder/400/500"
    },
    {
      id: 5,
      name: "Executive Leadership",
      description: "Sophisticated design for senior management and executive roles",
      category: "Executive",
      preview: "/api/placeholder/400/500"
    },
    {
      id: 6,
      name: "Academic Scholar",
      description: "Traditional format perfect for academic and research positions",
      category: "Academic",
      preview: "/api/placeholder/400/500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Template
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select from our collection of professionally designed resume templates. Each template is optimized for different industries and career levels.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[4/5] bg-gray-200 flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <div className="w-32 h-40 bg-gray-300 rounded mx-auto mb-2"></div>
                  <p className="text-sm">Template Preview</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {template.name}
                  </h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {template.category}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {template.description}
                </p>
                
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Use Template
                  </button>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Don't see what you're looking for? More templates coming soon!
          </p>
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors">
            Request Template
          </button>
        </div>
      </div>
    </div>
  );
}
