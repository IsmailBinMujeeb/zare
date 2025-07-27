---
title: '@each Statement'
slug: each-statement
sidebar_position: 11
---
## Overview

`@each` is a **method** (not a loop structure) that is often used to iterate over arrays or collections.\
It’s a more **functional** and **concise** way of doing loops, often **preferred** for array manipulation.

It’s like saying:

> "For each item in the collection, do something with it!"

***

## Syntax (Generic Form)

```zare
@each(cards:card) {
    <i>Index @(_i): </i><b>@(card.name)</b>
}
```

***

## How It Works

* The `@each` method **iterates over each element** in an array.

* It executes the **provided function** for each item in the collection, passing the item, index `@(_i)`, and the entire array as parameters.

* Using `@(_i)` you can access the current item’s index, `_i` is built in.

***

## Example (JavaScript)

```javascript
const numbers = [1, 2, 3, 4, 5];

numbers.forEach(function(num) {
    console.log(num * 2); // Double each number
});
```

**Output:**

```zare
2
4
6
8
10
```

## Example (Zare)

```zare
# express js code
res.render("index", {items: [{name: "Soap", price: 20}, {name: "Rice", price: 50}, {name: "Oil", price: 100}]} );

# Zare Code
serve (
    <ul>
        @each (items:item) {
            <li>@(item.name) - $@(item.price)</li>
        }
    </ul>
)
```

**Output:**

```zare
<ul>
    <li>soap - $20</li>
    <li>Rice - $50</li>
    <li>Oil - $100</li>
</ul>
```

## Key Points

* `@each` **cannot break** or **continue** the loop early. If you need that.

* It’s a **keyword**, and it only works with **arrays** (or array-like objects).

* The block inside `{…}` is executed for **each** element in the collection.
