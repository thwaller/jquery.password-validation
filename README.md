# jquery.password-validation

JQuery plugin for password validation per a defined rule set. The requirements are listed out and will disappear as the conditions are met, during which the field boxes will be red. When the conditions are all met, the field boxes will be green and the password is valid. The HTML is provided simply to test the code and needs to be adjusted depending on how you want to implement.

## Character Sets

Addressing the full UTF8 encoding table U+0000 to U+00FF (x00 to xFF) into logical groups.

1. All UpperCase (Ascii/Unicode)  
   `upperCaseSet: "A-Z"`
2. All LowerCase (Ascii/Unicode)  
   `lowerCaseSet: "a-z"`
3. All numeric (Ascii/Unicode)  
   `numericSet: "0-9"`
4. Standard special characters  
   `specialSet: "\x21\x23-\x26\x28-\x2E\x3A-\x40\x5B-\x5F\x7B-\x7E`
5. Extended UTF8 characters  
   `extendedSet: "\xA1-\xFF"`
6. The characters of space, double quote, single quote, slash, backslash, grave accent  
   These are common problematic characters  
   `problemSet: "\x20\x22\x27\x2F\x5C\x60\xA0"`
7. Unused UTF8 hex for control  
   `deadSet: "\x00-\x1F\x80-\x9F"`

## Items to Address

1. 