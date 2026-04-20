import { AppProviders } from "./providers/AppProviders";
import { AppRouter } from "./router";

/** Mounts global providers around the route tree. */
export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
