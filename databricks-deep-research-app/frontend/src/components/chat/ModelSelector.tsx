import * as React from 'react';
import { cn } from '@/lib/utils';
import { useModelCatalog } from '@/hooks/useModelCatalog';
import type { EndpointInfo } from '@/api/config';

type Provider = 'anthropic' | 'openai' | 'google' | 'meta' | 'databricks' | 'other';

interface ModelSelectorProps {
  selectedModel: string | null;
  onModelChange: (model: string | null) => void;
  disabled?: boolean;
}

/** Friendly display names for known model endpoint identifiers. */
const FRIENDLY_NAMES: Record<string, string> = {
  'databricks-claude-3-5-haiku': 'Claude Haiku 3.5',
  'databricks-claude-3-7-sonnet': 'Claude Sonnet 3.7',
  'databricks-claude-sonnet-4': 'Claude Sonnet 4',
  'databricks-claude-opus-4': 'Claude Opus 4',
  'databricks-gpt-4o-mini': 'GPT-4o Mini',
  'databricks-gpt-4o': 'GPT-4o',
  'databricks-gemini-2-0-flash': 'Gemini 2.0 Flash',
  'databricks-meta-llama-3-3-70b-instruct': 'Llama 3.3 70B',
  'databricks-meta-llama-3-1-405b-instruct': 'Llama 3.1 405B',
};

function detectProvider(endpointIdentifier: string): Provider {
  const id = endpointIdentifier.toLowerCase();
  if (id.includes('claude') || id.includes('anthropic')) return 'anthropic';
  if (id.includes('gpt') || id.includes('openai')) return 'openai';
  if (id.includes('gemini') || id.includes('google')) return 'google';
  if (id.includes('llama') || id.includes('meta')) return 'meta';
  if (id.includes('dbrx') || id.includes('databricks')) return 'databricks';
  return 'other';
}

function getFriendlyName(endpoint: EndpointInfo): string {
  // Check both the config key name and the endpoint identifier
  return (
    FRIENDLY_NAMES[endpoint.name] ??
    FRIENDLY_NAMES[endpoint.endpointIdentifier] ??
    endpoint.name
  );
}

function ProviderIcon({ provider, className }: { provider: Provider; className?: string }) {
  const size = className ?? 'h-3.5 w-3.5';
  switch (provider) {
    case 'anthropic':
      return (
        <svg className={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.827 3.52h3.603L24 20.48h-3.603l-6.57-16.96zm-7.258 0h3.604L16.742 20.48h-3.603L6.569 3.52zM0 20.48h3.604L10.174 3.52H6.57L0 20.48z" />
        </svg>
      );
    case 'openai':
      return (
        <svg className={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.998 5.998 0 0 0-3.998 2.9 6.042 6.042 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
        </svg>
      );
    case 'google':
      return (
        <svg className={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 24c6.624 0 12-5.376 12-12S18.624 0 12 0 0 5.376 0 12s5.376 12 12 12zm-1.95-17.46l6.18 10.71H4.77l3.09-5.36 2.19 3.79 2.19-3.79-2.19-3.79zm3.9 0L17.04 12l-3.09 5.36L10.86 12l3.09-5.46z" />
        </svg>
      );
    case 'meta':
      return (
        <svg className={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a4.892 4.892 0 0 0 1.12 2.15c.56.593 1.27.928 2.09.928 1.02 0 1.97-.474 2.9-1.195.93-.722 1.85-1.752 2.77-3.02l.57-.786c.29.39.57.755.85 1.087.94 1.12 1.88 1.96 2.88 2.504 1 .546 2.04.81 3.16.81.91 0 1.72-.232 2.39-.698a4.381 4.381 0 0 0 1.54-1.878c.37-.792.55-1.706.55-2.726 0-2.21-.586-4.503-1.794-6.544-1.238-2.1-2.9-3.201-4.96-3.201-1.06 0-2 .383-2.82 1.07-.82.688-1.57 1.647-2.26 2.828l-.18.31-.18-.31c-.51-.876-1.05-1.614-1.63-2.2-.89-.908-1.87-1.384-2.91-1.384zm.07 1.852c.57 0 1.15.27 1.73.826.49.47.96 1.12 1.42 1.934l.32.57-2.39 3.343c-.79 1.094-1.46 1.869-2.03 2.387-.56.512-1.06.76-1.5.76-.4 0-.74-.14-1.01-.432a2.788 2.788 0 0 1-.6-1.155A6.182 6.182 0 0 1 2.77 12.9c0-2.19.52-4.131 1.3-5.553.78-1.422 1.8-2.465 2.91-2.465zm10.07 0c1.07 0 2.09.943 3.05 2.568 1 1.695 1.54 3.61 1.54 5.487 0 .708-.12 1.313-.36 1.782a2.146 2.146 0 0 1-.94 1.07c-.4.247-.87.37-1.4.37-.97 0-1.93-.527-2.88-1.454-.67-.654-1.34-1.508-2-2.56l-.31-.494 2.04-2.89c.82-1.137 1.5-1.963 2.05-2.478.56-.521 1.1-.774 1.63-.774z" />
        </svg>
      );
    case 'databricks':
      return (
        <svg className={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M.95 14.184L12 20.403l9.919-5.55v2.21L12 22.662l-11.05-5.6v-2.878zm0-4.15L12 16.254l11.05-6.22v2.21L12 18.463l-11.05-5.6V10.034zm11.05-8.572l11.05 5.6-11.05 6.22L.95 7.062l11.05-5.6z" />
        </svg>
      );
    default:
      return (
        <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
  }
}

export function ModelSelector({ selectedModel, onModelChange, disabled }: ModelSelectorProps) {
  const { endpoints } = useModelCatalog();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Dismiss on Escape or click outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const endpointList = React.useMemo(
    () => Object.values(endpoints) as EndpointInfo[],
    [endpoints]
  );

  // Group endpoints by provider
  const grouped = React.useMemo(() => {
    const groups: Record<Provider, EndpointInfo[]> = {
      anthropic: [],
      openai: [],
      google: [],
      meta: [],
      databricks: [],
      other: [],
    };
    for (const ep of endpointList) {
      const provider = detectProvider(ep.endpointIdentifier);
      groups[provider].push(ep);
    }
    return groups;
  }, [endpointList]);

  const providerOrder: Provider[] = ['anthropic', 'openai', 'google', 'meta', 'databricks', 'other'];
  const providerLabels: Record<Provider, string> = {
    anthropic: 'Anthropic',
    openai: 'OpenAI',
    google: 'Google',
    meta: 'Meta',
    databricks: 'Databricks',
    other: 'Other',
  };

  // Get display info for selected model
  const selectedEndpoint = selectedModel ? (endpoints[selectedModel] as EndpointInfo | undefined) : null;
  const selectedProvider = selectedEndpoint ? detectProvider(selectedEndpoint.endpointIdentifier) : null;
  const selectedLabel = selectedEndpoint ? getFriendlyName(selectedEndpoint) : 'Auto';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        data-testid="model-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors',
          selectedModel
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {selectedProvider ? (
          <ProviderIcon provider={selectedProvider} className="h-3.5 w-3.5" />
        ) : (
          <ModelIcon className="h-3.5 w-3.5" />
        )}
        <span className="max-w-[120px] truncate">{selectedLabel}</span>
        {selectedModel && (
          <button
            type="button"
            data-testid="model-clear-button"
            onClick={(e) => {
              e.stopPropagation();
              onModelChange(null);
            }}
            className="ml-0.5 hover:text-foreground"
            title="Reset to Auto"
          >
            x
          </button>
        )}
      </button>

      {isOpen && (
        <div
          data-testid="model-selector-dropdown"
          className="absolute left-0 top-full z-50 mt-1 w-64 max-h-72 overflow-auto rounded-md border bg-popover p-1 shadow-md"
        >
          {/* Auto option */}
          <button
            type="button"
            onClick={() => {
              onModelChange(null);
              setIsOpen(false);
            }}
            className={cn(
              'w-full text-left px-3 py-2 rounded-sm text-sm transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              !selectedModel && 'bg-accent text-accent-foreground'
            )}
          >
            <div className="flex items-center gap-1.5">
              <ModelIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">Auto</span>
              <span className="text-xs text-muted-foreground">(Default)</span>
            </div>
          </button>

          {/* Grouped endpoints */}
          {providerOrder.map((provider) => {
            const eps = grouped[provider];
            if (eps.length === 0) return null;
            return (
              <React.Fragment key={provider}>
                <div className="my-1 border-t" />
                <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {providerLabels[provider]}
                </div>
                {eps.map((ep) => (
                  <button
                    key={ep.name}
                    type="button"
                    data-testid={`model-option-${ep.name}`}
                    onClick={() => {
                      onModelChange(ep.name);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-sm text-sm transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      selectedModel === ep.name && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <ProviderIcon provider={provider} className="h-3.5 w-3.5" />
                      <span className="font-medium truncate">{getFriendlyName(ep)}</span>
                    </div>
                  </button>
                ))}
              </React.Fragment>
            );
          })}

          {endpointList.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No model endpoints configured.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ModelIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
