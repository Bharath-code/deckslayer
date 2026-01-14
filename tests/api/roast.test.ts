import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock dependencies
vi.mock('@supabase/ssr', () => ({
    createServerClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } } })),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            single: vi.fn(() => Promise.resolve({ data: { id: 'test-roast-id' }, error: null })),
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
    }) as unknown as SupabaseClient),
}));

vi.mock('next/headers', () => ({
    cookies: vi.fn(() => ({
        getAll: vi.fn(() => []),
        set: vi.fn(),
    })),
}));

vi.mock('ai', () => ({
    generateText: vi.fn(() => Promise.resolve({ text: 'Mocked agent analysis text' })),
    streamObject: vi.fn(() => ({
        toTextStreamResponse: () => new Response('{}', { status: 200 }),
    })),
}));

vi.mock('@ai-sdk/google', () => ({
    google: vi.fn(() => ({})),
}));

describe('/api/roast', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 for unauthenticated users', async () => {
        // Override mock for this test
        const { createServerClient } = await import('@supabase/ssr');
        vi.mocked(createServerClient).mockImplementationOnce(() => ({
            auth: {
                getUser: vi.fn(() => Promise.resolve({ data: { user: null } })),
            },
            from: vi.fn(),
        }) as unknown as SupabaseClient);

        const { POST } = await import('@/app/api/roast/route');
        const mockRequest = new Request('http://localhost:3000/api/roast', {
            method: 'POST',
            body: new FormData(),
        }) as unknown as NextRequest;

        const response = await POST(mockRequest);
        expect(response.status).toBe(401);
    });

    it('should return 402 for users with zero credits', async () => {
        const { createServerClient } = await import('@supabase/ssr');
        vi.mocked(createServerClient).mockImplementationOnce(() => ({
            auth: {
                getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } } })),
            },
            from: vi.fn(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn(() => Promise.resolve({ data: [] })), // No credits
            })),
        }) as unknown as SupabaseClient);

        const { POST } = await import('@/app/api/roast/route');
        const mockRequest = new Request('http://localhost:3000/api/roast', {
            method: 'POST',
            body: new FormData(),
        }) as unknown as NextRequest;

        const response = await POST(mockRequest);
        expect(response.status).toBe(402);
    });

    it('should return 400 when no file is uploaded', async () => {
        const { createServerClient } = await import('@supabase/ssr');
        vi.mocked(createServerClient).mockImplementationOnce(() => ({
            auth: {
                getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } } })),
            },
            from: vi.fn(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn(() => Promise.resolve({ data: [{ amount: 5 }] })), // Has credits
            })),
        }) as unknown as SupabaseClient);

        const { POST } = await import('@/app/api/roast/route');
        const formData = new FormData();
        // Don't append any file

        const mockRequest = new Request('http://localhost:3000/api/roast', {
            method: 'POST',
            body: formData,
        }) as unknown as NextRequest;

        const response = await POST(mockRequest);
        expect(response.status).toBe(400);
    });
});
