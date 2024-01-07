export var log = console.log
export var remove = elem => elem.delete()

export var url = new URL(document.location)

export async function render(motherelem, elemFunktion) {

    if (elemFunktion instanceof Function)
        var elem = elemFunktion()
    else elem = elemFunktion

    if (elem instanceof Promise)
        elem.then(elem => motherelem.appendChild(elem.baseElem))
    else motherelem.appendChild(elem.baseElem)

}

export class element {

    constructor(data = "div", _style = { ...document.createElement("div").style }) {

        this.baseElem = data instanceof Node ? data :
            document.createElement(typeof data == "string" ? data : "div");

        this.style = style => {
            Object.keys(style).forEach(key => this.baseElem.style[key] = style[key])
            return this
        };

        if (_style)
            this.style(_style)

        this.classList = this.baseElem.classList

        this.setAttr = (identifyer, value) => {
            this.baseElem.setAttribute(identifyer, value); return this
        }

    }

    on = () => this.baseElem.addEventListener;

    #addElem = element => element instanceof Array ?
        element.forEach(elem => this.baseElem.appendChild(elem.baseElem)) :
        this.baseElem.appendChild(element.baseElem)

    add(element) {

        if (element instanceof Function)
            element = element()

        if (element instanceof Promise)
            element.then(this.#addElem)
        else this.#addElem(element)

        return this;

    }

    getStyle = () => getComputedStyle(this.baseElem);

    #sorageChangeHandler = {}
    #sorageChangeHandlerArray = {}

    storage = {
        set: async (key, value) => {

            if (key instanceof Function)
                var key = key()
            if (value instanceof Function)
                var value = value()
            if (key instanceof Promise)
                var key = await new Promise((res, rej) => key.then(res).catch(rej))
            if (value instanceof Promise)
                var value = await new Promise((res, rej) => value.then(res).catch(rej))

            this.baseElem.dataset[key] = JSON.stringify(value);
            (this.#sorageChangeHandler?.[key] ?? (() => 0))(value);
            (this.#sorageChangeHandlerArray?.[key] ?? []).forEach?.(lis => lis(value));
        },
        get: key => JSON.parse(this.baseElem.dataset?.[key] || "false"),
        delete: key => {
            delete this.baseElem.dataset[key];
            (this.#sorageChangeHandler?.[key] ?? (() => 0))("delete");
            (this.#sorageChangeHandlerArray?.[key] ?? []).forEach?.(lis => lis("delete"));
        },
        onChange: (key, listener) =>
            this.#sorageChangeHandler[key] = listener,
        addOnchangeListener: (key, listener) =>
            this.#sorageChangeHandlerArray[key] =
            [...(this.#sorageChangeHandlerArray[key] ?? []), listener],
    }

    rerender(element) {
        this.clear()
        this.add(element)
        return this;
    }

    clear() {
        this.baseElem.innerHTML = ""
        return this;
    }

    text(text) {
        this.baseElem.innerText = text;
        return this;
    }

    delete = () => this.baseElem.remove()

}

var sorageChangeHandler = {}
var sorageChangeHandlerArray = {}
var data = JSON.parse(localStorage.getItem("::storage::")) || {}

export var storage = {
    set: async (key, value) => {
        if (key instanceof Function)
            var key = key()
        if (value instanceof Function)
            var value = value()
        if (key instanceof Promise)
            var key = await new Promise((res, rej) => key.then(res).catch(rej))
        if (value instanceof Promise)
            var value = await new Promise((res, rej) => value.then(res).catch(rej))

        data[key] = value;
        (sorageChangeHandler?.[key] ?? (() => 0))(value);
        (sorageChangeHandlerArray?.[key] ?? []).forEach?.(lis => lis(value));
        localStorage.setItem("::storage::", JSON.stringify(storage))
    },
    get: key => data?.[key] || false,
    delete: key => {
        delete data[key];
        (sorageChangeHandler?.[key] ?? (() => 0))(value);
        (sorageChangeHandlerArray?.[key] ?? []).forEach?.(lis => lis(value));
        localStorage.setItem("::storage::", JSON.stringify(storage))
    },
    onChange: (key, listener) =>
        sorageChangeHandler[key] = listener,
    addOnchangeListener: (key, listener) =>
        sorageChangeHandlerArray[key] = [listener],
}

var eventCallbacks = {}

export var events = {
    say: async (key, data) => (eventCallbacks?.[key] ?? (() => 0))(data),
    on: (key, listener) => eventCallbacks[key] = listener,
}