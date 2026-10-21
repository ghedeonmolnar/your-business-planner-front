import { ReactTestRenderer, ReactTestRendererJSON } from 'react-test-renderer';

const collectText = (node: ReactTestRendererJSON | string | null): string =>
  typeof node === 'string'
    ? node
    : (node?.children ?? []).map(collectText).join(' ');

export function renderedText(renderer: ReactTestRenderer) {
  const tree = renderer.toJSON();
  return (Array.isArray(tree) ? tree : [tree]).map(collectText).join(' ');
}
