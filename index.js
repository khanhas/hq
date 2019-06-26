#!/usr/bin/env node
const { JSDOM } = require("jsdom");
const { readFileSync } = require("fs");

// Pretend to use stdin, then readFileSync will throw error if there is no
// incoming stdin.
void (process.stdin);
let data;
try {
    data = readFileSync(0, "utf-8");
} catch { }

async function work() {
    let html;
    if (data) {
        html = new JSDOM(data);
    } else {
        const link = process.argv.pop();
        const func = link.startsWith("http") ? JSDOM.fromURL : JSDOM.fromFile;
        html = await func(link);
    }

    if (!html) {
        throw "Cannot read html";
    }

    const args = process.argv[2]
        .split("|")
        .map(trim);

    const query = args.shift();
    let els = find(html, query);
    args.forEach(arg => {
        const [, start, colon, end] = arg.match(/\.\[(\d*)(:?)(\d*)\]/) || [];
        els = start || end ?
            (colon ? slice : at)(els, start, end) :
            els.map(arg.startsWith(".") ? member : method, arg);
    });

    els.forEach(out);
}
work().catch(console.error);

const trim = s => s.trim();
const find = (html,  s) => [...html.window.document.querySelectorAll(s)];
const member = function(el) {
    const name = this.slice(1);
    if (!isValid(el[name])) {
        throw `${name} is not a member of "${el}". List of available members:\n${getAllMember(el)}`
    };
    return el[name];
};
const method = function(el) {
    const [, func, paras] = this.match(/(.+?)\((.*?)\)/) || [];
    if (paras) {
        if (typeof el[func] != "function")
            throw `${func} is not a method of "${el}". List of available methods:\n${getAllMethod(el)}`;
        return el[func](...paras.split(","));
    }

    if (typeof el[this] != "function")
        throw `${this} is not a method of "${el}". List of available methods:\n${getAllMethod(el)}`;
    return el[this]();
}
const slice = (els, start, end) => els
    .slice(start || undefined, end || undefined);
const at = (els, index) => [els[index]];

const out = r => console.log(typeof r == "string" ? unescape(r) : r);

const isValid = e => e !== undefined && e !== null;

const getAllValidKey = e => {
    const out = [];
    for (const k in e) isValid(e[k]) && out.push(k);
    return out;
};
const getAllMember = e => getAllValidKey(e)
    .filter(m => typeof e[m] !== "function")
    .join(", ");
const getAllMethod = e => getAllValidKey(e)
    .filter(m => typeof e[m] === "function")
    .join(", ");