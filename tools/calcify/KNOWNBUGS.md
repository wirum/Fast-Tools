## Confirmed bugs
### `5--3`

This one is being considered as "You can't put two consecutive operators!" case. But it's not.
This one might be a quick one.

Also found by test engine.

`name: "subtraction of negative number",`
`category: "unary",`
`expression: "5--3",`
`expected: 8`

test-engine.js:27 FAIL subtraction of negative number | esperado: 8 | recebido: undefined
(anonymous)	@	test-engine.js:27