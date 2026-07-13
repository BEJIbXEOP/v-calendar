import {
  type ComputedRef,
  type Ref,
  computed,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';

export interface DarkModeClassConfig {
  selector?: string;
  darkClass?: string;
}

export type DarkModeConfig = boolean | 'system' | DarkModeClassConfig;

interface DisplayModeState {
  isDark: Ref<boolean>;
  displayMode: ComputedRef<'dark' | 'light'>;
}

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

function getElementTheme(element: Element): 'dark' | 'light' | null {
  const attributeTheme =
    element.getAttribute('data-bs-theme') ?? element.getAttribute('data-theme');
  if (attributeTheme === 'dark' || attributeTheme === 'light') {
    return attributeTheme;
  }

  const colorScheme = (element as HTMLElement).style?.colorScheme
    ?.trim()
    .toLowerCase();
  if (!colorScheme) return null;

  const supportsDark = colorScheme.split(/\s+/).includes('dark');
  const supportsLight = colorScheme.split(/\s+/).includes('light');
  if (supportsDark === supportsLight) return null;
  return supportsDark ? 'dark' : 'light';
}

function getAncestorTheme(
  element: Element | null,
  documentElement: Element,
): 'dark' | 'light' | null {
  for (let current = element; current; current = current.parentElement) {
    const theme = getElementTheme(current);
    if (theme) return theme;
  }
  return getElementTheme(documentElement);
}

export function useDisplayMode(config: Ref<DarkModeConfig>): DisplayModeState {
  const instance = getCurrentInstance();
  const isDark = ref(false);
  const displayMode = computed(() => (isDark.value ? 'dark' : 'light'));

  let mounted = false;
  let mediaQuery: LegacyMediaQueryList | null = null;
  let mutationObserver: MutationObserver | null = null;

  const mediaListener = (event: MediaQueryListEvent) => {
    isDark.value = event.matches;
  };

  function getRootNode(): Node | null {
    return (instance?.proxy?.$el as Node | undefined) ?? null;
  }

  function getOwnerDocument(): Document | null {
    return (
      getRootNode()?.ownerDocument ??
      (typeof document === 'undefined' ? null : document)
    );
  }

  function removeMediaQuery() {
    if (!mediaQuery) return;
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', mediaListener);
    } else {
      mediaQuery.removeListener?.(mediaListener);
    }
    mediaQuery = null;
  }

  function removeMutationObserver() {
    mutationObserver?.disconnect();
    mutationObserver = null;
  }

  function cleanup() {
    removeMediaQuery();
    removeMutationObserver();
  }

  function setupMediaQuery(ownerWindow: Window) {
    if (mediaQuery || typeof ownerWindow.matchMedia !== 'function') return;
    mediaQuery = ownerWindow.matchMedia(
      '(prefers-color-scheme: dark)',
    ) as LegacyMediaQueryList;
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', mediaListener);
    } else {
      mediaQuery.addListener?.(mediaListener);
    }
    isDark.value = mediaQuery.matches;
  }

  function setupSystem(ownerDocument: Document) {
    const rootNode = getRootNode();
    const ElementConstructor = ownerDocument.defaultView?.Element;
    const rootElement =
      ElementConstructor && rootNode instanceof ElementConstructor
        ? rootNode
        : (rootNode?.parentElement ?? null);

    const update = () => {
      const theme = getAncestorTheme(
        rootElement,
        ownerDocument.documentElement,
      );
      if (theme) {
        removeMediaQuery();
        isDark.value = theme === 'dark';
        return;
      }
      const ownerWindow = ownerDocument.defaultView;
      if (ownerWindow) setupMediaQuery(ownerWindow);
    };

    update();
    const Observer = ownerDocument.defaultView?.MutationObserver;
    if (Observer) {
      mutationObserver = new Observer(update);
      mutationObserver.observe(ownerDocument.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'style', 'data-bs-theme', 'data-theme'],
        subtree: true,
      });
    }
  }

  function setupClass(ownerDocument: Document, value: DarkModeClassConfig) {
    const { selector = ':root', darkClass = 'dark' } = value;
    const element = ownerDocument.querySelector(selector);
    if (!element || !darkClass) {
      isDark.value = false;
      return;
    }

    const update = () => {
      isDark.value = element.classList.contains(darkClass);
    };
    update();

    const Observer = ownerDocument.defaultView?.MutationObserver;
    if (Observer) {
      mutationObserver = new Observer(update);
      mutationObserver.observe(element, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }
  }

  function setup() {
    cleanup();
    const value = config.value;
    if (typeof value === 'boolean') {
      isDark.value = value;
      return;
    }
    if (!mounted) return;

    const ownerDocument = getOwnerDocument();
    if (!ownerDocument) return;
    if (value === 'system') {
      setupSystem(ownerDocument);
    } else {
      setupClass(ownerDocument, value);
    }
  }

  watch(config, setup, { immediate: true });
  onMounted(() => {
    mounted = true;
    setup();
  });
  onUnmounted(cleanup);

  return { isDark, displayMode };
}
