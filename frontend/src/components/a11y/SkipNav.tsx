import { SKIP_NAV_TARGETS } from '@/config/accessibility';

interface SkipNavProps {
  /**
   * Target element ID to skip to
   */
  targetId?: string;
  /**
   * Link text
   */
  children?: string;
}

/**
 * Skip Navigation component for keyboard users
 * Allows users to skip repetitive navigation and jump to main content
 * Implements WCAG 2.1 AA Success Criterion 2.4.1 (Bypass Blocks)
 */
export function SkipNav({
  targetId = SKIP_NAV_TARGETS.MAIN_CONTENT.replace('#', ''),
  children = 'Skip to main content',
}: SkipNavProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      // Set focus to target element
      target.focus();
      // If element can't receive focus naturally, make it focusable
      if (document.activeElement !== target) {
        target.setAttribute('tabindex', '-1');
        target.focus();
      }
      // Scroll to target
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="
        sr-only
        focus:not-sr-only
        focus:fixed
        focus:top-4
        focus:left-4
        focus:z-[100]
        focus:px-4
        focus:py-2
        focus:bg-primary
        focus:text-primary-foreground
        focus:rounded-lg
        focus:shadow-lg
        focus:outline-none
        focus:ring-2
        focus:ring-ring
        focus:ring-offset-2
        font-medium
        transition-all
      "
    >
      {children}
    </a>
  );
}

/**
 * Multiple skip links for complex layouts
 */
interface SkipLinksProps {
  links?: Array<{
    targetId: string;
    label: string;
  }>;
}

export function SkipLinks({ links }: SkipLinksProps) {
  const defaultLinks = [
    { targetId: SKIP_NAV_TARGETS.MAIN_CONTENT.replace('#', ''), label: 'Skip to main content' },
    { targetId: SKIP_NAV_TARGETS.NAVIGATION.replace('#', ''), label: 'Skip to navigation' },
  ];

  const skipLinks = links || defaultLinks;

  return (
    <div className="sr-only focus-within:not-sr-only">
      <nav aria-label="Skip navigation">
        <ul className="fixed top-4 left-4 z-[100] flex flex-col gap-2">
          {skipLinks.map((link) => (
            <li key={link.targetId}>
              <SkipNav targetId={link.targetId}>{link.label}</SkipNav>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
