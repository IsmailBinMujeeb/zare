export default [
  { fnName: 'PI', fnParams: [], fnBody: `return Math.PI` },
  { fnName: 'E', fnParams: [], fnBody: `return Math.E` },
  { fnName: 'SQRT2', fnParams: [], fnBody: `return Math.SQRT2` },
  { fnName: 'SQRT12', fnParams: [], fnBody: `return Math.SQRT1_2` },
  { fnName: 'LN2', fnParams: [], fnBody: `return Math.LN2` },
  { fnName: 'LN10', fnParams: [], fnBody: `return Math.LN10` },
  { fnName: 'LOG2E', fnParams: [], fnBody: `return Math.LOG2E` },
  { fnName: 'LOG10E', fnParams: [], fnBody: `return Math.LOG10E` },
  {
    fnName: 'round',
    fnParams: ['num'],
    fnBody: `return Math.round(parseInt(num))`,
  },
  {
    fnName: 'ceil',
    fnParams: ['num'],
    fnBody: `return Math.ceil(parseInt(num))`,
  },
  {
    fnName: 'floor',
    fnParams: ['num'],
    fnBody: `return Math.floor(parseInt(num))`,
  },
  {
    fnName: 'trunc',
    fnParams: ['num'],
    fnBody: `return Math.trunc(parseInt(num))`,
  },
  {
    fnName: 'sign',
    fnParams: ['num'],
    fnBody: `return Math.sign(parseInt(num))`,
  },
  {
    fnName: 'pow',
    fnParams: ['num1', 'num2'],
    fnBody: `return Math.pow(parseInt(num1), parseInt(num2))`,
  },
  {
    fnName: 'sqrt',
    fnParams: ['num'],
    fnBody: `return Math.sqrt(parseInt(num))`,
  },
  {
    fnName: 'abs',
    fnParams: ['num'],
    fnBody: `return Math.abs(parseInt(num))`,
  },
  {
    fnName: 'sin',
    fnParams: ['num'],
    fnBody: `return Math.sin(parseInt(num))`,
  },
  {
    fnName: 'cos',
    fnParams: ['num'],
    fnBody: `return Math.cos(parseInt(num))`,
  },
  {
    fnName: 'tan',
    fnParams: ['num'],
    fnBody: `return Math.tan(parseInt(num))`,
  },
  { fnName: 'random', fnParams: [], fnBody: `return Math.random()` },
  {
    fnName: 'log',
    fnParams: ['num'],
    fnBody: `return Math.log(parseInt(num))`,
  },
  {
    fnName: 'log2',
    fnParams: ['num'],
    fnBody: `return Math.log2(parseInt(num))`,
  },
  {
    fnName: 'log10',
    fnParams: ['num'],
    fnBody: `return Math.log10(parseInt(num))`,
  },
];
