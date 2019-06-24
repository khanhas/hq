# hq
hq is like [jq](https://stedolan.github.io/jq/) for HTML

## Install
```
npm i hqcl
```

## Usage
```
hq "<query> | <slice or member or method>..." [<url or file>]
```
- `query` to get elements.
    - Syntax is the same as syntax you use in `document.querySelectorAll` or `jquery`: `#elementId .elementClassName elemen-tag`.
    - Returns list of matched elements.
    - Examples: `div.title`, `#footer .link`, `.result.active`
- `slice`: Get portion of results. 
    - Syntax: `.[<start>:<end>]`
    - Returs sliced list of results
    - Examples: `.[:6]`, `.[2:10]`, `.[5:]`
- `member`: Get a member of results
    - Syntax: `.<member name>`
    - Examples: `.textContent`, `.length`
- `method`: Invoke a method of results
    - Syntax: `<method name>`, `<method name(...args[])>`
    - Examples: `getAttribute(href)`, `toUpperCase`

Keep "piping" in `hq` argument until you get the final result you want or use other unix's string processing utilites.

### Feed HTML
#### From `stdin`:
```bash
html=$(curl https://duckduckgo.com/html?q=feet)
echo $html | hq ".result__a | .textContent"
```

#### From file/url:
```bash
hq ".result__a | .textContent" ~/toes.html
```
```bash
hq ".result__a | .textContent" "https://duckduckgo.com/html?q=ankle"
```
