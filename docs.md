# Writing your first hello world
```
@main {
  #! "main" is the function run on startup. Every Shrimp program must have this!
  display "Hello world!"
}
```

# Flow control in Shrimp
This one is a bit unconventional, but If statements can only execute functions.
```
@main {
  if true do myFunction
}

@myFunction {
  display "This is the truth!"
}
```

# The Shrimp's types