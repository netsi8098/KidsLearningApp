const fetchMock = vi.fn();

vi.mock('../../../src/config', () => ({
  getSemanticUrls: () => ['http://localhost:5555'],
}));

describe('semanticService', () => {
  beforeEach(async () => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    const { resetSemanticServiceStatus } = await import('../../../src/services/semanticService');
    resetSemanticServiceStatus();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns ranked matches when the local service is healthy', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ matches: [{ id: 'story:moon', score: 0.72 }] }),
      });

    const { semanticSearch } = await import('../../../src/services/semanticService');
    const result = await semanticSearch('a calm bedtime story', [
      { id: 'story:moon', text: 'Goodnight Moon bedtime sleep' },
    ]);

    expect(result).toEqual([{ id: 'story:moon', score: 0.72 }]);
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:5555/semantic/search',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('returns null without sending content when health check fails', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'));

    const { semanticSearch } = await import('../../../src/services/semanticService');
    const result = await semanticSearch('numbers', [
      { id: 'number:one', text: 'Learn number one' },
    ]);

    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
