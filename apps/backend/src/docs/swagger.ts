export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'AI Interview Platform API',
    version: '1.0.0',
    description: 'Autonomous Technical Hiring Platform — Phase 0 API Specification',
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local development server',
    },
  ],
  paths: {
    '/api/v1/health': {
      get: {
        summary: 'Health Check',
        description: 'Returns 200 OK if API server is running',
        responses: {
          '200': {
            description: 'API is healthy',
          },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        summary: 'Get Current Authenticated User',
        description: 'Returns the current user session and active role',
        responses: {
          '200': { description: 'Current user data' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/v1/auth/role': {
      put: {
        summary: 'Switch Active Role (Demo mode)',
        description: 'Updates active role for the demo user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  role: {
                    type: 'string',
                    enum: ['candidate', 'recruiter', 'interviewer', 'admin'],
                  },
                },
                required: ['role'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Role switched successfully' },
          '400': { description: 'Invalid role' },
        },
      },
    },
    '/api/v1/profiles/me': {
      get: {
        summary: 'Get My Candidate Profile',
        description: 'Returns the candidate profile for the authenticated user',
        responses: {
          '200': { description: 'Candidate profile data' },
          '401': { description: 'Unauthorized' },
        },
      },
      put: {
        summary: 'Update My Candidate Profile',
        description: 'Updates skills, education, experience, and socials for the candidate profile',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  skills: { type: 'array', items: { type: 'string' } },
                  education: { type: 'array', items: { type: 'object' } },
                  experience: { type: 'array', items: { type: 'object' } },
                  github_url: { type: 'string' },
                  linkedin_url: { type: 'string' },
                  portfolio_url: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated profile data' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/api/v1/profiles/{userId}': {
      get: {
        summary: 'Get Candidate Profile by User ID',
        description: 'Protected endpoint for recruiters/interviewers to read candidate profiles',
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Candidate profile data' },
          '403': { description: 'Forbidden (RLS / Role restriction)' },
          '404': { description: 'Profile not found' },
        },
      },
    },
  },
};
