export default [
  {
    fnName: 'toFixed',
    fnParams: ['num1', 'num2'],
    fnBody: `return parseFloat(num1).toFixed(num2)`,
  },
  { fnName: 'number', fnParams: ['str'], fnBody: `return Number(str)` },
  { fnName: 'parseInt', fnParams: ['str'], fnBody: `return parseInt(str)` },
  { fnName: 'parseFloat', fnParams: ['str'], fnBody: `return parseFloat(str)` },
  {
    fnName: 'isInteger',
    fnParams: ['num'],
    fnBody: `return Number.isInteger(parseInt(num))`,
  },
  {
    fnName: 'isSafeInteger',
    fnParams: ['num'],
    fnBody: `return Number.isSafeInteger(parseInt(num))`,
  },
];
