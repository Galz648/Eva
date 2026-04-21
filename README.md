# Eva
An implementation of the Eva programming language, as part of the `Essentials Of Interpretation` course



### Notes

##### 'var' (declaration) vs 'set' (assignment)

variable declaration always happens in the same scope, we take the current scope and declare a mapping within it, wherein with the variable assignment, we lookup the variable in the current scope, parent scope, so on and so forth, and then 
   