'use client';

import { ATSMetrics as ATSMetricsType, ATS_CATEGORIES } from '@/lib/ats-analyzer';
import ATSInfoIcon from './ATSInfoIcon';

interface ATSMetricsProps {
  metrics: ATSMetricsType;
}

export default function ATSMetrics({ metrics }: ATSMetricsProps) {
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBarColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ATS Score Analysis</h2>
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-bold ${getScoreColor(metrics.overallScore, 100)} px-4 py-2 rounded-lg`}>
            {metrics.overallScore}%
          </div>
          <div>
            <div className="text-sm text-gray-600">Overall ATS Score</div>
            <div className="text-xs text-gray-500">
              {metrics.overallScore >= 80 ? 'Excellent' : metrics.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(metrics.categories).map(([key, category]) => {
          const categoryInfo = ATS_CATEGORIES.find(c => c.id === key);
          const percentage = (category.score / category.maxScore) * 100;

          return (
            <div key={key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{categoryInfo?.name || key}</h3>
                  {categoryInfo && <ATSInfoIcon category={categoryInfo} />}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(category.score, category.maxScore)}`}>
                  {category.score}/{category.maxScore}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getScoreBarColor(category.score, category.maxScore)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Details */}
              {category.details.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Details:</h4>
                  <ul className="space-y-1">
                    {category.details.map((detail, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="mr-2">{detail.startsWith('✓') ? '✓' : detail.startsWith('⚠') ? '⚠' : 'ℹ'}</span>
                        <span>{detail.replace(/^[✓⚠ℹ]\s*/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {category.suggestions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Suggestions:</h4>
                  <ul className="space-y-1">
                    {category.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-blue-800 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Recommendations */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2">💡 Tips to Improve Your ATS Score</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• Use keywords from the job description throughout your resume</li>
          <li>• Keep formatting simple and ATS-friendly</li>
          <li>• Quantify achievements with specific numbers and percentages</li>
          <li>• Ensure all contact information is complete and accurate</li>
          <li>• Use standard section headings (Experience, Education, Skills)</li>
        </ul>
      </div>
    </div>
  );
}

