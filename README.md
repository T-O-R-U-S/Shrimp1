# Shrimp -- the unconventional programming language

An unconventional and badly-designed language, picking up all the mistakes of the past. Truly, a sight to behold.

*This* is the language of the past. No more futuristic, modern languages. We must return to our sea origins and become
fish once more, living a simple life and not focusing about anything more than raw survival.

Taste of the syntax:
```
@Main {
  Function "Hello there!"
}

@Function {
  #! You don't specify the parameters
  #! in the function declaration, 
  #! to ensure as many runtime errors
  #! as possible. :)

  display $(1)

  #! This language is zero-based, but
  #! $(0) is the function's name.
}
```

## Conventions

use `camelCase` for variable names and use `UpperCamelCase` for function names.

The Shrimp file extension is `.imp`

## Writing your first hello world
```
Any text outside of a function is automatically ignored

"main" is the function run on startup. 
Every Shrimp program must have this!

To indicate the beginning of a new function, use @<function name> { <codeblock> } at the start of a line.

It will then be later executable in the code by simply referencing the name at the 
start of any line or as a parameter via the use of >< syntax

@Main {
  #! Any line that starts with #! is a comment. 
  #! These are automatically ignored and will 
  #! never be executed.

  display "Hello world!"
}
```

## Comments in Shrimp

Simply prefix any line with `#!` to comment it out.

It cannot be appended to the end of a line
## Whitespace matters!
You may have worked with many whitespace-agnostic languages before that assign little meaning to whitespace, however, in Shrimp, whitespace matters!

```
#! Incorrect
display 
"Parameter"
```

```
#! Correct
display "Parameter"
```

## Flow control in Shrimp
This one is a bit unconventional, but If statements can only execute functions.
```
@Main {
  if true: MyFunction
}

@MyFunction {
  display "This is the truth!"
}
```

## Shrimp's (loose) types

The string
```
var mystr "Hello! I am a string! I can be displayed :)"
display $mystr
var mystr >concat $mystr " But I can also be logged :D"<
log $mystr
#! Logging is an unofficial part of the Shrimp standard
```

The number
```
var mynum 3.5
display $mynum
#! 3.5

#! Floats and integers are essentially the same type (Number), so can be added together
var mynum >add $mynum 3<
display $mynum
#! 6.5
```

The boolean
```
@Main {
  var mybool true
  if $mybool: TheTruth
}

@TheTruth {
  display "The truth!"
}
```

The array
```
#! An array is best "logged". This is basically a native JS console.log on the base type.
#! It has fancier formatting too :) Though I really should get around to properly formatting
#! arrays as part of the "proper" Shrimp standard...
var myarr ["Hi! I am an array", 42, "We can store multiple types!", ["And we can be nested too!"]]
```

## Argument formatting in Shrimp

### Function formatting
In Shrimp, you cannot simply pass a function to an If statement like so:
```
#! Wrong
if eq true true: AnyFunc
```
Instead, you must inclose it in `>` and `<` to indicate to the parser that you wish to pass in a function
```
#! Correct
if >eq true true< : AnyFunc
```

### Variable references
Prefix any name with `$` and it becomes a variable reference. If the variable doesn't exist, then it throws an error.

### Nested parsing
This parses any statements inside it again. To use it, enclose your arguments in `!(` and `)`. If there is a bug in the interpreter when parsing arguments, use !() to see if it fixes anything


## The Shrimp built-in functions

### Flow control
`loop` -- repeats an action a given number of times. `loop 15: display "Hey!"`. Displays `Hey!` 15 times.

`if` -- a basic if statement. Checks if the first argument passed is equal to true, and executes a function block (second argument) if it is.

`if?` is similar to the `if` statement, but it is distinct in that it uses JavaScript's rules for the partial equal. E.g, 0 is false, 1 is true.

Example usage:
```
#! eq is for strict comparison. >eq 1 1< == true, >eq 1 2< == false
if >eq true true< : display "Hi!"
if true: display "Hi!"
```

```
#! Executes AnyFunc -- Any number (except 0) is executed.
#! Empty strings are false
#! Undefined and null are false
if? 1: AnyFunc
#! Does not execute AnyFunc
if? 0: AnyFunc
```

### Comparison

`eq` Strictly equal. `>eq 1 true<` == false, `>eq 1 1<` == true

`eq?` Loosely equal. `>eq? 1 true<` == true, `>eq 1 1<` == true

### Maths

> All of these take `n` arguments (Practically infinite).

<hr>

`add` adds a sequence of numbers together.

`add 2 2` === `4`

<hr>

`mult` multiplies a sequence of numbers together.

`mult 2 2` === `4`

<hr>

`div` divides a sequences of numbers.

`div 16 2 2` === `4`

<hr>

`sub` subtracts a sequence of numbers.

`sub 4 4 4` === `-4`

<hr>

`pow` Takes the first argument to the power of the next arguments

`pow 2 1 2` === `4`

`pow 1 2 2` === `1`

<hr>

#### XOR gate explanation
`xor` inverts the binary representation of numbers
|Xor|Gate|
|--|--|
|Binary|Decimal|
|011|3|
|100|4|
|Output||
|111|7|

`xor 3 4` === 4

<hr>

`bin` converts a binary number to decimal. `>bin 1000<` === 8

If several numbers are specified, it will add them together.

`bin 10 10` === `4`
<hr>

`hex` converts a hexadecimal number to decimal. `>hex 0x8<` === 8

If several numbers are specified, it will add them together

`0x2` === 2

`hex 0x2 0x2` === `4`

<hr>

`base` converts a number from a base specified by the first argument.

`base 10 4 4` === `8`

<hr>

<hr>

## Multiline text blocks

These are text blocks defined outside of functions that allow you to easily use multi-line strings.

They are defined by using `T!<var name> {<text block contents>}`

```
T!multiline {
  Hello!
  I'm multiline text! ;)
}

@Main {
  display $multiline
  #! Displays the T! block
}
```