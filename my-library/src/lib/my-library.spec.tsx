import { render } from '@testing-library/react';

import MyLibrary from './my-library';

describe('MyLibrary', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MyLibrary />);
    expect(baseElement).toBeTruthy();
  });
});
