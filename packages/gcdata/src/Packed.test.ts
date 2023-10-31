import { Packed } from './Packed.js';
import { assert } from './assert.js';
import { objectToMap } from './util.js';

describe('Packed data', function () {
  it('can load packed data', async function () {
    const packed = await Packed.from('Crashlands2');
    assert(packed, 'Packed data should be loaded');

    const motes = objectToMap(packed.motes);
    assert(motes.size > 0, 'Packed data should have motes');

    const schemas = objectToMap(packed.schemas);
    assert(schemas.size > 0, 'Packed data should have schemas');
  });
});
