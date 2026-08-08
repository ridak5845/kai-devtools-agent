const { hashTopic } = require('../services/writer');

describe('hashTopic', () => {
  test('produces the same hash for the same URL', () => {
    const url = 'https://example.com/some-article';
    const hash1 = hashTopic(url);
    const hash2 = hashTopic(url);
    expect(hash1).toBe(hash2);
  });

  test('produces different hashes for different URLs', () => {
    const hash1 = hashTopic('https://example.com/article-one');
    const hash2 = hashTopic('https://example.com/article-two');
    expect(hash1).not.toBe(hash2);
  });

  test('is case-insensitive', () => {
    const hash1 = hashTopic('https://example.com/Article');
    const hash2 = hashTopic('https://EXAMPLE.com/article');
    expect(hash1).toBe(hash2);
  });

  test('trims whitespace before hashing', () => {
    const hash1 = hashTopic('https://example.com/article');
    const hash2 = hashTopic('  https://example.com/article  ');
    expect(hash1).toBe(hash2);
  });

  test('returns a valid MD5-length hex string', () => {
    const hash = hashTopic('https://example.com/test');
    expect(hash).toMatch(/^[a-f0-9]{32}$/);
  });
});