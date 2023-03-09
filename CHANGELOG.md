# compile-include-html

## 2.2.2

### Patch Changes

- 0687115: fix local and global context for for loop

## 2.2.1

### Patch Changes

- 1d737ce: fix local and global context issue in include tag

## 2.2.0

### Minor Changes

- 3aba8cc: add support for many js expression thanks to adding tmpl"

## 2.1.1

### Patch Changes

- fb27408: fix : spliting in ternary

## 2.1.0

### Minor Changes

- b33a7bb: - Add support for ternary expression inside replacement string.
  - Fix base path.

## 2.0.0

### Major Changes

- 8ef63d8: Add for loop support, changed class name and method name, add support for context.

  ## Breaking changes:

  - the name of the class: from `Includer` to `HtmlParser`
  - the name of the run method: from `run`to `outputNewFile`

## 1.0.10

### Patch Changes

- f64fab5: remove need for context

## 1.0.9

### Patch Changes

- fbb9d33: add run keyword

## 1.0.8

### Patch Changes

- 1c6db97: use pnpm to build

## 1.0.7

### Patch Changes

- 98b84a0: fix module key in package.json

## 1.0.6

### Patch Changes

- 17372be: add repository and keywords to package.json

## 1.0.5

### Patch Changes

- 6e58c5f: add inputIsDocument to documentation.

## 1.0.4

### Patch Changes

- dea8a2c: add support for document

## 1.0.3

### Patch Changes

- bf4257c: add files property to package.json

## 1.0.2

### Patch Changes

- 82be214: add correct build script

## 1.0.1

### Patch Changes

- 66ffd93: fix naming

## 1.0.0

### Major Changes

- ea480e9: init compile-include-html
