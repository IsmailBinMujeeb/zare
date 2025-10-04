class ActiveLink extends HTMLElement {
  static get observedAttributes() {
    return ['href'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(`
      :host {
          display: inline-block;
        }
      a {
        color: currentColor;
        text-decoration: none;
      }
      a.active {
        text-decoration: underline;
      }`);
    this.shadowRoot.adoptedStyleSheets.push(styleSheet);
    const a = document.createElement('a');
    const slot = document.createElement('slot');
    a.appendChild(slot);
    this.shadowRoot.appendChild(a);
    this.linkElement = a;
  }

  connectedCallback() {
    this.href = this.getAttribute('href') || '';
    this.updateLink();
    this.checkActiveState();
    window.addEventListener('popstate', this.checkActiveState);
  }

  disconnectedCallback() {
    window.removeEventListener('popstate', this.checkActiveState);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'href' && oldVal !== newVal) {
      this.href = newVal || '';
      this.updateLink();
      this.checkActiveState();
    }
  }

  updateLink() {
    this.linkElement.href = this.href;
  }

  checkActiveState = () => {
    if (!this.href || this.href.trim() === '' || this.href === '#') {
      this.linkElement.classList.remove('active');
      return;
    }

    try {
      const currentUrl = new URL(window.location.href);
      const linkUrl = new URL(this.linkElement.href, window.location.origin);
      const isActive =
        currentUrl.pathname + currentUrl.search ===
        linkUrl.pathname + linkUrl.search;
      this.linkElement.classList.toggle('active', isActive);
    } catch {
      this.linkElement.classList.remove('active');
    }
  };
}

const name = 'active-link';

if (!customElements.get(name)) {
  customElements.define(name, ActiveLink);
}
