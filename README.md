# Annotation Exercise
This repo contains five bugs served as an exercise of type annotations for co-authors before actually conducting the 
experiment.

## GUI Guidance
A GUI application, **AnnotationFacilitator.jar**, which facilitates the annotation process is provided.

### GUI Installation
To install this GUI, please download and run this scriptm **install.rb** by.
```
ruby install.rb
```

### Configuration
Before using this GUI, we need to first customise it in `config.xml` in the root directory. The configuration includes your name, e.g., **zheng**, which is used to distinguish different branches, your GitHub's username and password which are used to push your changes so that other authors can see them, and the absolute path of your preferered editor, **mvim** in my case.

### Using the GUI 
To run the GUI, we type
```
java -jar AnnotationFacilitator.jar
```

The configured GUI loads the input data that is in fact a set of bugs with information like the repo's name, SHAs of the 
fix and buggy commit, URLs of the issue page, etc.. We navigate these bugs via two buttons, `next` and `previous`. 

For each bug, the GUI is able to render webpages of the bug report, fix commit, and buggy commit, via three buttons, 
`Bug report`, `Buggy commit`, and `Fix commit`. The fix commit page which displays the changes that the developers made to 
the bug is especially important, because this is where we locate the bug that is about to be annotated. Once we confirm the 
bug's location (which file it resides in), we select the file name which is text in the webpages. We rightclick the selected text and a context menu pops out. We can open this file locally by clicking the second option **Open File**. Currently, the 
default editor is `mvim`. The author can customise the editor via the configuration file `config.xml`. 

For example, for the fix commit which fixes the issue at https://github.com/wearecontrast/FormFiller/issues/7, we would select the text **src/FormFiller.js** in the middle of the webpage https://github.com/wearecontrast/FormFiller/commit/144575e271c7f6889624fd9b900b04ac1e09a22a. The GUI can dislay both web 
pages, so there is no need to open a browser. After right-clicking it, we would select the option **Open File** and the 
editor window will pop out. 

We can use this GUI to record some annotation statistics, such as annotation time, whether a bug is detectable by the two 
static type checkers, and reasons why a bug is deemed undetectable. The button `taxonomy` renders a table showing different 
reasons of undetectablility. Some of these reasons are from first principle and others are learnt during the preliminary 
study. The GUI automatically stores the results in a file `results.csv` in the `projects` folder.

### Branch Naming Convention
After the annotation, the authors can commit their changes by clicking the button `commit`. It automatically creates a 
branch named `authorName-repo-bugID-typeChecker`, adds and commits all the changes, and pushes to the repo on GitHub.

## Annotation Tutorial
I once gave a brief tutorial on how to add annotations, which consists of four examples.

### First -- dummy example
Suppose we want to statically type check a function in JavaScript.
```JavaScript
// Add function in JavaScript
function addNumbers(x, y) {
  return x + y;
}
console.log(addNumbers(3, "a"));
```

To use TypeScript, annotations are required. From the code, we know the developer's intention is to add two numbers. TypeScript has a primitive type `number`, so we use it to annotate variables `x` and `y` to indicate they should be 
numbers. We save the annotated code in a file with suffix **.ts**, here `addNumber.ts`.
```TypeScript
// Add function in JavaScript
function addNumbers(x: number, y: number) { 
  return x + y
}
console.log(addNumbers(3, "a"))
```
We type
```
tsc addNumber.ts
```
and this gives us an error message
```
addNumber.ts(4,27): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

Flow supports more type inference, so sometimes annotations are unnecessary. However, to use Flow, we need some initialization by typing
```
flow init
```
in the project directory.

In this example, we simply add comment `/* @flow */` to the head of the file, which asks Flow to type check only this file.
```JavaScript
/* @flow */
// Add function in JavaScript
function addNumbers(x, y) {
  return x + y;
}
console.log(addNumbers(3, "a"));
```
We type
```
flow
```
and it gives us this error message
```
addNumberAnnotated.js:7
  7: console.log(addNumbers(3, "a"));
                 ^^^^^^^^^^^^^^^^^^ function call
  7: console.log(addNumbers(3, "a"));
                               ^^^ string. This type is incompatible with
  4: function addNumbers(x: number, y: number) {
                                       ^^^^^^ number


Found 1 error
```

### Second -- cabaljs
**cabaljs** is a real-world project that has a field bug, whose error description is `Uncaught TypeError: Object #<Object> has no method 'forEach'`. According to GitHub's issue tracking system, we notice this bug report was closed in commit `fe59fec108ccda196692e21c2092d2cc6f01d600` which we assume to be a correct fix. We go to the webpage that shows the difference between the fix and its buggy parent. The changes that the authors made are
```JavaScript
-  data.push(rowRenderer(properties, row, mappings));
+  data.push(rowRenderer(properties, row.Cells.results, mappings));


- row.forEach(function (mp, index) {
+ row.Cells.results.forEach(function (mp, index) {

- data.push(rowRenderer(properties, row, mappings));
+ data.push(rowRenderer(properties, row.Cells.results, mappings));
```
Combining the error description, we know that `row` is an object of type `Object` which has no method `forEach`. So we add this annotation to variable `row`
```TypeScript
this.result.forEach(function (row: Object) {
```
By type checking using TypeScript, an error is thrown
```
cabal.ts(21,17): error TS2339: Property 'forEach' does not exist on type 'Object'.
```

### Third -- a project that uses jQuery
A majority of real world JavaScript projects use external libraries.  When it comes to external references, the annotation becomes chanllenging. Suppose we have a simple project that uses jQuery.
```JavaScript
$(document).ready(function () {
    $("p").click(function () {
        $(this).hide();
    });
});
```

Obviously, TypeScript and Flow do not know what `$` is. Directly using the two tools on this project gives us many false alarms. Therefore, we have to somehow provide this information for the static typing to go through.

In TypeScript, we need to write a declaration file which properly annotates the library and add an explicit reference to this declaration file. 
```JavaScript
/// <reference path="jquery/jquery.d.ts" />
```
This comment specifies a relative path for the declaration file `./jquery/jquery.d.ts`. Detailed instruction can be found at http://www.typescriptlang.org/Handbook#modules . Mannually writing properly annotated files for each library we encounter in the experiment is time-consuming. Fortunately, there is a repository, **DefinitelyTyped** (https://github.com/DefinitelyTyped/DefinitelyTyped), which is dedicated to provide annotated declaration files for popluar JavaScript libraries. From this repo, we find the file `jquery.d.ts` and save it into directory `./jquery`.

In Flow, we need to modify the file `.flowconfig` in the root directory, which is automatically created by the command 
```
flow init
```
Specifically, we add 
```
[libs]
interfaces/
```
to `.flowconfig` to specify that any files in directory `interfaces/` ending in `.js` should be viewed as declaration files.
Finally, in `interfaces/`, we create a file `jQuery.js` with content
```JavaScript
declare module "JQuery" {
    declare function $(obj:Object):Object;
}

var $ = require('JQuery').$;
```
Detailed instruction can be found at http://flowtype.org/docs/declarations.html#_ .


### Forth -- handsontable
Sometimes **DefinitelyTyped** fails to provide a declartion file for some libaries. In these difficult cases, we have to create our own declaration files. **handsontable** is a large project that has a type error whose bug report is 
```
TypeError: Argument 1 of Document.elementFromPoint is not a finite floating-point value.
```
This bug report was closed by commit `66cb64e29b11391080e6f710be5b9c9a7a5be35f`. From the difference between the fix and the parent, we locate the bug to file `src/tableView.js`. However, this file depends on many other files.
```
import * as dom from './dom.js';
import * as helper from './helpers.js';
import {eventManager as eventManagerObject} from './eventManager.js';
import {WalkontableCellCoords} from './3rdparty/walkontable/src/cell/coords.js';
import {WalkontableSelection} from './3rdparty/walkontable/src/selection.js';
import {Walkontable} from './3rdparty/walkontable/src/core.js';
```
No interfaces for these customised libraries can be found on **DefinitelyTyped**, and mannually writing properly annotated declaration files are difficult. 

To tackle this problem, we first read the bug report and realise that the bug is caused by the fact that variable `event` has no property `x` when used in FireFox. We then read the code and understand that `event` is actually of type `MouseEvent`. According to what is described at https://developer.mozilla.org/en/docs/Web/API/MouseEvent , we simply add a interface that has no implementation details to `src/tableView.js` but a delaration of all its properties
```TypeScript
class MouseEvent {
    altKey;
    button;
    buttons;
    clientX;
    clientY;
    ctrlKey;
    detail;
    metaKey;
    relatedTarget;
    screenX;
    screenY;
    shiftKey;
    which;

    target;
    isTargetWebComponent;
}
```
And this annotation gives us an error message during TypeScript's static tying
```
tableView.ts(101,43): error TS2339: Property 'x' does not exist on type 'MouseEvent'.
tableView.ts(101,69): error TS2339: Property 'y' does not exist on type 'MouseEvent'.
tableView.ts(102,41): error TS2339: Property 'x' does not exist on type 'MouseEvent'.
tableView.ts(102,50): error TS2339: Property 'y' does not exist on type 'MouseEvent'.
```
