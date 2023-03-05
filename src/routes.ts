import AboutSvelte from "./routes/About.svelte";
import SearchSvelte from "./routes/Search.svelte";
import ReportSvelte from "./routes/Report.svelte";
import CertificateSvelte from "./routes/Certificate.svelte";
import NotFoundSvelte from "./routes/NotFound.svelte";

export const routes = {
  "/": AboutSvelte,
  "/about": AboutSvelte,
  "/search": SearchSvelte,
  "/report": ReportSvelte,
  "/certificate": CertificateSvelte,
  "*": NotFoundSvelte
};