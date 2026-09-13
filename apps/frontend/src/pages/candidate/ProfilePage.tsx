import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { CandidateProfile, EducationItem, ExperienceItem } from '../../types';
import { ResumeUploader } from '../../components/candidate/ResumeUploader';
import { JobRecommendations } from '../../components/candidate/JobRecommendations';

import { Save, Trash2, Check, AlertCircle } from 'lucide-react';
import { PageTransition } from '../../motion/PageTransition';
import { Reveal } from '../../motion/Reveal';
import { MaskedTextReveal } from '../../motion/MaskedTextReveal';
import { SectionTransition } from '../../motion/SectionTransition';
import { Parallax } from '../../motion/Parallax';

import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';

export const ProfilePage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<CandidateProfile>>({
    name: '',
    skills: [],
    education: [],
    experience: [],
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        skills: profile.skills || [],
        education: profile.education || [],
        experience: profile.experience || [],
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        portfolio_url: profile.portfolio_url || '',
      });
    }
  }, [profile]);

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const current = formData.skills || [];
    if (!current.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...current, newSkill.trim()] });
    }
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: (formData.skills || []).filter((s) => s !== skillToRemove),
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...(formData.education || []),
        { institution: '', degree: '', year: '' },
      ],
    });
  };

  const updateEducation = (index: number, key: keyof EducationItem, value: string) => {
    const updated = [...(formData.education || [])];
    updated[index] = { ...updated[index], [key]: value };
    setFormData({ ...formData, education: updated });
  };

  const removeEducation = (index: number) => {
    const updated = [...(formData.education || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, education: updated });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...(formData.experience || []),
        { company: '', role: '', duration: '', description: '' },
      ],
    });
  };

  const updateExperience = (
    index: number,
    key: keyof ExperienceItem,
    value: string
  ) => {
    const updated = [...(formData.experience || [])];
    updated[index] = { ...updated[index], [key]: value };
    setFormData({ ...formData, experience: updated });
  };

  const removeExperience = (index: number) => {
    const updated = [...(formData.experience || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, experience: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      await apiService.updateMyProfile(formData);
      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const error = err as any;
      console.error('Save error:', error);
      setErrorMessage(
        error.response?.data?.error || 'Failed to update profile. Check your input URLs and format.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageTransition className="font-sans min-h-screen pb-32">
      
      {/* Cinematic Header */}
      <section className="relative px-6 md:px-12 pt-32 pb-16 max-w-[1400px] mx-auto border-b border-line">
        <Parallax offset={30} className="max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
            <div>
              <span className="font-mono text-[10px] tracking-widest uppercase text-accent border-b border-line pb-1 inline-block mb-8">
                Identity & Telemetry Dossier
              </span>
              <h1 className="text-5xl md:text-7xl font-serif text-ink tracking-tight mb-4">
                <MaskedTextReveal text="Candidate Profile" delay={0.1} />
              </h1>
            </div>

            <Reveal delay={0.4} className="flex items-center gap-4 shrink-0 mb-2">
              {saveSuccess && (
                <span className="text-[10px] font-mono uppercase tracking-widest text-good flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" /> Synchronized
                </span>
              )}
              <Button
                type="button"
                variant="primary"
                disabled={isSaving}
                isLoading={isSaving}
                onClick={handleSubmit}
                className="font-mono text-[10px] uppercase tracking-widest px-8"
              >
                {!isSaving && <Save className="w-3.5 h-3.5 mr-2" />}
                Commit Changes
              </Button>
            </Reveal>
          </div>
        </Parallax>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-16">
        <div className="flex flex-col lg:flex-row gap-16 md:gap-24">
          
          {/* Main Dossier Content */}
          <main className="lg:w-2/3 space-y-32 order-2 lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-32">
              
              {errorMessage && (
                <SectionTransition>
                  <div className="p-4 bg-critical/5 border border-critical/20 flex items-start gap-3 text-critical text-sm font-sans rounded-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>{errorMessage}</span>
                  </div>
                </SectionTransition>
              )}

              {/* Basic Information */}
              <Reveal delay={0.5} y={40} className="space-y-12">
                <div className="border-b border-line pb-4 flex items-end justify-between">
                  <h2 className="text-4xl font-serif text-ink">Personal Telemetry</h2>
                  <span className="font-mono text-[10px] text-ink-faint uppercase tracking-widest">Base Identity</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="md:col-span-2">
                    <Input
                      label="Candidate Designation (Full Name)"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Alex Candidate"
                      required
                    />
                  </div>
                  <Input
                    label="GitHub Repository Link"
                    type="url"
                    value={formData.github_url || ''}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/username"
                  />
                  <Input
                    label="LinkedIn Profile"
                    type="url"
                    value={formData.linkedin_url || ''}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Personal Documentation / Portfolio"
                      type="url"
                      value={formData.portfolio_url || ''}
                      onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                      placeholder="https://yourportfolio.dev"
                    />
                  </div>
                </div>
              </Reveal>

              {/* Technical Skills */}
              <Reveal delay={0.6} y={40} className="space-y-12">
                <div className="border-b border-line pb-4 flex items-end justify-between">
                  <h2 className="text-4xl font-serif text-ink">Technical Vectors</h2>
                  <span className="font-mono text-[10px] text-ink-faint uppercase tracking-widest">{(formData.skills || []).length} Recorded</span>
                </div>

                <div className="space-y-8">
                  <div className="flex items-end gap-6">
                    <div className="flex-1">
                      <Input
                        label="Append Skill Vector"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                        placeholder="e.g. TypeScript, System Design, PostgreSQL..."
                      />
                    </div>
                    <Button type="button" variant="secondary" onClick={addSkill} className="font-mono text-[10px] uppercase tracking-widest h-[42px] px-8">
                      Append
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-3 p-8 border border-dashed border-line bg-paper/50">
                    {(formData.skills || []).map((skill) => (
                      <SectionTransition key={skill}>
                        <span className="inline-flex items-center gap-3 px-4 py-2 rounded-sm bg-paper-raised border border-line text-ink font-mono text-xs uppercase tracking-widest shadow-sm group">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-ink-faint hover:text-critical transition-colors"
                          >
                            &times;
                          </button>
                        </span>
                      </SectionTransition>
                    ))}
                    {(formData.skills || []).length === 0 && (
                      <p className="text-sm text-ink-muted font-sans font-light">No technical vectors appended yet.</p>
                    )}
                  </div>
                </div>
              </Reveal>

              {/* Professional Experience */}
              <Reveal delay={0.7} y={40} className="space-y-12">
                <div className="border-b border-line pb-4 flex items-end justify-between">
                  <h2 className="text-4xl font-serif text-ink">Execution History</h2>
                  <Button type="button" variant="ghost" onClick={addExperience} className="font-mono text-[10px] uppercase tracking-widest h-auto py-1 px-0">
                    + Add Experience
                  </Button>
                </div>

                <div className="space-y-16">
                  {(formData.experience || []).map((exp, index) => (
                    <SectionTransition key={index}>
                      <div className="relative pl-8 md:pl-12 border-l border-line space-y-8">
                        <div className="absolute -left-4 top-0 bg-paper py-2">
                          <div className="w-8 h-8 rounded-full border border-line bg-paper-raised flex items-center justify-center font-serif text-ink">
                            {index + 1}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeExperience(index)}
                            className="text-[10px] font-mono uppercase tracking-widest text-ink-faint hover:text-critical transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Entry
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                          <Input
                            label="Organization"
                            value={exp.company}
                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                            placeholder="Tech Corp"
                          />
                          <Input
                            label="Operational Duration"
                            value={exp.duration}
                            onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                            placeholder="2020 - 2023"
                          />
                          <div className="md:col-span-2">
                            <Input
                              label="Role Designation"
                              value={exp.role}
                              onChange={(e) => updateExperience(index, 'role', e.target.value)}
                              placeholder="Senior Software Engineer"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Textarea
                              label="Architectural Achievements"
                              value={exp.description || ''}
                              onChange={(e) => updateExperience(index, 'description', e.target.value)}
                              placeholder="Describe your structural responsibilities and analytical achievements..."
                            />
                          </div>
                        </div>
                      </div>
                    </SectionTransition>
                  ))}
                  {(formData.experience || []).length === 0 && (
                    <p className="text-sm text-ink-muted font-sans font-light pl-8 border-l border-line py-2">
                      No operational history recorded.
                    </p>
                  )}
                </div>
              </Reveal>

              {/* Education Background */}
              <Reveal delay={0.8} y={40} className="space-y-12">
                <div className="border-b border-line pb-4 flex items-end justify-between">
                  <h2 className="text-4xl font-serif text-ink">Academic Foundation</h2>
                  <Button type="button" variant="ghost" onClick={addEducation} className="font-mono text-[10px] uppercase tracking-widest h-auto py-1 px-0">
                    + Add Education
                  </Button>
                </div>

                <div className="space-y-16">
                  {(formData.education || []).map((edu, index) => (
                    <SectionTransition key={index}>
                      <div className="relative pl-8 md:pl-12 border-l border-line space-y-8">
                        <div className="absolute -left-4 top-0 bg-paper py-2">
                          <div className="w-8 h-8 rounded-full border border-line bg-paper-raised flex items-center justify-center font-serif text-ink">
                            {index + 1}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeEducation(index)}
                            className="text-[10px] font-mono uppercase tracking-widest text-ink-faint hover:text-critical transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Entry
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                          <div className="md:col-span-2">
                            <Input
                              label="Institution"
                              value={edu.institution}
                              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                              placeholder="Stanford University"
                            />
                          </div>
                          <Input
                            label="Degree / Classification"
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            placeholder="B.S. Computer Science"
                          />
                          <Input
                            label="Cohort Year"
                            value={edu.year}
                            onChange={(e) => updateEducation(index, 'year', e.target.value)}
                            placeholder="2024"
                          />
                        </div>
                      </div>
                    </SectionTransition>
                  ))}
                  {(formData.education || []).length === 0 && (
                    <p className="text-sm text-ink-muted font-sans font-light pl-8 border-l border-line py-2">
                      No academic history recorded.
                    </p>
                  )}
                </div>
              </Reveal>

            </form>
          </main>

          {/* Sidebar / ATS Context */}
          <aside className="lg:w-1/3 order-1 lg:order-2 space-y-16">
            <Reveal delay={0.6} y={30}>
              <ResumeUploader onProfileUpdated={refreshProfile} />
            </Reveal>

            <Reveal delay={0.7} y={30}>
              <JobRecommendations />
            </Reveal>
          </aside>

        </div>
      </div>
    </PageTransition>
  );
};
