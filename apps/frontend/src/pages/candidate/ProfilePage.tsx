import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Plus, Sparkles, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { describeError, safeHttpUrl } from '../../lib/format';
import type { CandidateProfile, EducationItem, ExperienceItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { TextAreaField, TextField } from '../../components/ui/Field';
import { PageHeader } from '../../components/ui/Layout';
import { useToast } from '../../components/ui/Toast';
import { ease, transitions } from '../../motion/tokens';
import { cn } from '../../utils/cn';

type Keyed<T> = T & { _key: string };

interface FormState {
  name: string;
  github_url: string;
  linkedin_url: string;
  portfolio_url: string;
  skills: string[];
  experience: Keyed<ExperienceItem>[];
  education: Keyed<EducationItem>[];
}

type Errors = Record<string, string>;

let keySeq = 0;
const newKey = () => `k${++keySeq}`;

function fromProfile(p: CandidateProfile | null): FormState {
  return {
    name: p?.name ?? '',
    github_url: p?.github_url ?? '',
    linkedin_url: p?.linkedin_url ?? '',
    portfolio_url: p?.portfolio_url ?? '',
    skills: p?.skills ?? [],
    experience: (p?.experience ?? []).map((e) => ({ ...e, description: e.description ?? '', _key: newKey() })),
    education: (p?.education ?? []).map((e) => ({ ...e, _key: newKey() })),
  };
}

function serialize(f: FormState) {
  return {
    name: f.name.trim(),
    github_url: f.github_url.trim(),
    linkedin_url: f.linkedin_url.trim(),
    portfolio_url: f.portfolio_url.trim(),
    skills: f.skills,
    experience: f.experience.map(({ _key, ...e }) => ({
      company: e.company.trim(),
      role: e.role.trim(),
      duration: e.duration.trim(),
      ...(e.description?.trim() ? { description: e.description.trim() } : {}),
    })),
    education: f.education.map(({ _key, ...e }) => ({
      institution: e.institution.trim(),
      degree: e.degree.trim(),
      year: e.year.trim(),
    })),
  };
}

/** Mirrors the API's Zod schema so problems surface before a round-trip. */
function validate(f: FormState): Errors {
  const errors: Errors = {};
  if (!f.name.trim()) errors.name = 'Enter your full name.';
  else if (f.name.trim().length > 100) errors.name = 'Keep your name under 100 characters.';
  (['github_url', 'linkedin_url', 'portfolio_url'] as const).forEach((k) => {
    const v = f[k].trim();
    if (v && !safeHttpUrl(v)) errors[k] = 'Enter a full link starting with https://';
  });
  f.experience.forEach((e, i) => {
    if (!e.company.trim()) errors[`experience.${i}.company`] = 'Company is required.';
    if (!e.role.trim()) errors[`experience.${i}.role`] = 'Role is required.';
    if (!e.duration.trim()) errors[`experience.${i}.duration`] = 'Dates are required.';
  });
  f.education.forEach((e, i) => {
    if (!e.institution.trim()) errors[`education.${i}.institution`] = 'Institution is required.';
    if (!e.degree.trim()) errors[`education.${i}.degree`] = 'Degree is required.';
    if (!e.year.trim()) errors[`education.${i}.year`] = 'Year is required.';
  });
  return errors;
}

const sections = [
  { id: 'basics', label: 'Basics' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
];

export const ProfilePage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const { notify } = useToast();
  const reduce = useReducedMotion();
  const [form, setForm] = useState<FormState>(() => fromProfile(profile));
  const [baseline, setBaseline] = useState(() => JSON.stringify(serialize(fromProfile(profile))));
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [skillDraft, setSkillDraft] = useState('');
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  // Re-seed only when the stored profile itself changes (e.g. after save or résumé import).
  const profileSignature = JSON.stringify(serialize(fromProfile(profile)));
  useEffect(() => {
    setForm(fromProfile(profile));
    setBaseline(profileSignature);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileSignature]);

  const dirty = JSON.stringify(serialize(form)) !== baseline;
  const liveErrors = submitted ? validate(form) : {};
  const shownErrors = { ...liveErrors, ...errors };

  const save = useMutation({
    mutationFn: () => apiService.updateMyProfile(serialize(form)),
    onSuccess: async () => {
      await refreshProfile();
      setErrors({});
      setSubmitted(false);
      notify({ tone: 'success', title: 'Profile saved' });
    },
    onError: (err) => {
      const info = describeError(err, 'Your profile could not be saved.');
      const data: any = axios.isAxiosError(err) ? err.response?.data : null;
      if (Array.isArray(data?.details)) {
        const serverErrors: Errors = {};
        data.details.forEach((d: { path: string; message: string }) => {
          if (d.path) serverErrors[d.path] = d.message;
        });
        setErrors(serverErrors);
      }
      notify({ tone: 'error', title: 'Profile not saved', description: info.message });
    },
  });

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitted(true);
    setErrors({});
    const found = validate(form);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }
    save.mutate();
  };

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const addSkills = (raw: string | string[]) => {
    const incoming = (Array.isArray(raw) ? raw : raw.split(','))
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((f) => {
      const existing = new Set(f.skills.map((s) => s.toLowerCase()));
      const next = [...f.skills];
      incoming.forEach((s) => {
        if (!existing.has(s.toLowerCase())) {
          existing.add(s.toLowerCase());
          next.push(s);
        }
      });
      return { ...f, skills: next };
    });
  };

  const resumeSkills = useMemo(() => {
    const extracted = profile?.resume_extracted_json?.skills ?? [];
    const have = new Set(form.skills.map((s) => s.toLowerCase()));
    return extracted.filter((s) => s && !have.has(s.toLowerCase()));
  }, [profile, form.skills]);

  const errorCount = Object.keys(shownErrors).length;

  return (
    <form onSubmit={handleSave} noValidate>
      <PageHeader
        kicker="Your profile"
        title={<h1>Profile</h1>}
        description="Recruiters and interviewers see this alongside your interviews. Skills also drive your job matches."
        actions={
          <Button type="submit" variant="primary" loading={save.isPending} loadingLabel="Saving…" disabled={!dirty && !save.isPending}>
            {dirty ? 'Save changes' : 'Saved'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="Profile sections" className="hidden lg:block">
          <ul className="sticky top-10 space-y-1 border-l border-edge">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="-ml-px block border-l border-transparent py-1.5 pl-4 text-body-sm text-fg-muted transition-colors duration-quick hover:border-fg hover:text-fg">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl space-y-14">
          {errorCount > 0 && (
            <div
              ref={errorSummaryRef}
              tabIndex={-1}
              role="alert"
              className="rounded-sm bg-negative-soft px-4 py-3 text-body-sm text-negative outline-none focus-visible:outline-2"
            >
              <p className="font-medium">
                {errorCount === 1 ? '1 field needs attention' : `${errorCount} fields need attention`} before saving.
              </p>
            </div>
          )}

          <FormSection id="basics" index="01" title="Basics" description="Your name and where people can see your work.">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <TextField
                containerClassName="sm:col-span-2"
                label="Full name"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                error={shownErrors.name}
              />
              <TextField
                label="GitHub"
                optional
                type="url"
                inputMode="url"
                placeholder="https://github.com/you"
                value={form.github_url}
                onChange={(e) => update('github_url', e.target.value)}
                error={shownErrors.github_url}
              />
              <TextField
                label="LinkedIn"
                optional
                type="url"
                inputMode="url"
                placeholder="https://linkedin.com/in/you"
                value={form.linkedin_url}
                onChange={(e) => update('linkedin_url', e.target.value)}
                error={shownErrors.linkedin_url}
              />
              <TextField
                containerClassName="sm:col-span-2"
                label="Portfolio or website"
                optional
                type="url"
                inputMode="url"
                placeholder="https://"
                value={form.portfolio_url}
                onChange={(e) => update('portfolio_url', e.target.value)}
                error={shownErrors.portfolio_url}
              />
            </div>
          </FormSection>

          <FormSection id="skills" index="02" title="Skills" description="Matched case-insensitively against each job’s required skills.">
            <div className="flex items-end gap-2">
              <TextField
                containerClassName="flex-1"
                label="Add a skill"
                hint="Press Enter to add. Separate several with commas."
                placeholder="e.g. PostgreSQL"
                value={skillDraft}
                onChange={(e) => setSkillDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (skillDraft.trim()) {
                      addSkills(skillDraft);
                      setSkillDraft('');
                    }
                  }
                }}
              />
              <Button
                variant="secondary"
                className="mb-6"
                disabled={!skillDraft.trim()}
                onClick={() => {
                  addSkills(skillDraft);
                  setSkillDraft('');
                }}
              >
                Add
              </Button>
            </div>

            {resumeSkills.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-sm bg-signal-soft px-4 py-3">
                <Sparkles className="size-4 text-signal-text" aria-hidden="true" />
                <p className="flex-1 text-body-sm text-fg">
                  Your résumé lists {resumeSkills.length} {resumeSkills.length === 1 ? 'skill' : 'skills'} not on your profile.
                </p>
                <Button size="sm" variant="primary" onClick={() => addSkills(resumeSkills)}>
                  Add from résumé
                </Button>
              </div>
            )}

            <ul className="mt-5 flex min-h-10 flex-wrap gap-2" aria-label="Your skills">
              <AnimatePresence initial={false} mode="popLayout">
                {form.skills.map((skill) => (
                  <motion.li
                    key={skill}
                    layout={!reduce}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
                    animate={reduce ? { opacity: 1 } : { opacity: 1, transform: 'scale(1)' }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
                    transition={transitions.popover}
                    className="inline-flex h-8 items-center gap-1 rounded-sm bg-surface pl-3 pr-1 text-body-sm text-fg shadow-hairline"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => update('skills', form.skills.filter((s) => s !== skill))}
                      className="pressable grid size-6 place-items-center rounded-xs text-fg-muted hover:bg-surface-hover hover:text-negative"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
              {form.skills.length === 0 && <li className="py-1.5 text-body-sm text-fg-muted">No skills yet. Add a few to unlock job matching.</li>}
            </ul>
          </FormSection>

          <FormSection
            id="experience"
            index="03"
            title="Experience"
            description="Most recent first."
            actions={
              <Button
                variant="secondary"
                size="sm"
                leadingIcon={<Plus />}
                onClick={() => update('experience', [...form.experience, { company: '', role: '', duration: '', description: '', _key: newKey() }])}
              >
                Add role
              </Button>
            }
          >
            <RepeatList
              items={form.experience}
              emptyText="No roles added."
              render={(item, i) => (
                <EntryFrame
                  label={item.role || item.company ? `${item.role || 'Role'}${item.company ? ` at ${item.company}` : ''}` : `Role ${i + 1}`}
                  onRemove={() => update('experience', form.experience.filter((e) => e._key !== item._key))}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextField
                      label="Role"
                      required
                      value={item.role}
                      onChange={(e) => update('experience', form.experience.map((x) => (x._key === item._key ? { ...x, role: e.target.value } : x)))}
                      error={shownErrors[`experience.${i}.role`]}
                    />
                    <TextField
                      label="Company"
                      required
                      value={item.company}
                      onChange={(e) => update('experience', form.experience.map((x) => (x._key === item._key ? { ...x, company: e.target.value } : x)))}
                      error={shownErrors[`experience.${i}.company`]}
                    />
                    <TextField
                      containerClassName="sm:col-span-2"
                      label="Dates"
                      required
                      placeholder="e.g. 2021 – 2024"
                      value={item.duration}
                      onChange={(e) => update('experience', form.experience.map((x) => (x._key === item._key ? { ...x, duration: e.target.value } : x)))}
                      error={shownErrors[`experience.${i}.duration`]}
                    />
                    <TextAreaField
                      containerClassName="sm:col-span-2"
                      label="What you did"
                      optional
                      rows={3}
                      value={item.description ?? ''}
                      onChange={(e) => update('experience', form.experience.map((x) => (x._key === item._key ? { ...x, description: e.target.value } : x)))}
                    />
                  </div>
                </EntryFrame>
              )}
            />
          </FormSection>

          <FormSection
            id="education"
            index="04"
            title="Education"
            actions={
              <Button
                variant="secondary"
                size="sm"
                leadingIcon={<Plus />}
                onClick={() => update('education', [...form.education, { institution: '', degree: '', year: '', _key: newKey() }])}
              >
                Add education
              </Button>
            }
          >
            <RepeatList
              items={form.education}
              emptyText="No education added."
              render={(item, i) => (
                <EntryFrame
                  label={item.institution || `Education ${i + 1}`}
                  onRemove={() => update('education', form.education.filter((e) => e._key !== item._key))}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
                    <TextField
                      containerClassName="sm:col-span-2"
                      label="Institution"
                      required
                      value={item.institution}
                      onChange={(e) => update('education', form.education.map((x) => (x._key === item._key ? { ...x, institution: e.target.value } : x)))}
                      error={shownErrors[`education.${i}.institution`]}
                    />
                    <TextField
                      label="Degree"
                      required
                      value={item.degree}
                      onChange={(e) => update('education', form.education.map((x) => (x._key === item._key ? { ...x, degree: e.target.value } : x)))}
                      error={shownErrors[`education.${i}.degree`]}
                    />
                    <TextField
                      label="Year"
                      required
                      inputMode="numeric"
                      value={item.year}
                      onChange={(e) => update('education', form.education.map((x) => (x._key === item._key ? { ...x, year: e.target.value } : x)))}
                      error={shownErrors[`education.${i}.year`]}
                    />
                  </div>
                </EntryFrame>
              )}
            />
          </FormSection>
        </div>
      </div>

      <SaveBar visible={dirty} saving={save.isPending} onDiscard={() => { setForm(fromProfile(profile)); setErrors({}); setSubmitted(false); }} />
    </form>
  );
};

const FormSection: React.FC<{
  id: string;
  index: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}> = ({ id, index, title, description, actions, children }) => (
  <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 border-t border-edge pt-6">
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <h2 id={`${id}-title`} className="flex items-baseline gap-3 text-title-lg text-fg">
          <span className="font-mono text-meta text-fg-muted">{index}</span>
          {title}
        </h2>
        {description && <p className="text-body-sm text-fg-muted">{description}</p>}
      </div>
      {actions}
    </div>
    {children}
  </section>
);

function RepeatList<T extends { _key: string }>({
  items,
  emptyText,
  render,
}: {
  items: T[];
  emptyText: string;
  render: (item: T, index: number) => React.ReactNode;
}) {
  const reduce = useReducedMotion();
  if (items.length === 0) return <p className="text-body-sm text-fg-muted">{emptyText}</p>;
  return (
    <ul className="space-y-4">
      <AnimatePresence initial={false}>
        {items.map((item, i) => (
          <motion.li
            key={item._key}
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: ease.out }}
            className="overflow-hidden"
          >
            {render(item, i)}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

const EntryFrame: React.FC<{ label: string; onRemove: () => void; children: React.ReactNode }> = ({ label, onRemove, children }) => (
  // min-w-0: fieldsets default to min-width: min-content and would overflow narrow screens.
  <fieldset className="min-w-0 rounded-md bg-surface p-5 shadow-hairline">
    <legend className="sr-only">{label}</legend>
    <div className="mb-4 flex items-center justify-between gap-3">
      <p className="truncate text-title-sm text-fg" aria-hidden="true">
        {label}
      </p>
      <Button variant="ghost" size="sm" leadingIcon={<Trash2 />} onClick={onRemove} aria-label={`Remove ${label}`} className="-mr-2 hover:text-negative">
        Remove
      </Button>
    </div>
    {children}
  </fieldset>
);

/** Appears only with unsaved changes; slides up from the bottom edge and leaves the same way. */
const SaveBar: React.FC<{ visible: boolean; saving: boolean; onDiscard: () => void }> = ({ visible, saving, onDiscard }) => {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-header flex justify-center p-4 lg:pl-[calc(var(--rail-width)+1rem)]"
          initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(100%)' }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0%)' }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(100%)' }}
          transition={transitions.modal}
        >
          <div className={cn('theme-night pointer-events-auto flex w-full max-w-xl items-center gap-3 rounded-md bg-surface py-2 pl-4 pr-2 text-fg shadow-overlay')}>
            <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
            <p className="flex-1 text-body-sm text-fg-secondary">Unsaved changes</p>
            <Button variant="ghost" size="sm" onClick={onDiscard} disabled={saving}>
              Discard
            </Button>
            <Button type="submit" variant="signal" size="sm" loading={saving} loadingLabel="Saving…">
              Save
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
