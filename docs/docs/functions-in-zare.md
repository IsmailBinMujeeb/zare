---
title: Functions In Zare
slug: functions-in-zare
sidebar_position: 12
---
## Overview

A function in the terms of Programming is a block of code and can be execute when it calls. The functions are mainly divided in two parts Built-in and User defined, The Zare supports both type of functions.

## Syntax

```zare
fn sayWord (word) {
    return "I'm saying" + word;
}
```

* Here is the interesting fact you can write any valid Node js code in the curly braces `{…}` Because the Zare is built on Node js what ever you write must be a valid node js code.

* **Everything is a String!** before start coding in the any function block make sure to cast your arguments in the required data type because every argument which are coming from the function call will be a string does not matter what you pass when calling the function it will be the string in the function block and you can cast it into any data type using core js.

## Function Call

Like any programming language Zare has the same syntax for calling the function except an `@`.

```zare
<h1>@sayWord("India")</h1>
```

But here is the catch when you call any function in the if condition you don’t have to add `@` .

```zare
@if (isNaN(20)) {
    <!-- Code -->
}
```

## Example

```zare
fn isEven (val) {
    const num = Number(val);
    
    if (num % 2 == 0) return true;
    return false;
}

serve (
    @if (isEven(20)) {
        <p>It's an even!</p>
    } @else {
        <p>It's an odd!</p>
    }
)
```
