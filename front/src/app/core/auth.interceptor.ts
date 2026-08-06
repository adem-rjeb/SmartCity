import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Attaches Bearer JWT to API calls. Skips login/register so the Authorization
 * header is never sent on public auth endpoints.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isAuthEndpoint = /\/api\/(login|register)$/.test(req.url);

  if (isAuthEndpoint) {
    return next(req);
  }

  const token = localStorage.getItem('smartcity.jwt');
  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
