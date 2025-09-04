import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ReviewFormData {
  companyName: string;
  jobTitle: string;
  outcome: string;
  overallRating: number;
  interviewDifficulty: number;
  processTransparency: number;
  reviewText: string;
  pros: string;
  cons: string;
  advice: string;
  recommendToFriend: boolean;
  employmentStatus: 'current' | 'former' | 'candidate';
  department: string;
  location: string;
  salary: string;
}

const WriteReview: React.FC = () => {
  const [formData, setFormData] = useState<ReviewFormData>({
    companyName: '',
    jobTitle: '',
    outcome: '',
    overallRating: 0,
    interviewDifficulty: 0,
    processTransparency: 0,
    reviewText: '',
    pros: '',
    cons: '',
    advice: '',
    recommendToFriend: false,
    employmentStatus: 'current',
    department: '',
    location: '',
    salary: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const companies = [
    'Tech Innovators Inc.',
    'Global Finance Group',
    'Health Solutions Corp.',
    'Retail Empire Ltd.',
    'Strategic Advisors LLC',
    'Creative Minds Studio'
  ];

  const jobTitles = [
    'Software Engineer',
    'Product Manager',
    'Data Scientist',
    'Marketing Manager',
    'Sales Representative',
    'UX Designer',
    'Business Analyst',
    'Project Manager',
    'Other'
  ];

  const outcomes = [
    'Got the job',
    'Didn\'t get the job',
    'Declined the offer',
    'Still in process',
    'Interview cancelled'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRatingChange = (field: string, rating: number) => {
    setFormData(prev => ({ ...prev, [field]: rating }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const StarRating: React.FC<{ 
    rating: number; 
    onRatingChange: (rating: number) => void;
    label: string;
    error?: string;
  }> = ({ rating, onRatingChange, label, error }) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className={`text-2xl transition-colors ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400`}
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {rating > 0 ? `${rating}/5` : 'Click to rate'}
          </span>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.companyName) newErrors.companyName = 'Please select a company';
      if (!formData.jobTitle) newErrors.jobTitle = 'Please select a job title';
      if (!formData.outcome) newErrors.outcome = 'Please select an outcome';
    }

    if (currentStep === 2) {
      if (formData.overallRating === 0) newErrors.overallRating = 'Please rate your overall experience';
      if (formData.interviewDifficulty === 0) newErrors.interviewDifficulty = 'Please rate the interview difficulty';
      if (formData.processTransparency === 0) newErrors.processTransparency = 'Please rate the process transparency';
    }

    if (currentStep === 3) {
      if (!formData.reviewText.trim()) newErrors.reviewText = 'Please write your review';
      if (formData.reviewText.length < 50) newErrors.reviewText = 'Review must be at least 50 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically send data to your backend
      console.log('Submitting review:', formData);
      
      // Show success message or redirect
      alert('Review submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrors({ general: 'Failed to submit review. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-slate-200 px-10 py-3">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-slate-900">
              <div className="size-4">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" />
                </svg>
              </div>
              <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em]">TalentTrace</h2>
            </div>
            <div className="flex items-center gap-9">
              <Link className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" to="/">Home</Link>
              <a className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" href="#">Reviews</a>
              <Link className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" to="/companies">Companies</Link>
              <a className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" href="#">Experiences</a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-10 lg:px-40 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col max-w-[800px] flex-1">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-slate-900">Write a Review</h1>
                <span className="text-sm text-slate-600">Step {step} of 3</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              {errors.general && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {errors.general}
                </div>
              )}

              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-6">Basic Information</h2>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select company *
                    </label>
                    <select
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.companyName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Choose a company...</option>
                      {companies.map(company => (
                        <option key={company} value={company}>{company}</option>
                      ))}
                    </select>
                    {errors.companyName && (
                      <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select job title *
                    </label>
                    <select
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.jobTitle ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Choose a job title...</option>
                      {jobTitles.map(title => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                    </select>
                    {errors.jobTitle && (
                      <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select your outcome *
                    </label>
                    <select
                      name="outcome"
                      value={formData.outcome}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.outcome ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Choose an outcome...</option>
                      {outcomes.map(outcome => (
                        <option key={outcome} value={outcome}>{outcome}</option>
                      ))}
                    </select>
                    {errors.outcome && (
                      <p className="text-red-500 text-sm mt-1">{errors.outcome}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Rate Your Experience */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-6">Rate Your Experience</h2>
                  
                  <StarRating
                    rating={formData.overallRating}
                    onRatingChange={(rating) => handleRatingChange('overallRating', rating)}
                    label="Overall experience *"
                    error={errors.overallRating}
                  />

                  <StarRating
                    rating={formData.interviewDifficulty}
                    onRatingChange={(rating) => handleRatingChange('interviewDifficulty', rating)}
                    label="Interview difficulty *"
                    error={errors.interviewDifficulty}
                  />

                  <StarRating
                    rating={formData.processTransparency}
                    onRatingChange={(rating) => handleRatingChange('processTransparency', rating)}
                    label="Process transparency *"
                    error={errors.processTransparency}
                  />
                </div>
              )}

              {/* Step 3: Write Your Review */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-6">Write Your Review</h2>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Write your review *
                    </label>
                    <textarea
                      name="reviewText"
                      value={formData.reviewText}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Share your experience with this company's interview process..."
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                        errors.reviewText ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.reviewText.length} characters (minimum 50)
                    </p>
                    {errors.reviewText && (
                      <p className="text-red-500 text-sm mt-1">{errors.reviewText}</p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pros (optional)
                    </label>
                    <textarea
                      name="pros"
                      value={formData.pros}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="What did you like about the process?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cons (optional)
                    </label>
                    <textarea
                      name="cons"
                      value={formData.cons}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="What could be improved?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Advice for future candidates (optional)
                    </label>
                    <textarea
                      name="advice"
                      value={formData.advice}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Any tips or advice for others applying to this company?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="recommendToFriend"
                        checked={formData.recommendToFriend}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        I would recommend this company to a friend
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <div>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                </div>
                
                <div>
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteReview;