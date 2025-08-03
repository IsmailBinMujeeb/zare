export default [
  {
    fnName: 'getFullYear',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getFullYear()`,
  },
  {
    fnName: 'getMonth',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getMonth()`,
  },
  {
    fnName: 'getDate',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getDate()`,
  },
  {
    fnName: 'getHours',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getHours()`,
  },
  {
    fnName: 'getMin',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getMinutes()`,
  },
  {
    fnName: 'getSec',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getSeconds()`,
  },
  {
    fnName: 'getMs',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getMilliseconds()`,
  },
  {
    fnName: 'getDay',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getDay()`,
  },
  {
    fnName: 'getTime',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getTime()`,
  },
  { fnName: 'getNow', fnParams: [], fnBody: `return Date.now()` },
  {
    fnName: 'getUTCFullYear',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getUTCFullYear()`,
  },
  {
    fnName: 'getUTCMonth',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getUTCMonth()`,
  },
  {
    fnName: 'getUTCDate',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getUTCDate()`,
  },
  {
    fnName: 'getUTCHours',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getUTCHours()`,
  },
  {
    fnName: 'getUTCMin',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getUTCMinutes()`,
  },
  {
    fnName: 'getUTCSec',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getUTCSeconds()`,
  },
  {
    fnName: 'getUTCMs',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getUTCMilliseconds()`,
  },
  {
    fnName: 'getUTCDay',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getUTCDay()`,
  },
  {
    fnName: 'getTimezoneOffset',
    fnParams: ['date'],
    fnBody: `const d = new Date(date); return d.getTimezoneOffset()`,
  },
];
