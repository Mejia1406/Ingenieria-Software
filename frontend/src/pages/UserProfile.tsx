import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Holaaaaa, oe esto es para definir el tipo de usuario, pues lo que se va a recibir
interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
    profilePicture?: string;
    professionalSummary?: string;
    skills: string[];
    isVerified: boolean;
    reputation: number;
    location: {
        city: string;
        country: string;
    };
    workExperience: Array<{
        company: string;
        position: string;
        startDate: string;
        endDate?: string;
        description?: string;
    }>;
    education: Array<{
        institution: string;
        degree: string;
        fieldOfStudy: string;
        graduationYear: number;
    }>;
    createdAt: string;
    updatedAt: string;
}

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

// Esta vuelta es que cuando le das al boton de edit en la pagina, ps aparece una ventana donde ud edita
const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Aca en user es donde se guarda TODO del usuario, el loading es para que se cargue los datos
const UserProfile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Todo esto es lo que hace que las ventanas esten abiertas o no, false no y true si
    const [editBasicInfo, setEditBasicInfo] = useState(false);
    const [editLocation, setEditLocation] = useState(false);
    const [editSummary, setEditSummary] = useState(false);
    const [editSkills, setEditSkills] = useState(false);
    const [editExperience, setEditExperience] = useState(false);
    const [editEducation, setEditEducation] = useState(false);

    // Esto es para cuando ud escribe su nombre o lo que sea, y no le ha dado a guardar o cancelar
    const [basicInfoForm, setBasicInfoForm] = useState({
        firstName: '',
        lastName: '',
        userType: 'candidate'
    });

    const [locationForm, setLocationForm] = useState({
        city: '',
        country: ''
    });

    const [summaryForm, setSummaryForm] = useState('');
    const [skillsForm, setSkillsForm] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');

    const [experienceForm, setExperienceForm] = useState({
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: ''
    });

    const [educationForm, setEducationForm] = useState({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        graduationYear: new Date().getFullYear()
    });

    // Esto hace que cuando se abre el perfil se cargue todos los datos de una
    useEffect(() => {
        fetchUserProfile();
    }, []);

    // Esto le pide al servidor que le pase todos los datos de tal usuario
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found');
                return;
            }

            const response = await fetch('http://localhost:5000/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (response.status === 401) {
            // Token expirado o inválido
            console.log('Token expired, redirecting to login...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setError('Session expired. Please login again.');
            
            // Redirigir al home después de 2 segundos
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            return;
        }

            if (data.success) {
                setUser(data.data.user);
                // Inicializar formularios con datos actuales
                setBasicInfoForm({
                    firstName: data.data.user.firstName || '',
                    lastName: data.data.user.lastName || '',
                    userType: data.data.user.userType || 'candidate'
                });
                setLocationForm({
                    city: data.data.user.location?.city || '',
                    country: data.data.user.location?.country || ''
                });
                setSummaryForm(data.data.user.professionalSummary || '');
                setSkillsForm(data.data.user.skills || []);
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Failed to fetch profile data');
        } finally {
            setLoading(false);
        }
    };

    // Esto es que cuando se hace un cambio se envia al servidor y se actualiza
    const updateProfile = async (updates: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.data.user);
                return true;
            } else {
                setError(data.message);
                return false;
            }
        } catch (error) {
            setError('Failed to update profile');
            return false;
        }
    };

    // Todo esto es para cuando usted le da por ejemplo a guardar todo lo que ud hizo se guarde en el servidor
    const handleSaveBasicInfo = async () => {
        const success = await updateProfile(basicInfoForm);
        if (success) setEditBasicInfo(false);
    };

    const handleSaveLocation = async () => {
        const success = await updateProfile({ location: locationForm });
        if (success) setEditLocation(false);
    };

    const handleSaveSummary = async () => {
        const success = await updateProfile({ professionalSummary: summaryForm });
        if (success) setEditSummary(false);
    };

    const handleSaveSkills = async () => {
        const success = await updateProfile({ skills: skillsForm });
        if (success) setEditSkills(false);
    };

    const addSkill = () => {
        if (newSkill.trim() && !skillsForm.includes(newSkill.trim())) {
            setSkillsForm([...skillsForm, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkillsForm(skillsForm.filter(skill => skill !== skillToRemove));
    };

    const handleAddExperience = async () => {
        if (experienceForm.company && experienceForm.position && experienceForm.startDate) {
            const newExperience = [...(user?.workExperience || []), experienceForm];
            const success = await updateProfile({ workExperience: newExperience });
            if (success) {
                setEditExperience(false);
                setExperienceForm({
                    company: '',
                    position: '',
                    startDate: '',
                    endDate: '',
                    description: ''
                });
            }
        }
    };

    const handleAddEducation = async () => {
        if (educationForm.institution && educationForm.degree && educationForm.fieldOfStudy) {
            const newEducation = [...(user?.education || []), educationForm];
            const success = await updateProfile({ education: newEducation });
            if (success) {
                setEditEducation(false);
                setEducationForm({
                    institution: '',
                    degree: '',
                    fieldOfStudy: '',
                    graduationYear: new Date().getFullYear()
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Error</h2>
                    <p className="text-gray-600 mb-6">{error || 'User not found'}</p>
                    <Link to="/" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="w-8 h-8">
                                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor" />
                                    </svg>
                                </div>
                                <span className="text-lg font-bold">TalentTrace</span>
                            </Link>
                        </div>
                        <nav className="flex space-x-8">
                            <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
                            <Link to="/companies" className="text-gray-600 hover:text-blue-600">Companies</Link>
                            <Link to="/profile" className="text-blue-600 font-medium">Profile</Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Profile Header */}
                <div className="bg-white rounded-lg shadow-sm border mb-6 overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    <div className="px-6 pb-6">
                        <div className="flex items-end -mt-16 mb-4">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600">
                                {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div className="ml-6 pb-4">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {user.firstName} {user.lastName}
                                    </h1>
                                    {user.isVerified && (
                                        <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                                            ✓ Verified
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 capitalize">{user.userType}</p>
                                <p className="text-sm text-gray-500">
                                    {user.location?.city && user.location?.country
                                        ? `${user.location.city}, ${user.location.country}`
                                        : 'Location not specified'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Basic Information</h2>
                                <button
                                    onClick={() => setEditBasicInfo(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Edit
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Email</label>
                                    <p className="text-gray-900">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">User Type</label>
                                    <p className="text-gray-900 capitalize">{user.userType}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Member Since</label>
                                    <p className="text-gray-900">
                                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Location</h2>
                                <button
                                    onClick={() => setEditLocation(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Edit
                                </button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-900">
                                    {user.location?.city || 'City not specified'}
                                </p>
                                <p className="text-gray-600">
                                    {user.location?.country || 'Country not specified'}
                                </p>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Skills</h2>
                                <button
                                    onClick={() => setEditSkills(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Edit
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {user.skills && user.skills.length > 0 ? (
                                    user.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No skills added yet</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Professional Summary */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Professional Summary</h2>
                                <button
                                    onClick={() => setEditSummary(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Edit
                                </button>
                            </div>
                            <div>
                                {user.professionalSummary ? (
                                    <p className="text-gray-700 leading-relaxed">{user.professionalSummary}</p>
                                ) : (
                                    <p className="text-gray-500 italic">
                                        Add a professional summary to tell others about your background and goals.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Work Experience */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Work Experience</h2>
                                <button
                                    onClick={() => setEditExperience(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Add Experience
                                </button>
                            </div>
                            <div className="space-y-4">
                                {user.workExperience && user.workExperience.length > 0 ? (
                                    user.workExperience.map((exp, index) => (
                                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                                            <h3 className="font-medium text-gray-900">{exp.position}</h3>
                                            <p className="text-blue-600">{exp.company}</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(exp.startDate).toLocaleDateString()} - {
                                                    exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'
                                                }
                                            </p>
                                            {exp.description && (
                                                <p className="text-gray-700 mt-2">{exp.description}</p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No work experience added yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Education</h2>
                                <button
                                    onClick={() => setEditEducation(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Add Education
                                </button>
                            </div>
                            <div className="space-y-4">
                                {user.education && user.education.length > 0 ? (
                                    user.education.map((edu, index) => (
                                        <div key={index} className="border-l-4 border-green-500 pl-4">
                                            <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                                            <p className="text-green-600">{edu.institution}</p>
                                            <p className="text-sm text-gray-600">
                                                {edu.fieldOfStudy} • Class of {edu.graduationYear}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No education added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* All Modals */}

            {/* Edit Basic Info Modal */}
            <EditModal isOpen={editBasicInfo} onClose={() => setEditBasicInfo(false)} title="Edit Basic Information">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                            type="text"
                            value={basicInfoForm.firstName}
                            onChange={(e) => setBasicInfoForm({ ...basicInfoForm, firstName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                            type="text"
                            value={basicInfoForm.lastName}
                            onChange={(e) => setBasicInfoForm({ ...basicInfoForm, lastName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                        <select
                            value={basicInfoForm.userType}
                            onChange={(e) => setBasicInfoForm({ ...basicInfoForm, userType: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="candidate">Job Candidate</option>
                            <option value="employee">Current/Former Employee</option>
                            <option value="recruiter">Recruiter</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSaveBasicInfo}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={() => setEditBasicInfo(false)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </EditModal>

            {/* Edit Location Modal */}
            <EditModal isOpen={editLocation} onClose={() => setEditLocation(false)} title="Edit Location">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                            type="text"
                            value={locationForm.city}
                            onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input
                            type="text"
                            value={locationForm.country}
                            onChange={(e) => setLocationForm({ ...locationForm, country: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSaveLocation}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={() => setEditLocation(false)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </EditModal>

            {/* Edit Summary Modal */}
            <EditModal isOpen={editSummary} onClose={() => setEditSummary(false)} title="Edit Professional Summary">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                        <textarea
                            value={summaryForm}
                            onChange={(e) => setSummaryForm(e.target.value)}
                            rows={6}
                            maxLength={1000}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Tell us about your professional background, goals, and what makes you unique..."
                        />
                        <p className="text-sm text-gray-500 mt-1">{summaryForm.length}/1000 characters</p>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSaveSummary}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={() => setEditSummary(false)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </EditModal>

            {/* Edit Skills Modal */}
            <EditModal isOpen={editSkills} onClose={() => setEditSkills(false)} title="Edit Skills">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Add New Skill</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., JavaScript, Project Management"
                            />
                            <button
                                onClick={addSkill}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Skills</label>
                        <div className="flex flex-wrap gap-2">
                            {skillsForm.map((skill, index) => (
                                <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                >
                                    {skill}
                                    <button
                                        onClick={() => removeSkill(skill)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSaveSkills}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={() => setEditSkills(false)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </EditModal>

            {/* Add Experience Modal */}
            <EditModal isOpen={editExperience} onClose={() => setEditExperience(false)} title="Add Work Experience">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                            type="text"
                            value={experienceForm.company}
                            onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input
                            type="text"
                            value={experienceForm.position}
                            onChange={(e) => setExperienceForm({ ...experienceForm, position: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={experienceForm.startDate}
                                onChange={(e) => setExperienceForm({ ...experienceForm, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                value={experienceForm.endDate}
                                onChange={(e) => setExperienceForm({ ...experienceForm, endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={experienceForm.description}
                            onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Describe your responsibilities and achievements..."
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleAddExperience}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add Experience
                        </button>
                        <button
                            onClick={() => setEditExperience(false)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </EditModal>

            {/* Add Education Modal */}
            <EditModal isOpen={editEducation} onClose={() => setEditEducation(false)} title="Add Education">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                        <input
                            type="text"
                            value={educationForm.institution}
                            onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                        <input
                            type="text"
                            value={educationForm.degree}
                            onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Bachelor of Science, Master of Arts"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                        <input
                            type="text"
                            value={educationForm.fieldOfStudy}
                            onChange={(e) => setEducationForm({ ...educationForm, fieldOfStudy: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Computer Science, Business Administration"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                        <input
                            type="number"
                            min="1950"
                            max="2030"
                            value={educationForm.graduationYear}
                            onChange={(e) => setEducationForm({ ...educationForm, graduationYear: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleAddEducation}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add Education
                        </button>
                        <button
                            onClick={() => setEditEducation(false)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </EditModal>
        </div>
    );
};

export default UserProfile;