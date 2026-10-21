import ReactTestRenderer from 'react-test-renderer';

const UI_WAIT_TIMEOUT_MS = 3_000;
const UI_WAIT_INTERVAL_MS = 10;

export async function waitForUi(assertion: () => void): Promise<void> {
  const deadline = Date.now() + UI_WAIT_TIMEOUT_MS;
  for (;;) {
    try {
      assertion();
      return;
    } catch (error) {
      if (Date.now() >= deadline) {
        throw error;
      }
    }
    await ReactTestRenderer.act(async () => {
      await new Promise<void>(resolve =>
        setTimeout(resolve, UI_WAIT_INTERVAL_MS),
      );
    });
  }
}
