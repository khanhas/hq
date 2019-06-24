#!/usr/bin/env node
const { JSDOM } = require("jsdom");
const { readFileSync } = require("fs");

// Pretent to use stdin, then readFileSync will throw error if there is no
// incoming stdin.
void (process.stdin);
let data;
try {
    data = readFileSync(0, "utf-8")
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
        let m = arg.match(/\.\[(\d*):?(\d*)\]/);
        if (m)
            els = els.slice(...m
                .slice(1, 3)
                .map(p => p ? parseInt(p) : undefined));
        else if (arg.startsWith("."))
            els = els.map(el => member(el, arg));
        else
            els = els.map(el => method(el, arg));
    });

    els.forEach(out);
}
work().catch(console.error);

const trim = s => s.trim();
const find = (html,  s) => [...html.window.document.querySelectorAll(s)];
const member = (n, m) => {
    const memName = m.slice(1);
    if (!n[memName]) throw `${memName} is not a member of "${n}"`;
    return n[memName];
};
const method = (n, m) => {
    const matches = m.match(/(.+?)\((.*?)\)/);
    if (matches) {
        if (typeof n[matches[1]] != "function")
            throw `${matches[1]} is not a method of "${n}"`;
        return n[matches[1]](...matches[2].split(","));
    } else {
        if (typeof n[m] != "function")
            throw `${m} is not a method of "${n}"`;
        return n[m]();
    }
}
const out = r => console.log(typeof r == "string" ? unescape(r) : r);