import { type SchemaTypeDefinition } from "sanity";

import blockContent from "./schemas/blockContent";
import category from "./schemas/category";
import author from "./schemas/author";
import post from "./schemas/post";
import page from "./schemas/page";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [author, category, blockContent, post, page],
};
