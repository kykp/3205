import { UrlCheckService } from './url-check.service';

describe('UrlCheckService', () => {
  let service: UrlCheckService;
  const originalFetch = global.fetch;

  beforeEach(() => {
    service = new UrlCheckService();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns httpStatus on ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200 } as Response);

    const result = await service.check('https://example.com');

    expect(result).toEqual({ httpStatus: 200 });
  });

  it('keeps httpStatus even when server returns 405 for HEAD', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 405 } as Response);

    const result = await service.check('https://example.com');

    expect(result).toEqual({ httpStatus: 405 });
  });

  it('returns errorMessage when fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('boom'));

    const result = await service.check('https://example.com');

    expect(result.httpStatus).toBeUndefined();
    expect(result.errorMessage).toContain('boom');
  });
});
