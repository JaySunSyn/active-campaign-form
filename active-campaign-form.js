import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {FlattenedNodesObserver as PolymerFlattenedNodesObserver} from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';

import '@polymer/iron-form/iron-form';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-button/paper-button';

/**
 * `active-campaign-form`
 * A form intigration of active campaign email
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class ActiveCampaignForm extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
        .success {
          padding-top: 12px;
          @apply --active-campaign-form-success;
        }

        .error {
          padding-bottom: 12px;
          color: red;
          @apply --active-campaign-form-error;
        }
      </style>
      <div class="error">[[_errorMessage]]</div>
      <iron-form>
        <form>
        <input type="hidden" name="u" value="[[formId]]" />
        <input type="hidden" name="f" value="[[formId]]" />
        <input type="hidden" name="s" value="[[s]]"/>
        <input type="hidden" name="c" value="[[c]]" />
        <input type="hidden" name="m" value="[[m]]" />
        <input type="hidden" name="act" value="[[act]]" />
        <input type="hidden" name="v" value="[[v]]" />
          <slot></slot>
        </form>
      </iron-form>
      <div class="success">[[_thankYouMessage]]</div>
    `;
  }
  static get properties() {
    return {
      accountName: String,
      /** 
       * The active campaign form ID (?)
       * e.g. https://elfycares.activehosted.com/app/forms/integrate/3 (3 = formId)
       * Hidden fields: u, f
       */
      formId: {
        type: String,
        value: '1',
      },
      s: {
        type: String,
        value: '',
      },
      c: {
        type: String,
        value: '0',
      },
      m: {
        type: String,
        value: '0',
      },
      act: {
        type: String,
        value: 'sub',
      },
      /** 
       * The form api version (?)
       */
      v: {
        type: String,
        value: '2',
      },

      validate: {
        type: Function,
        value() {
          return () => {
            return this.form.validate();
          }
        }
      }
    };
  }

  get form() {
    return this.shadowRoot.querySelector('iron-form');
  }

  get slot() {
    return this.shadowRoot.querySelector('slot');
  }

  get instances() {
    window.activeCampaignForm = window.activeCampaignForm || {};
    window.activeCampaignForm.forms = window.activeCampaignForm.forms || [];

    return window.activeCampaignForm.forms;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer.disconnect();
    this.form.removeEventListener('iron-form-presubmit', this._onIronFormPresubmit.bind(this));
    this.instances.splice(this.instances.indexOf(this), 1);
  }

  connectedCallback() {
    super.connectedCallback();
    this.instances.push(this);

    window._show_error = (...args) => {
      this.instances
        .forEach(instance => instance._show_error.call(instance, ...args));
    };
    window._show_thank_you = (...args) => {
      this.instances
        .forEach(instance => instance._show_thank_you.call(instance, ...args));
    };

    this._observer = new PolymerFlattenedNodesObserver(this.slot, (info) => {
      this._processNewNodes(info.addedNodes);
      this._processRemovedNodes(info.removedNodes);
    });

    this.form.addEventListener('iron-form-presubmit', this._onIronFormPresubmit.bind(this));
  }

  submit() {
    if (!this.accountName) {
      this._errorMessage = 'accountName property is not configured!';
      return;
    }

    if (!this.validate()) {
      return;
    }
    this._errorMessage = '';
    this._thankYouMessage = '';

    const serialized = this.form.serializeForm();
    const urlData = Object.keys(serialized)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(serialized[k]))
      .join('&');

    this._setChildrenDisabled(true);
    this._load_script(`https://${this.accountName}.activehosted.com/proc.php?${urlData}&jsonp=true`);
  }

  _onIronFormPresubmit() {
    event.preventDefault();
    this.submit();
  }

  _setChildrenDisabled(disabled = true) {
    Array.from(this.children).forEach(c => c.disabled = disabled);
  }

  _processNewNodes(nodes) {
    const submit = nodes.find(node => node.getAttribute && node.getAttribute('type') === 'submit');
    if (submit) {
      submit.addEventListener('click', this.submit.bind(this));
    }
  }

  _processRemovedNodes(nodes) {
    const submit = nodes.find(node => node.getAttribute('type') === 'submit');
    if (submit) {
      submit.removeEventListener('click', this.submit.bind(this));
    }
  }

  _show_error(formId, message) {
    if (formId !== this.formId) {
      return;
    }
    this._setChildrenDisabled(false);
    this._errorMessage = message;
  }

  _show_thank_you(formId, message) {
    if (formId !== this.formId) {
      return;
    }
    this._setChildrenDisabled(false);
    this.form.reset();
    this._thankYouMessage = message;
  }

  _load_script(url) {
    var head = document.querySelector('head'), script = document.createElement('script'), r = false;
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.src = url;
    head.appendChild(script);
  }
}

window.customElements.define('active-campaign-form', ActiveCampaignForm);
