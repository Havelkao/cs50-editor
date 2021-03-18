document
  .querySelectorAll(".title")
  .forEach((f) => f.addEventListener("keydown", titleKeyDown));

document
  .querySelectorAll(".field")
  .forEach((f) => f.addEventListener("keydown", fieldKeyDown));

const commandList = [
  "/h1",
  "/h2",
  "/h3",
  "/1",
  "/2",
  "/3",
  "/css",
  "/p",
  "/js",
  "/py",
  "/html",
];

function titleKeyDown(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    createNewField(this);
    placeCaretAtEnd(this.nextSibling);
  }

  if (e.key == "ArrowDown") {
    if (this.nextElementSibling) {
      placeCaretAtEnd(this.nextElementSibling);
    }
  }
}

function fieldKeyDown(e) {
  let content = document.querySelector("#md-content");

  if (
    e.key == "Enter" &&
    !commandList.includes(this.innerHTML) &&
    !e.shiftKey
  ) {
    e.preventDefault();
    createNewField(this);
    placeCaretAtEnd(this.nextSibling);
  }

  if (
    e.key == "Backspace" &&
    this.innerHTML == "" &&
    this.className != "title" &&
    content.querySelectorAll("div").length > 1
  ) {
    placeCaretAtEnd(this.previousElementSibling);
    e.preventDefault();
    this.remove();
  }

  if (e.key == "Tab") {
    e.preventDefault();
    let pos = getCaretCharacterOffsetWithin(this);
    setCaretPosition(this, pos + 7);
    this.innerHTML += "&#9;";
    placeCaretAtEnd(this);
  }

  if (e.key == "ArrowUp") {
    let style = window.getComputedStyle(this);
    let paddingTop = parseInt(
      style.getPropertyValue("padding-top").split("px")[0]
    );
    let caretPos = parseInt(getCaretPosition().top - paddingTop);
    let elPos = parseInt(this.getBoundingClientRect().top);

    if (caretPos == elPos) {
      placeCaretAtEnd(this.previousElementSibling);
    }
  }

  if (e.key == "ArrowDown") {
    let style = window.getComputedStyle(this);
    let padding = parseInt(style.getPropertyValue("padding").split("px")[0]);
    let caretPos = parseInt(getCaretPosition().bottom + padding);
    let elPos = parseInt(this.getBoundingClientRect().bottom);

    if (caretPos == elPos && this.nextElementSibling) {
      placeCaretAtEnd(this.nextElementSibling);
    }
  }

  if (
    e.key == "Delete" &&
    this.nextSibling.innerHTML == "" &&
    content.querySelectorAll("div").length > 1
  ) {
    e.preventDefault();
    placeCaretAtEnd(this);
    this.nextSibling.remove();
  }

  if (e.key == "Enter" && commandList.includes(this.innerHTML)) {
    e.preventDefault();

    switch (this.innerHTML) {
      case "/1":
      case "/h1":
        this.classList.add("h1");
        this.innerHTML = "";
        break;
      case "/2":
      case "/h2":
        this.classList.add("h2");
        this.innerHTML = "";
        break;
      case "/3":
      case "/h3":
        this.classList.add("h3");
        this.innerHTML = "";
        break;
      case "/p":
        this.className = "field";
        this.innerHTML = "";
        break;
      case "/css":
        this.className = "field code language-css";
        this.innerHTML = "";
        break;
      case "/js":
        this.className = "field code language-javascript";
        this.innerHTML = "";
        break;
      case "/html":
        this.className = "field code language-html";
        this.innerHTML = "";
        break;
      case "/py":
        this.className = "field code language-python";
        this.innerHTML = "";
        break;
    }
  }

  if (e.keyCode != 13 && this.classList.contains("language-css")) {
    highlight(e.target, "css");
  }

  if (e.keyCode != 13 && this.classList.contains("language-javascript")) {
    highlight(e.target, "javascript");
  }

  if (e.keyCode != 13 && this.classList.contains("language-html")) {
    highlight(e.target, "html");
  }

  if (e.keyCode != 13 && this.classList.contains("language-python")) {
    highlight(e.target, "python");
  }
}

// -------------------------------      Functions      ------------------------------- //

function createNewField(el) {
  let div = document.createElement("div");
  let newField = el.parentNode.insertBefore(div, el.nextSibling);
  newField.setAttribute("contenteditable", "true");
  newField.setAttribute("placeholder", "/command");
  newField.classList.add("field");
  newField.addEventListener("keydown", fieldKeyDown);
}

function highlight(el, lang) {
  let pos = getCaretCharacterOffsetWithin(el);
  el.innerHTML = Prism.highlight(el.innerText, Prism.languages[lang], lang);
  setCaretPosition(el, pos);
}

// -------------------------------    Caret Functions   ------------------------------- //

function placeCaretAtEnd(el) {
  var range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function getCaretPosition() {
  let sel = window.getSelection();
  let range = sel.getRangeAt(0);
  let div = document.createElement("div");
  div.innerHTML = "1";
  range.insertNode(div);
  let parent = div.parentNode.getBoundingClientRect();
  div.className = parent.className;
  let position = div.getBoundingClientRect();
  div.remove();
  return position;
}

function getCaretCharacterOffsetWithin(element) {
  var caretOffset = 0;
  var doc = element.ownerDocument || element.document;
  var win = doc.defaultView || doc.parentWindow;
  var sel;
  if (typeof win.getSelection != "undefined") {
    sel = win.getSelection();
    if (sel.rangeCount > 0) {
      var range = win.getSelection().getRangeAt(0);
      var preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
  } else if ((sel = doc.selection) && sel.type != "Control") {
    var textRange = sel.createRange();
    var preCaretTextRange = doc.body.createTextRange();
    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint("EndToEnd", textRange);
    caretOffset = preCaretTextRange.text.length;
  }
  return caretOffset;
}

function setCaretPosition(el, pos) {
  // Loop through all child nodes
  for (var node of el.childNodes) {
    if (node.nodeType == 3) {
      // we have a text node
      if (node.length >= pos) {
        // finally add our range
        var range = document.createRange(),
          sel = window.getSelection();
        range.setStart(node, pos);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return -1; // we are done
      } else {
        pos -= node.length;
      }
    } else {
      pos = setCaretPosition(node, pos);
      if (pos == -1) {
        return -1; // no need to finish the for loop
      }
    }
  }
  return pos; // needed because of recursion stuff
}

// -------------------------------      Func - UI      ------------------------------- //

function switchMode() {
  let button = document.querySelector(".mode");
  let css = document.getElementById("color-mode");
  if (!localStorage.hasOwnProperty("color-mode")) {
    localStorage.setItem("color-mode", "dark");
  }

  let mode = localStorage.getItem("color-mode");

  if (mode === "dark") {
    button.innerHTML = "brightness_2";
    css.setAttribute("href", "/static/light_mode.css");
    localStorage.setItem("color-mode", "light");
  } else {
    button.innerHTML = "wb_sunny";
    css.setAttribute("href", "/static/dark_mode.css");
    localStorage.setItem("color-mode", "dark");
  }
}

function updateContent() {
  let title = document.getElementById("title").innerText;
  let content = document.getElementById("md-content").childNodes;
  let body = [].slice.call(content, 2);
  let res = "";

  for (let node of body) {
    res = res + (node.outerHTML || "");
  }

  console.log(res);

  document.getElementById("hidden-title").value = title;
  document.getElementById("hidden-body").value = res;

  document.getElementById("content-form").submit();
}

function bindTitle(event) {
  let el = event.currentTarget;
  let pos = getCaretCharacterOffsetWithin(el);

  var elems = document.querySelectorAll('[data-bind="title"]');
  for (var key in elems) {
    elems[key].innerHTML = event.currentTarget.innerHTML;
  }

  setCaretPosition(el, pos);
}
