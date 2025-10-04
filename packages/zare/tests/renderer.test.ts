import { ZareConfig } from '../lib/config';
import renderer from '../lib/core/renderer';
import { describe, it, expect } from 'vitest';

describe('renderer', () => {
  it('should render', () => {
    const testCode = `serve (
            <h1>Tested Code</h1>
        )`;
    const html = renderer(testCode, {}, '', new ZareConfig());
    expect(html).includes('<h1>Tested Code</h1>');
  });

  it('should escape characters', () => {
    const testCode = `serve (
            <h1>@(html)</h1>
        )`;
    const html = renderer(
      testCode,
      { html: '<h1>Heading</h1>' },
      '',
      new ZareConfig(),
    );

    expect(html).includes('<h1>&lt;h1&gt;Heading&lt;/h1&gt;</h1>');
  });

  it('should not escape characters', () => {
    const testCode = `serve (
            <h1>@(_.html)</h1>
        )`;
    const html = renderer(
      testCode,
      { html: '<h1>Heading</h1>' },
      '',
      new ZareConfig(),
    );

    expect(html).includes('<h1><h1>Heading</h1></h1>');
  });
});
