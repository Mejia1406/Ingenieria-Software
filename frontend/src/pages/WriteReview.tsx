// frontend/src/components/WriteReviewModal.tsx
import React, { useState, useEffect } from 'react';
import AnimatedContent from '../components/AnimatedContent';
import axios from 'axios';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
    isVerified: boolean;
}

interface Company {
    _id: string;
    name: string;
    slug: string;
    industry: string;
    logo?: string;
}

interface ReviewFormData {
    companyId: string;
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

interface WriteReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const WriteReviewModal: React.FC<WriteReviewModalProps> = ({ isOpen, onClose, user }) => {
    const [formData, setFormData] = useState<ReviewFormData>({
        companyId: '',
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
        employmentStatus: 'candidate',
        department: '',
        location: '',
        salary: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    // Load companies from database - this hook always runs
    useEffect(() => {
        const fetchCompanies = async () => {
            if (!isOpen || !user) return; // Early return inside the effect, not before hooks

            setLoadingCompanies(true);
            try {
                const response = await axios.get(`${API_URL}/companies`);
                if (response.data.success && response.data.data.companies) {
                    setCompanies(response.data.data.companies);
                }
            } catch (error) {
                console.error('Error fetching companies:', error);
                // Fallback companies if API fails
                setCompanies([
                    { _id: '1', name: 'Tech Innovators Inc.', slug: 'tech-innovators', industry: 'Technology' },
                    { _id: '2', name: 'Global Finance Group', slug: 'global-finance', industry: 'Finance' },
                    { _id: '3', name: 'Health Solutions Corp.', slug: 'health-solutions', industry: 'Healthcare' }
                ]);
            } finally {
                setLoadingCompanies(false);
            }
        };

        fetchCompanies();
    }, [isOpen, user, API_URL]);

    // Reset form when modal opens to ensure clean state
    useEffect(() => {
        if (isOpen) {
            setFormData({
                companyId: '',
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
            setStep(1);
            setErrors({});
        }
    }, [isOpen]);

    const jobTitles = [
        'Ingeniero de Software',
        'Gerente de Producto',
        'Científico de Datos',
        'Gerente de Marketing',
        'Representante de Ventas',
        'Diseñador UX',
        'Analista de Negocios',
        'Gerente de Proyecto',
        'Desarrollador Frontend',
        'Desarrollador Backend',
        'DevOps Engineer',
        'QA Engineer',
        'Otro'
    ];

    const outcomes = [
        'Conseguí el trabajo',
        'No conseguí el trabajo',
        'Rechacé la oferta',
        'Aún en proceso',
        'Entrevista cancelada'
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        console.log("HandleInputChange llamado:", {name, value})
        // If selecting a company, update both ID and name
        if (name === 'companyId') {
            const selectedCompany = companies.find(c => c._id === value);
            setFormData(prev => ({
                ...prev,
                companyId: value,
                companyName: selectedCompany?.name || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

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
                            className={`text-2xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300'
                                } hover:text-yellow-400`}
                        >
                            ★
                        </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                        {rating > 0 ? `${rating}/5` : 'Haz clic para calificar'}
                    </span>
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
        );
    };

    const validateStep = (currentStep: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!formData.companyId) newErrors.companyId = 'Por favor selecciona una empresa';
            if (!formData.jobTitle) newErrors.jobTitle = 'Por favor selecciona un puesto';
            if (!formData.outcome) newErrors.outcome = 'Por favor selecciona un resultado';
        }

        if (currentStep === 2) {
            if (formData.overallRating === 0) newErrors.overallRating = 'Por favor califica tu experiencia general';
            if (formData.interviewDifficulty === 0) newErrors.interviewDifficulty = 'Por favor califica la dificultad de la entrevista';
            if (formData.processTransparency === 0) newErrors.processTransparency = 'Por favor califica la transparencia del proceso';
        }

        if (currentStep === 3) {
            if (!formData.reviewText.trim()) newErrors.reviewText = 'Por favor escribe tu reseña';
            if (formData.reviewText.length < 50) newErrors.reviewText = 'La reseña debe tener al menos 50 caracteres';
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
            const token = localStorage.getItem('token');

            // Prepare data to send
            const reviewData = {
                company: formData.companyId,
                reviewType: formData.employmentStatus === 'candidate' ? 'interview' : 'employee',
                jobTitle: formData.jobTitle,
                department: formData.department || '',
                employmentStatus: formData.employmentStatus,
                overallRating: Number(formData.overallRating),
                ratings: {
                    workLifeBalance: Number(formData.interviewDifficulty),
                    compensation: Number(formData.processTransparency),
                    careerGrowth: Number(formData.overallRating),
                    management: Number(formData.overallRating),
                    culture: Number(formData.overallRating)
                },
                content: formData.reviewText,
                pros: formData.pros,
                cons: formData.cons,
                recommendation: {
                    wouldRecommend: formData.recommendToFriend,
                    recommendToFriend: formData.recommendToFriend
                }
            };

            const response = await axios.post(
                `${API_URL}/reviews`,
                reviewData,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                alert('¡Reseña enviada exitosamente!');
                onClose();

                // Reset form
                setFormData({
                    companyId: '',
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
                setStep(1);
                setErrors({});
            }

        } catch (error: any) {
            console.error('Error enviando reseña:', error);
            setErrors({
                general: error.response?.data?.message || 'Error al enviar la reseña. Por favor intenta de nuevo.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Early return AFTER all hooks have been called
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <AnimatedContent
                distance={150}
                direction="vertical"
                reverse={true}
                duration={0.9}
                ease="power3.out"
                initialOpacity={0}
                animateOpacity
                scale={1}
                threshold={0.2}
                delay={0}
                triggerOnMount
            >
            <div className="bg-white rounded-lg w-[900px] max-w-[95vw] max-h-[90vh] overflow-y-scroll shadow-xl" style={{ scrollbarGutter: 'stable' }}>
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Escribir Reseña</h2>
                            <p className="text-sm text-slate-600">Paso {step} de 3</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>

                    {errors.general && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {errors.general}
                        </div>
                    )}

                    {/* Step 1: Basic Information */}
                    {step === 1 && (
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-6">Información Básica</h3>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Seleccionar empresa *
                                </label>
                                {loadingCompanies ? (
                                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                                        Cargando empresas...
                                    </div>
                                ) : (
                                    <select
                                        name="companyId"
                                        value={formData.companyId}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.companyId ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Elige una empresa...</option>
                                        {companies.map(company => (
                                            <option key={company._id} value={company._id}>
                                                {company.name} - {company.industry}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {errors.companyId && (
                                    <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Seleccionar puesto *
                                </label>
                                <select
                                    name="jobTitle"
                                    value={formData.jobTitle}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.jobTitle ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Elige un puesto...</option>
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
                                    Seleccionar resultado *
                                </label>
                                <select
                                    name="outcome"
                                    value={formData.outcome}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.outcome ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Elige un resultado...</option>
                                    {outcomes.map(outcome => (
                                        <option key={outcome} value={outcome}>{outcome}</option>
                                    ))}
                                </select>
                                {errors.outcome && (
                                    <p className="text-red-500 text-sm mt-1">{errors.outcome}</p>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado laboral
                                </label>
                                <select
                                    name="employmentStatus"
                                    value={formData.employmentStatus}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="candidate">Candidato</option>
                                    <option value="current">Empleado actual</option>
                                    <option value="former">Ex empleado</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Rate Your Experience */}
                    {step === 2 && (
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-6">Califica tu Experiencia</h3>

                            <StarRating
                                rating={formData.overallRating}
                                onRatingChange={(rating) => handleRatingChange('overallRating', rating)}
                                label="Experiencia general *"
                                error={errors.overallRating}
                            />

                            <StarRating
                                rating={formData.interviewDifficulty}
                                onRatingChange={(rating) => handleRatingChange('interviewDifficulty', rating)}
                                label="Dificultad de la entrevista *"
                                error={errors.interviewDifficulty}
                            />

                            <StarRating
                                rating={formData.processTransparency}
                                onRatingChange={(rating) => handleRatingChange('processTransparency', rating)}
                                label="Transparencia del proceso *"
                                error={errors.processTransparency}
                            />
                        </div>
                    )}

                    {/* Step 3: Write Your Review */}
                    {step === 3 && (
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-6">Escribe tu Reseña</h3>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Escribe tu reseña *
                                </label>
                                <textarea
                                    name="reviewText"
                                    value={formData.reviewText}
                                    onChange={(e) => {
                                        console.log('Textarea onChange:', e.target.value);
                                        handleInputChange(e);
                                    }}
                                    rows={6}
                                    placeholder="Comparte tu experiencia con el proceso de entrevista de esta empresa..."
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${errors.reviewText ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    {formData.reviewText.length} caracteres (mínimo 50)
                                </p>
                                {errors.reviewText && (
                                    <p className="text-red-500 text-sm mt-1">{errors.reviewText}</p>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Aspectos positivos (opcional)
                                </label>
                                <textarea
                                    name="pros"
                                    value={formData.pros}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="¿Qué te gustó del proceso?"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Aspectos negativos (opcional)
                                </label>
                                <textarea
                                    name="cons"
                                    value={formData.cons}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="¿Qué se podría mejorar?"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Consejos para futuros candidatos (opcional)
                                </label>
                                <textarea
                                    name="advice"
                                    value={formData.advice}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="¿Algún consejo para otros que postulen a esta empresa?"
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
                                        Recomendaría esta empresa a un amigo
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
                                    Anterior
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
                                    Siguiente
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? 'Enviando...' : 'Enviar Reseña'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            </AnimatedContent>
        </div>
    );
};

export default WriteReviewModal;