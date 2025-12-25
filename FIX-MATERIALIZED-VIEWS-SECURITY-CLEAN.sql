-- Revoke SELECT access from anon and authenticated roles
REVOKE SELECT ON public.v_recent_trades FROM anon;
REVOKE SELECT ON public.v_recent_trades FROM authenticated;
REVOKE SELECT ON public.v_recent_trades FROM public;

REVOKE SELECT ON public.v_dashboard_summary FROM anon;
REVOKE SELECT ON public.v_dashboard_summary FROM authenticated;
REVOKE SELECT ON public.v_dashboard_summary FROM public;

-- Grant access only to service_role (for internal use)
GRANT SELECT ON public.v_recent_trades TO service_role;
GRANT SELECT ON public.v_dashboard_summary TO service_role;

