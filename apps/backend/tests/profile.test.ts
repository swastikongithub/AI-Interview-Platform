import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { getTestBearerToken } from './helpers/testToken';

describe('Candidate Profile CRUD & Role Guard Endpoints', () => {
  let candidateToken: string;
  let recruiterToken: string;

  beforeAll(async () => {
    candidateToken = await getTestBearerToken(
      'candidate.demo@antigravity.dev',
      'password123',
      '11111111-1111-4111-8111-111111111111'
    );
    recruiterToken = await getTestBearerToken(
      'recruiter.demo@antigravity.dev',
      'password123',
      '22222222-2222-4222-8222-222222222222'
    );
  });

  it('GET /api/v1/profiles/me should return current user profile', async () => {
    const res = await request(app)
      .get('/api/v1/profiles/me')
      .set('Authorization', candidateToken);

    expect(res.status).toBe(200);
    expect(res.body.name).toContain('Alex Candidate');
    expect(res.body.skills).toContain('TypeScript');
  });

  it('PUT /api/v1/profiles/me should update candidate profile fields', async () => {
    const updatePayload = {
      name: 'Alex Candidate Updated',
      education: [
        {
          institution: 'MIT',
          degree: 'M.S. Computer Science',
          year: '2026',
        },
      ],
      experience: [
        {
          company: 'Google DeepMind',
          role: 'AI Researcher Intern',
          duration: '2024-Present',
          description: 'Working on agentic coding assistants.',
        },
      ],
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Python', 'AI/ML'],
      github_url: 'https://github.com/alexcandidate-dev',
      linkedin_url: 'https://linkedin.com/in/alexcandidate',
      portfolio_url: 'https://alexcandidate.dev',
    };

    const res = await request(app)
      .put('/api/v1/profiles/me')
      .set('Authorization', candidateToken)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Profile updated successfully');
    expect(res.body.profile.name).toBe('Alex Candidate Updated');
    expect(res.body.profile.skills).toContain('Python');
    expect(res.body.profile.education[0].institution).toBe('MIT');

    // Reset back to original values for subsequent tests in other suites
    await request(app)
      .put('/api/v1/profiles/me')
      .set('Authorization', candidateToken)
      .send({
        name: 'Alex Candidate',
        education: [
          {
            institution: 'Stanford University',
            degree: 'B.S. Computer Science',
            year: '2024',
          },
        ],
        experience: [
          {
            company: 'Tech Corp',
            role: 'Software Engineer Intern',
            duration: 'Summer 2023',
            description: 'Built React and TypeScript web apps.',
          },
        ],
        skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Next.js'],
      });
  });

  it('PUT /api/v1/profiles/me should reject invalid URLs (Zod validation)', async () => {
    const res = await request(app)
      .put('/api/v1/profiles/me')
      .set('Authorization', candidateToken)
      .send({
        name: 'Alex Candidate',
        skills: ['TypeScript'],
        github_url: 'not-a-valid-url',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('GET /api/v1/profiles/:userId should allow recruiters to view candidate profile (RLS/RBAC check)', async () => {
    const res = await request(app)
      .get('/api/v1/profiles/11111111-1111-4111-8111-111111111111')
      .set('Authorization', recruiterToken);

    expect(res.status).toBe(200);
    expect(res.body.user_id).toBe('11111111-1111-4111-8111-111111111111');
  });
});
