import { Navigate, useParams } from 'react-router-dom';

interface RedirectWithParamsProps {
  to: string;
}

/**
 * Component to handle redirects with URL parameters
 * Replaces :param placeholders in the 'to' prop with actual URL params
 */
export function RedirectWithParams({ to }: RedirectWithParamsProps) {
  const params = useParams();

  // Replace all :param placeholders with actual param values
  let redirectPath = to;
  Object.entries(params).forEach(([key, value]) => {
    redirectPath = redirectPath.replace(`:${key}`, value || '');
  });

  return <Navigate to={redirectPath} replace />;
}
