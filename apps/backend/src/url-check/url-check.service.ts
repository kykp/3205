import { Injectable } from '@nestjs/common';

export type UrlCheckResult = {
  httpStatus?: number;
  errorMessage?: string;
};

@Injectable()
export class UrlCheckService {
  async check(url: string, timeoutMs = 10_000): Promise<UrlCheckResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });
      return { httpStatus: response.status };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? `${err.name}: ${err.message}` : 'unknown error';
      return { errorMessage };
    } finally {
      clearTimeout(timer);
    }
  }
}
