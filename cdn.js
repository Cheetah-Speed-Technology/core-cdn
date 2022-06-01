function Ourpass() {
  this.isMobileDevice = /Mobi/i.test(window.navigator.userAgent);
  this.dStyle = {
    ourpassParentModal: `
    position: fixed;
    z-index: 999999;
    top: 0;
    left: 0;
    background-color: rgba(0,0,0,0.4);
    height: 100%;
    width: 100%;
    overflow: auto;
  `,
    ourpassIframe: `
    height: 100vh;
    width: 100%;
  `,
  };

  this.environments = {
    sandbox: {
      baseUrl: 'https://merchant-sandbox.ourpass.co'
    },
    production: {
      baseUrl: 'https://merchant.ourpass.co'
    }
  };

  this.config = {};
}

Ourpass.prototype.generateIframeSrc = function () {
  const items = this.clientInfo.items ? JSON.stringify(this.clientInfo.items) : '';
  const src = `${this.config.baseUrl}/checkout/?src=${this.clientInfo.src}&items=${items}&amount=${this.clientInfo.amount}&url=${this.clientInfo.url}&name=${this.clientInfo.name}&email=${this.clientInfo.email}&qty=${this.clientInfo.qty}&description=${this.clientInfo.description}&api_key=${this.clientInfo.api_key}&reference=${this.clientInfo.reference}`;
  return src;
};

// Close Functions
Ourpass.prototype.g = function () {
  this.removeElement("ourpassParentModal");
  this.clientInfo.onClose();
};

// Close Modal
Ourpass.prototype.closeOnModal = function () {
  if (event.target == document.getElementById("ourpassParentModal")) {
    this.g();
  }
};

// Create Element
Ourpass.prototype.createAnElement = function (parentId, elementTag, elementId, style, html = null) {
  var modalDiv = document.createElement(elementTag);
  modalDiv.style.cssText = style;
  if (html) modalDiv.innerHTML = html;

  modalDiv.setAttribute("id", elementId[0]);

  if (elementId.length > 1) modalDiv.setAttribute(`${elementId[1][0]}`, `${elementId[1][1]}`);

  if (parentId instanceof HTMLElement) {
    parentId.appendChild(modalDiv);
  } else {
    if (parentId == "pass") {
      var dParentElement = document.getElementById("button").parentNode;
      dParentElement.appendChild(modalDiv);
    } else {
      document.getElementById(parentId).appendChild(modalDiv);
    }
  }

  return modalDiv;
};

// Remove Element
Ourpass.prototype.removeElement = function (element) {
  if (!(element instanceof HTMLElement)) {
    element = document.getElementById(element);
  }

  if (element) {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
};


Ourpass.prototype.openIframe = function (clientInfo, btnId) {

  //delete any previous element
  let modelElement = document.getElementById("ourpassParentModal");

  if (!!modelElement) {
    modelElement.remove();
  }
  this.clientInfo = clientInfo;

  switch (clientInfo.env) {
    case 'sandbox':
      this.config = this.environments.sandbox;
      break;

    default:
      this.config = this.environments.production;
      break;
  }

  // Create Backdrop Element
  modelElement = this.createAnElement(
    document.getElementsByTagName("body")[0],
    "div",
    ["ourpassParentModal"],
    this.dStyle.ourpassParentModal
  );

  // Create Modal-Content card
  this.createAnElement("ourpassParentModal", "div", ["ourPassContentModal"]);

  // Create Iframe
  this.createAnElement(
    "ourPassContentModal",
    "iframe",
    ["dFrame", ["src", this.generateIframeSrc()]],
    this.dStyle.ourpassIframe
  );

  window.OncloseData = clientInfo.onClose;

  // Add Event Listeners
  window.addEventListener('message', (event) => {
    if (this.config.baseUrl === event.origin) {

      if (event.data == 'false pass') {
        this.removeElement(modelElement);
        this.clientInfo.onClose();
      }

      if (event.data == 'false pass1') {
        this.removeElement(modelElement);
        this.clientInfo.onSuccess(clientInfo);
      }

      if (event.data == "closeiframe") {
        this.clientInfo.onClose();
        this.removeElement(modelElement);
      }
    }
  });
};

window.OurpassCheckout = new Ourpass();