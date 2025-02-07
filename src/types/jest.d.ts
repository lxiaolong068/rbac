import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledBefore(mock: jest.Mock): R;
    }
  }
}

export {}; 