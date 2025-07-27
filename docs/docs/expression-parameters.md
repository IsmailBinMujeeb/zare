---
title: Expression Parameters
slug: expression-parameters
sidebar_position: 5
---
### **Overview**

The **Expression Parameter** in **Zare** is used to **render dynamic content** by embedding JavaScript values into the HTML template. This is the most common feature of any Template engine.

The syntax for the **Expression Parameter** is:

```zare
@(parameter)
```

Where:

* `expression`: A parameter that can be (string, number, object, etc.) that you want to display in the HTML.

### **How it Works**

When a page is rendered, **Zare** processes the templates by tokenize and parse the code inside the `@( … )` tags and **replaces** the tags with the evaluated result (typically a string or number). The result is **inserted** into the HTML document.

### **Syntax**

```zare
@(parameter)
```

* **expression**: An parameter (variable in terms of JavaScript) expression (variable, object, string, etc.) whose value is inserted into the HTML.

### **Examples**

1. **Displaying a Simple Variable**

   ```zare
   <h1>Welcome, @(userName)!</h1>
   ```

   If the value of `userName` is `"John"`, the rendered HTML will be:

   ```html
   <h1>Welcome, John!</h1>
   ```

2. **Displaying an Object Property**

   ```zare
   <p>Your age is @(user.age)</p>
   ```

   If `user.age = 30`, the rendered output will be:

   ```html
   <p>Your age is 30</p>
   ```
