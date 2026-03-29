declare module "virtual:docs-content" {
  export interface DocPage {
    slug: string;
    title: string;
    body: string;
  }

  export const docs: DocPage[];
}
