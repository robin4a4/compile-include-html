# compile-include-html

Small parser that allows including multiple html files in one using a `<include>` tag.

## Exemple

```html
<!-- main.html -->

<div class="container">
    <include src="card.html" with="text: hello world"/>
</div>
```

```html
<!-- card.html -->

<div class="card">
    {text}
</div>
```


```html
<!-- main.html after compilation -->

<div class="container">
    <div class="card">
        hello world
    </div>
</div>
```

## Includer

Install with: 

```
npm i compile-include-html
```

Create a new includer with:

```typescript
import {Includer} from "compile-include-html"
const includer = new Includer();
```

### Options

```typescript
options: {
    indent: number
}
```

You can pass an option object to your includer. For now the only property is `indent` which sets the indentation of the included HTML.

### Methods

#### `readFile(path: string): string`

Use it to read a file and retrieve a string of the file's content.

#### `transform(source: string): string`

Use it to transform a string using the include tag into its compiled version.


#### `run(inputPath: string, outputPath: string): void`

Use it to compile an input file located at `inputPath` and create an output file located at `outputPath`.



