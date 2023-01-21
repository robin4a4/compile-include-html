# compile-include-html

Small parser that allows including multiple html files in one using a <include> tag.

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
<!-- main.html after copilation -->

<div class="container">
    <div class="card">
        hello world
    </div>
</div>
```