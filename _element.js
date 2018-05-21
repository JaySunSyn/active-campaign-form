import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

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
      </style>
      <h2>Hello [[prop1]]!</h2>
    `;
  }
  static get properties() {
    return {
      prop1: {
        type: String,
        value: 'active-campaign-form',
      },
    };
  }
}

window.customElements.define('active-campaign-form', ActiveCampaignForm);
