import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('ai', () => ({
    generateText: vi.fn(() => Promise.resolve({ text: 'Mocked rebuttal from Sarah' })),
}));

vi.mock('@ai-sdk/google', () => ({
    google: vi.fn(() => ({})),
}));

describe('/api/interrogate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return a rebuttal for valid input', async () => {
        const { POST } = await import('@/app/api/interrogate/route');

        const mockRequest = new Request('http://localhost:3000/api/interrogate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                killerQuestion: 'Why should anyone care?',
                userAnswer: 'Because we solve a real problem.',
                context: 'A B2B SaaS startup',
            }),
        }) as unknown as NextRequest;

        const response = await POST(mockRequest);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.judgement).toBeDefined();
    });

    it('should return 400 for missing killerQuestion', async () => {
        const { POST } = await import('@/app/api/interrogate/route');

        const mockRequest = new Request('http://localhost:3000/api/interrogate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userAnswer: 'Because we solve a real problem.',
                context: 'A B2B SaaS startup',
            }),
        }) as unknown as NextRequest;

        const response = await POST(mockRequest);
        expect(response.status).toBe(400);
    });

    it('should return 400 for missing userAnswer', async () => {
        const { POST } = await import('@/app/api/interrogate/route');

        const mockRequest = new Request('http://localhost:3000/api/interrogate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                killerQuestion: 'Why should anyone care?',
                context: 'A B2B SaaS startup',
            }),
        }) as unknown as NextRequest;

        const response = await POST(mockRequest);
        expect(response.status).toBe(400);
    });
});
