-- AI Interview Platform — seed.sql
-- Sample test users for the 4 roles: candidate, recruiter, interviewer, admin
-- Note: These UUIDs match the mock auth users for seamless local dev & demo testing.

INSERT INTO public.users (id, email, role, created_at)
VALUES
    ('11111111-1111-4111-8111-111111111111', 'candidate.demo@antigravity.dev', 'candidate', NOW()),
    ('22222222-2222-4222-8222-222222222222', 'recruiter.demo@antigravity.dev', 'recruiter', NOW()),
    ('33333333-3333-4333-8333-333333333333', 'interviewer.demo@antigravity.dev', 'interviewer', NOW()),
    ('44444444-4444-4444-8444-444444444444', 'admin.demo@antigravity.dev', 'admin', NOW())
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- Default sample profile for candidate demo user
INSERT INTO public.profiles (
    user_id,
    name,
    education,
    experience,
    skills,
    github_url,
    linkedin_url,
    portfolio_url,
    ats_score
)
VALUES (
    '11111111-1111-4111-8111-111111111111',
    'Alex Candidate',
    '[{"institution": "Stanford University", "degree": "B.S. Computer Science", "year": "2024"}]'::JSONB,
    '[{"company": "Tech Corp", "role": "Software Engineering Intern", "duration": "Summer 2023", "description": "Built scalable APIs and UI components."}]'::JSONB,
    ARRAY['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    'https://github.com/alexcandidate',
    'https://linkedin.com/in/alexcandidate',
    'https://alexcandidate.dev',
    85
)
ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    skills = EXCLUDED.skills,
    education = EXCLUDED.education,
    experience = EXCLUDED.experience;

-- Sample company for recruiter demo user
INSERT INTO public.companies (id, name, owner_user_id, created_at)
VALUES (
    'c1111111-1111-4111-8111-111111111111',
    'Antigravity Labs',
    '22222222-2222-4222-8222-222222222222',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Sample jobs for job recommendations matching against candidate profile skills
INSERT INTO public.jobs (id, company_id, title, description, jd_raw_text, skills_required, created_at)
VALUES
    (
        'a1111111-1111-4111-8111-111111111111',
        'c1111111-1111-4111-8111-111111111111',
        'Senior Frontend Engineer',
        'Looking for an expert frontend engineer proficient in React and TypeScript.',
        'We require 5+ years of experience building modern UI applications with React, TypeScript, and Tailwind CSS. Next.js experience is a plus.',
        ARRAY['TypeScript', 'React', 'Tailwind CSS', 'Next.js'],
        NOW()
    ),
    (
        'b2222222-2222-4222-8222-222222222222',
        'c1111111-1111-4111-8111-111111111111',
        'Full Stack TypeScript Engineer',
        'Join our core engineering team to build scalable full stack TypeScript web apps.',
        'Experience with TypeScript across frontend (React) and backend (Node.js, PostgreSQL) required. Familiarity with AWS infrastructure.',
        ARRAY['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
        NOW()
    ),
    (
        'c3333333-3333-4333-8333-333333333333',
        'c1111111-1111-4111-8111-111111111111',
        'Backend Systems Engineer',
        'Looking for a systems engineer for high-throughput backend services.',
        'Must have strong skills in Go or Rust, Kubernetes deployment, and PostgreSQL database optimization.',
        ARRAY['Go', 'Rust', 'Kubernetes', 'PostgreSQL'],
        NOW()
    )
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    skills_required = EXCLUDED.skills_required;

