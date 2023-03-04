import AboutSvelte from "./routes/About.svelte";
import SearchSvelte from "./routes/Search.svelte";
import NotFoundSvelte from "./routes/NotFound.svelte";

export const routes = {
  "/search": SearchSvelte,
  "/about": AboutSvelte,
  "*": NotFoundSvelte
};